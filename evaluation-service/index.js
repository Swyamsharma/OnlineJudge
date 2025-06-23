import express from 'express';
import cors from 'cors';
import Docker from 'dockerode';

const app = express();
app.use(cors());
app.use(express.json());

const docker = new Docker();
const executeCode = async (language, code, input) => {
    console.log('[Exec] Starting execution for language:', language);
    const timeout = 8000;
    const cppScript = `
cat <<'EOF' > main.cpp
${code.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$")}
EOF
g++ main.cpp -o main && ./main
`;

    const imageMap = {
        'cpp': { image: 'gcc', cmd: ['/bin/bash', '-c', cppScript] },
        'javascript': { image: 'node:alpine', cmd: ['node', '-e', code] },
    };

    const langConfig = imageMap[language];
    if (!langConfig) throw new Error(`Language ${language} is not supported.`);

    let container;
    try {
        container = await docker.createContainer({
            Image: langConfig.image,
            Cmd: langConfig.cmd,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: false,
            OpenStdin: true,
            StdinOnce: true,
            HostConfig: { Memory: 256 * 1024 * 1024, CpuCount: 1 }
        });

        const stream = await container.attach({ stream: true, stdin: true, stdout: true, stderr: true });
        
        await container.start();

        stream.write(input || '');
        stream.end();
        const data = await container.wait();
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
            if (type === 1) {
                stdout += payload;
            } else {
                stderr += payload;
            }
            offset += length;
        }

        if (statusCode !== 0) {
            if (stderr.includes('error:')) {
                return { output: stdout, verdict: 'Compilation Error', stderr: stderr };
            } else {
                return { output: stdout, verdict: 'Runtime Error', stderr: stderr };
            }
        } else {
            return { output: stdout, verdict: 'Success', stderr: stderr };
        }

    } catch (err) {
        console.error("Error during Docker operation:", err);
        throw err;
    } finally {
        if (container) {
            await container.remove({ force: true }).catch(err => console.error("Failed to remove container:", err.message));
        }
    }
};

app.post('/run',async (req, res) => {
    console.log('[EvalSvc] /run endpoint hit');
    const { language, code, input } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required.' });

    const result = await executeCode(language, code, input);
    res.status(200).json(result);
});

const errorHandler = (err, req, res, next) => {
    console.error('--- EVALUATION SERVICE ERROR HANDLER ---');
    console.error(err);
    console.error('--- END EVALUATION SERVICE ERROR HANDLER ---');

    res.status(500).json({
        error: 'Evaluation Service Internal Error',
        message: err.message,
        stack: err.stack,
    });
};
app.use(errorHandler);

const PORT = process.env.EVAL_PORT || 5001;
app.listen(PORT, () => {
    console.log(`Evaluation service listening on port ${PORT}`);
});