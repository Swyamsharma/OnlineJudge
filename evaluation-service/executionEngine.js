import Docker from 'dockerode';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const docker = new Docker();
const SHARED_VOLUME_PATH = path.join(process.cwd(), 'temp');
const sharedVolumeName = 'dev_code-temp-volume';
const memoryLimit = 256 * 1024 * 1024;
const timeout = 10000;

const demultiplexStream = (stream) => {
    return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        stream.on('data', (chunk) => {
            let offset = 0;
            while (offset < chunk.length) {
                const type = chunk[offset];
                if (type !== 1 && type !== 2) {
                    offset = chunk.length;
                    continue;
                }
                const length = chunk.readUInt32BE(offset + 4);
                offset += 8;
                const payload = chunk.slice(offset, offset + length).toString('utf8');
                if (type === 1) stdout += payload;
                else stderr += payload;
                offset += length;
            }
        });
        stream.on('end', () => resolve({ stdout, stderr }));
        stream.on('error', (err) => reject(err));
    });
};

async function createExec(container, cmd) {
    const exec = await container.exec({
        Cmd: cmd,
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: true,
    });
    const stream = await exec.start({ Tty: false, stdin: true, hijack: true });
    return { exec, stream };
}

async function runExecWithTimeout(exec, stream, input) {
    const execPromise = new Promise(async (resolve) => {
        if (input != null) {
            stream.write(input);
            stream.end();
        }
        const { stdout, stderr } = await demultiplexStream(stream);
        const { ExitCode } = await exec.inspect();
        resolve({ stdout, stderr, exitCode: ExitCode });
    });

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Time Limit Exceeded')), timeout)
    );

    return Promise.race([execPromise, timeoutPromise]);
}

async function setupAndCompile(language, code) {
    const uniqueDirName = `exec-${crypto.randomUUID()}`;
    const executionPath = path.join(SHARED_VOLUME_PATH, uniqueDirName);
    await fs.mkdir(executionPath, { recursive: true });

    const sourceFileName = language === 'cpp' ? 'main.cpp' : 'index.js';
    await fs.writeFile(path.join(executionPath, sourceFileName), code);

    const image = language === 'cpp' ? 'gcc' : 'node:alpine';

    const container = await docker.createContainer({
        Image: image,
        Tty: true,
        OpenStdin: true,
        Cmd: ['/bin/sh'],
        HostConfig: {
            Binds: [`${sharedVolumeName}:/app`],
            Memory: memoryLimit,
            CpuCount: 1,
            NetworkDisabled: true
        },
        WorkingDir: `/app/${uniqueDirName}`
    });

    await container.start();

    if (language === 'cpp') {
        const compileCommand = ['g++', sourceFileName, '-o', 'main', '-static'];
        const { exec, stream } = await createExec(container, compileCommand);
        const { stderr, exitCode } = await runExecWithTimeout(exec, stream, null);
        
        if (exitCode !== 0) {
            await container.stop({ t: 1 }).catch(() => {});
            await container.remove({ force: true }).catch(() => {});
            await fs.rm(executionPath, { recursive: true, force: true }).catch(() => {});
            return { error: 'Compilation Error', stderr };
        }
    }

    return { container, executionPath };
}

const normalizeOutput = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/\r\n/g, '\n');
};

export const executeSingleRun = async (language, code, input) => {
    let setupResult = null;
    try {
        setupResult = await setupAndCompile(language, code);
        if (setupResult.error) {
            return { verdict: setupResult.error, stderr: setupResult.stderr, output: '' };
        }

        const { container } = setupResult;
        const cmd = language === 'cpp' ? ['./main'] : ['node', 'index.js'];
        const { exec, stream } = await createExec(container, cmd);

        const { stdout, stderr, exitCode } = await runExecWithTimeout(exec, stream, input);

        if (exitCode === 137) {
            return { verdict: 'Memory Limit Exceeded', stderr: 'Process exceeded memory limits.', output: stdout };
        }
        if (exitCode !== 0) {
            return { verdict: 'Runtime Error', stderr: stderr || `Process exited with code ${exitCode}.`, output: stdout };
        }

        return { verdict: 'Success', output: normalizeOutput(stdout), stderr };
    } catch (err) {
        if (err.message === 'Time Limit Exceeded') {
            return { verdict: 'Time Limit Exceeded', output: '', stderr: 'Execution timed out.' };
        }
        console.error('[ExecutionEngine] An unexpected error occurred:', err);
        return { verdict: 'System Error', stderr: err.message };
    } finally {
        if (setupResult && setupResult.container) {
            await setupResult.container.stop({ t: 1 }).catch(() => {});
            await setupResult.container.remove({ force: true }).catch(() => {});
        }
        if (setupResult && setupResult.executionPath) {
            await fs.rm(setupResult.executionPath, { recursive: true, force: true }).catch(() => {});
        }
    }
}

export const executeCodeAgainstTestcases = async (language, code, testcases) => {
    let setupResult = null;
    try {
        setupResult = await setupAndCompile(language, code);
        if (setupResult.error) {
            return { verdict: setupResult.error, stderr: setupResult.stderr };
        }

        const { container } = setupResult;
        const cmd = language === 'cpp' ? ['./main'] : ['node', 'index.js'];

        for (const testcase of testcases) {
            const { exec, stream } = await createExec(container, cmd);
            const result = await runExecWithTimeout(exec, stream, testcase.input);
            
            if (result.exitCode !== 0) {
                if (result.exitCode === 137) return { verdict: 'Memory Limit Exceeded' };
                return { verdict: 'Runtime Error', stderr: result.stderr };
            }

            const actualOutput = normalizeOutput(result.stdout);
            const expectedOutput = normalizeOutput(testcase.expectedOutput);

            if (actualOutput !== expectedOutput) {
                return {
                    verdict: 'Wrong Answer',
                    failedTestCase: {
                        input: testcase.input,
                        expectedOutput: testcase.expectedOutput,
                        actualOutput: actualOutput,
                    }
                };
            }
        }
        return { verdict: 'Accepted', executionTime: 0, memoryUsed: 0 };
    } catch (err) {
        if (err.message === 'Time Limit Exceeded') {
            return { verdict: 'Time Limit Exceeded' };
        }
        console.error('[ExecutionEngine] Orchestration error:', err);
        return { verdict: 'System Error', stderr: err.message };
    } finally {
        if (setupResult && setupResult.container) {
            await setupResult.container.stop({ t: 1 }).catch(() => {});
            await setupResult.container.remove({ force: true }).catch(() => {});
        }
        if (setupResult && setupResult.executionPath) {
            await fs.rm(setupResult.executionPath, { recursive: true, force: true }).catch(() => {});
        }
    }
};

export const executeAndCollectResults = async (language, code, testcases) => {
    const results = [];
    let setupResult = null;
    try {
        setupResult = await setupAndCompile(language, code);
        if (setupResult.error) {
            results.push({ case: 1, verdict: setupResult.error, stderr: setupResult.stderr });
            return results;
        }

        const { container } = setupResult;
        const cmd = language === 'cpp' ? ['./main'] : ['node', 'index.js'];

        for (let i = 0; i < testcases.length; i++) {
            const testcase = testcases[i];
            const { exec, stream } = await createExec(container, cmd);
            const result = await runExecWithTimeout(exec, stream, testcase.input);
            
            let finalVerdict;
            if (result.exitCode !== 0) {
                finalVerdict = result.exitCode === 137 ? 'Memory Limit Exceeded' : 'Runtime Error';
            } else {
                finalVerdict = normalizeOutput(result.stdout) === normalizeOutput(testcase.expectedOutput) ? 'Passed' : 'Wrong Answer';
            }

            results.push({
                case: i + 1,
                input: testcase.input,
                expectedOutput: testcase.expectedOutput,
                actualOutput: result.stdout,
                verdict: finalVerdict,
                stderr: result.stderr,
            });
        }
    } catch (err) {
        let verdict = 'System Error';
        let stderr = err.message;
        if (err.message === 'Time Limit Exceeded') {
            verdict = 'Time Limit Exceeded';
            stderr = 'Execution timed out.';
        } else {
            console.error('[ExecutionEngine] Orchestration error:', err);
        }
        results.push({
            case: results.length + 1,
            verdict: verdict,
            stderr: stderr
        });
    } finally {
        if (setupResult && setupResult.container) {
            await setupResult.container.stop({ t: 1 }).catch(() => {});
            await setupResult.container.remove({ force: true }).catch(() => {});
        }
        if (setupResult && setupResult.executionPath) {
            await fs.rm(setupResult.executionPath, { recursive: true, force: true }).catch(() => {});
        }
    }
    return results;
};