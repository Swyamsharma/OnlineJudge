import express from 'express';
import cors from 'cors';
import Docker from 'dockerode';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const docker = new Docker();

const executeCode = async (language, code, input) => {
    console.log(`[Exec] Starting execution for language: ${language}`);

    const timeout = 8000;

    const tempDir = path.join('/tmp', `code-execution-${crypto.randomUUID()}`);
    await fs.mkdir(tempDir, { recursive: true });

    let container;

    try {
        let containerConfig;

        if (language === 'cpp') {
            const codeFilePath = path.join(tempDir, 'main.cpp');
            await fs.writeFile(codeFilePath, code);

            const cmd = ['/bin/bash', '-c', 'cd /app && g++ main.cpp -o /tmp/main && /tmp/main'];

            containerConfig = {
                Image: 'gcc',
                Cmd: cmd,
                HostConfig: {
                    Binds: [`${tempDir}:/app:ro`],
                    Memory: 256 * 1024 * 1024,
                    CpuCount: 1,
                },
            };

        } else if (language === 'javascript') {
            const codeFilePath = path.join(tempDir, 'index.js');
            await fs.writeFile(codeFilePath, code);

            const cmd = ['node', '/app/index.js'];

            containerConfig = {
                Image: 'node:alpine',
                Cmd: cmd,
                HostConfig: {
                    Binds: [`${tempDir}:/app:ro`],
                    Memory: 256 * 1024 * 1024,
                    CpuCount: 1,
                },
            };
        } else {
            throw new Error(`Language ${language} is not supported.`);
        }

        container = await docker.createContainer({
            ...containerConfig,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
            OpenStdin: true,
            StdinOnce: true,
        });

        const stream = await container.attach({ stream: true, stdin: true, stdout: true, stderr: true });

        await container.start();

        stream.write(input || '');
        stream.end();

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Time Limit Exceeded')), timeout)
        );

        const executionPromise = container.wait();
        const data = await Promise.race([executionPromise, timeoutPromise]);

        const statusCode = data.StatusCode;
        const logBuffer = await container.logs({ follow: false, stdout: true, stderr: true });
        let stdout = '';
        let stderr = '';
        let offset = 0;
        while (offset < logBuffer.length) {
            const type = logBuffer[offset];
            const length = logBuffer.readUInt32BE(offset + 4);
            offset += 8;
            const payload = logBuffer.slice(offset, offset + length).toString('utf8');
            if (type === 1) stdout += payload;
            else stderr += payload;
            offset += length;
        }
        if (statusCode !== 0) {
            if (stderr.includes('g++:') || stderr.includes('SyntaxError')) {
                return { output: stdout, verdict: 'Compilation Error', stderr };
            }
            return { output: stdout, verdict: 'Runtime Error', stderr };
        } else {
            return { output: stdout, verdict: 'Success', stderr };
        }

    } catch (err) {
        console.error("Error during Docker operation:", err);
        if (err.message === 'Time Limit Exceeded') {
            return { output: '', stderr: 'Execution timed out.', verdict: 'Time Limit Exceeded' };
        }
        throw err;
    } finally {
        if (container) {
            await container.remove({ force: true }).catch(err => console.error("Failed to remove container:", err.message));
        }
        await fs.rm(tempDir, { recursive: true, force: true }).catch(err => console.error("Failed to remove temp directory:", err.message));
        console.log(`[Exec] Cleaned up resources for execution in ${tempDir}`);
    }
};

app.post('/run', async (req, res) => {
    console.log('[EvalSvc] /run endpoint hit');
    const { language, code, input } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'Language and code are required.' });
    }

    try {
        const result = await executeCode(language, code, input);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            error: 'Evaluation Failed',
            message: error.message,
            verdict: 'System Error'
        });
    }
});

const PORT = process.env.EVAL_PORT || 5001;
app.listen(PORT, () => {
    console.log(`Evaluation service listening on port ${PORT}`);
});