import Docker from 'dockerode';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const docker = new Docker();

// The path *inside the worker container* where the shared volume is mounted.
const SHARED_VOLUME_PATH = path.join(process.cwd(), 'temp');
const normalizeOutput = (str) => {
    if (typeof str !== 'string') return '';
    return str
        .trim()
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trim())
        .join('\n');
};
async function runInContainer(language, code, input) {
    const timeout = 5000;
    
    // Create a unique folder for this execution inside the shared volume path
    const uniqueDirName = `exec-${crypto.randomUUID()}`;
    const executionPath = path.join(SHARED_VOLUME_PATH, uniqueDirName);
    await fs.mkdir(executionPath, { recursive: true });

    let container;

    try {
        let config;
        const memoryLimit = 256 * 1024 * 1024;
        
        // This is the volume name defined in docker-compose.yml
        const sharedVolumeName = 'dev_code-temp-volume';

        if (language === 'cpp') {
            await fs.writeFile(path.join(executionPath, 'main.cpp'), code);
            config = {
                Image: 'gcc',
                Cmd: ['/bin/bash', '-c', `cd /app/${uniqueDirName} && g++ main.cpp -o main && ./main`],
                HostConfig: {
                    Binds: [`${sharedVolumeName}:/app`],
                    Memory: memoryLimit,
                    CpuCount: 1,
                    NetworkDisabled: true
                }
            };
        } else if (language === 'javascript') {
            await fs.writeFile(path.join(executionPath, 'index.js'), code);
            config = {
                Image: 'node:alpine',
                Cmd: ['node', `/app/${uniqueDirName}/index.js`],
                HostConfig: {
                    Binds: [`${sharedVolumeName}:/app`],
                    Memory: memoryLimit,
                    CpuCount: 1,
                    NetworkDisabled: true
                }
            };
        } else {
            return { verdict: 'System Error', stderr: `Language ${language} not supported.` };
        }

        container = await docker.createContainer({ ...config, AttachStdin: true, AttachStdout: true, AttachStderr: true, Tty: false, OpenStdin: true, StdinOnce: true });
        
        const stream = await container.attach({ stream: true, stdin: true, stdout: true, stderr: true });
        await container.start();
        stream.write(input || '');
        stream.end();

        const race = Promise.race([
            container.wait(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Time Limit Exceeded')), timeout))
        ]);
        const data = await race;
        
        const logBuffer = await container.logs({ follow: false, stdout: true, stderr: true });
        let stdout = '', stderr = '';
        let offset = 0;
        while (offset < logBuffer.length) {
            const type = logBuffer[offset];
            const length = logBuffer.readUInt32BE(offset + 4);
            offset += 8;
            const payload = logBuffer.slice(offset, offset + length).toString('utf8');
            if (type === 1) stdout += payload; else stderr += payload;
            offset += length;
        }

        if (stderr.includes('g++:') || stderr.includes('SyntaxError')) return { verdict: 'Compilation Error', stderr, output: stdout };
        if (data.StatusCode === 137) return { verdict: 'Memory Limit Exceeded', stderr: 'Process exceeded memory limits.', output: stdout };
        if (data.StatusCode !== 0) return { verdict: 'Runtime Error', stderr: stderr || `Process exited with code ${data.StatusCode}.`, output: stdout };
        
        return { verdict: 'Success', output: stdout, stderr, executionTime: 100, memoryUsed: 5120 };

    } catch (err) {
        if (err.message === 'Time Limit Exceeded') return { verdict: 'Time Limit Exceeded', output: '', stderr: 'Execution timed out.' };
        return { verdict: 'System Error', stderr: err.message };
    } finally {
        if (container) {
            await container.stop({t: 2}).catch(() => {});
            await container.remove({ force: true }).catch(() => {});
        }
        if(executionPath) {
            await fs.rm(executionPath, { recursive: true, force: true }).catch(() => {});
        }
    }
};

//to run against single custom input
export const executeSingleRun = async (language, code, input) => {
    return await runInContainer(language, code, input);
};
//to run against all test cases
export const executeCodeAgainstTestcases = async (language, code, testcases) => {
    let maxTime = 0, maxMemory = 0;
    for (const testcase of testcases) {
        const result = await runInContainer(language, code, testcase.input);
        if (result.verdict !== 'Success') return result;
         if (normalizeOutput(result.output) !== normalizeOutput(testcase.expectedOutput)) {
            return { verdict: 'Wrong Answer' };
        }
        if (result.executionTime > maxTime) maxTime = result.executionTime;
        if (result.memoryUsed > maxMemory) maxMemory = result.memoryUsed;
    }
    return { verdict: 'Accepted', executionTime: maxTime, memoryUsed: maxMemory };
};
//to run against sample test cases
export const executeAndCollectResults = async (language, code, testcases) => {
    const results = [];
    let caseNum = 1;
    for (const testcase of testcases) {
        const result = await runInContainer(language, code, testcase.input);
        
        let finalVerdict = result.verdict;
        if (result.verdict === 'Success') {
            const normalizedActual = normalizeOutput(result.output);
            const normalizedExpected = normalizeOutput(testcase.expectedOutput);
            finalVerdict = normalizedActual === normalizedExpected ? 'Passed' : 'Wrong Answer';
        }
        
        results.push({
            case: caseNum++,
            input: testcase.input,
            expectedOutput: testcase.expectedOutput,
            actualOutput: result.output,
            verdict: finalVerdict,
            stderr: result.stderr,
        });
    }
    return results;
};