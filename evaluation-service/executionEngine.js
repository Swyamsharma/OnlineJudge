import Docker from 'dockerode';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const docker = new Docker();
const SHARED_VOLUME_PATH = path.join(process.cwd(), 'temp');

const getContainerLogs = async (container) => {
    const logBuffer = await container.logs({ follow: false, stdout: true, stderr: true });
    let stdout = '', stderr = '';
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
    return { stdout, stderr };
};

async function runInContainer(language, code, input) {
    const timeout = 10000; 
    const uniqueDirName = `exec-${crypto.randomUUID()}`;
    const executionPath = path.join(SHARED_VOLUME_PATH, uniqueDirName);
    await fs.mkdir(executionPath, { recursive: true });

    let container;
    const sharedVolumeName = 'dev_code-temp-volume'; 
    const memoryLimit = 256 * 1024 * 1024; 

    try {
        const inputFileName = 'input.txt';
        await fs.writeFile(path.join(executionPath, inputFileName), input || '');

        let image, cmd;

        if (language === 'cpp') {
            image = 'gcc';
            const sourceFileName = 'main.cpp';
            await fs.writeFile(path.join(executionPath, sourceFileName), code);
            cmd = ['/bin/sh', '-c', `g++ /app/${uniqueDirName}/${sourceFileName} -o /app/${uniqueDirName}/main && /app/${uniqueDirName}/main < /app/${uniqueDirName}/${inputFileName}`];
        } else if (language === 'javascript') {
            image = 'node:alpine';
            const sourceFileName = 'index.js';
            await fs.writeFile(path.join(executionPath, sourceFileName), code);
            cmd = ['/bin/sh', '-c', `node /app/${uniqueDirName}/${sourceFileName} < /app/${uniqueDirName}/${inputFileName}`];
        } else {
            return { verdict: 'System Error', stderr: `Language ${language} not supported.` };
        }

        container = await docker.createContainer({
            Image: image,
            Cmd: cmd,
            HostConfig: {
                Binds: [`${sharedVolumeName}:/app`],
                Memory: memoryLimit,
                CpuCount: 1,
                NetworkDisabled: true
            }
        });

        await container.start();

        const executionPromise = container.wait();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Time Limit Exceeded')), timeout));
        
        const result = await Promise.race([executionPromise, timeoutPromise]);
        const { stdout, stderr } = await getContainerLogs(container);

        if (stderr.toLowerCase().includes('error:')) {
            return { verdict: 'Compilation Error', stderr, output: stdout };
        }
        if (result.StatusCode !== 0) {
            if (result.StatusCode === 137) {
                return { verdict: 'Memory Limit Exceeded', stderr: 'Process exceeded memory limits.', output: stdout };
            }
            return { verdict: 'Runtime Error', stderr: stderr || `Process exited with code ${result.StatusCode}.`, output: stdout };
        }
        
        const normalizeOutput = (str) => str.trim().replace(/\r\n/g, '\n');
        return { verdict: 'Success', output: normalizeOutput(stdout), stderr };

    } catch (err) {
        if (err.message === 'Time Limit Exceeded') {
            return { verdict: 'Time Limit Exceeded', output: '', stderr: 'Execution timed out.' };
        }
        console.error('[ExecutionEngine] An unexpected error occurred:', err);
        return { verdict: 'System Error', stderr: err.message };
    } finally {
        if (container) {
            try {
                await container.stop({ t: 1 }).catch(() => {});
                await container.remove({ force: true }).catch(() => {});
            } catch (e) {
            }
        }
        if (executionPath) {
            await fs.rm(executionPath, { recursive: true, force: true }).catch(() => {});
        }
    }
}

const normalizeOutput = (str) => {
    if (typeof str !== 'string') return '';
    return str
        .trim()
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trim())
        .join('\n');
};

export const executeSingleRun = async (language, code, input) => {
    return await runInContainer(language, code, input);
};

export const executeCodeAgainstTestcases = async (language, code, testcases) => {
    let maxTime = 0, maxMemory = 0;
    for (const testcase of testcases) {
        const result = await runInContainer(language, code, testcase.input);
        if (result.verdict !== 'Success') {
            return result; 
        }
        if (normalizeOutput(result.output) !== normalizeOutput(testcase.expectedOutput)) {
            return { 
                verdict: 'Wrong Answer',
                failedTestCase: {
                    input: testcase.input,
                    expectedOutput: testcase.expectedOutput,
                    actualOutput: result.output,
                }
            };
        }
    }
    return { verdict: 'Accepted', executionTime: maxTime, memoryUsed: maxMemory };
};

export const executeAndCollectResults = async (language, code, testcases) => {
    const results = [];
    let caseNum = 1;
    for (const testcase of testcases) {
        const result = await runInContainer(language, code, testcase.input);
        
        let finalVerdict = result.verdict;
        if (result.verdict === 'Success') {
            finalVerdict = normalizeOutput(result.output) === normalizeOutput(testcase.expectedOutput) ? 'Passed' : 'Wrong Answer';
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