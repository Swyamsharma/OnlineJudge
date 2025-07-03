import express from 'express';
import cors from 'cors';
import amqp from 'amqplib';
import mongoose from 'mongoose';
import Submission from './models/submissionModel.js'; 
import Testcase from './models/testcaseModel.js';
import Problem from './models/problemModel.js';
import { executeSingleRun, executeCodeAgainstTestcases, executeAndCollectResults } from './executionEngine.js';
import { downloadFromS3 } from './utils/s3.js';

const { MONGODB_URI, RABBITMQ_URI, RESULT_EXCHANGE } = process.env;
const PORT = process.env.EVAL_PORT || 5001;
const SUBMISSION_QUEUE = 'submission_queue';

async function startWorker() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('[EvalSvc-Worker] DB Connected.');
        const connection = await amqp.connect(RABBITMQ_URI);
        const channel = await connection.createChannel();
        await channel.assertQueue(SUBMISSION_QUEUE, { durable: true });
        await channel.assertExchange(RESULT_EXCHANGE, 'fanout', { durable: false });
        channel.prefetch(1);
        console.log('[EvalSvc-Worker] Waiting for submission jobs.');
channel.consume(SUBMISSION_QUEUE, async (msg) => {
    if (!msg) return;
    const { submissionId } = JSON.parse(msg.content.toString());
    console.log(`[EvalSvc-Worker] Received job for submissionId: ${submissionId}`);

    try {
        const submission = await Submission.findById(submissionId).populate('problemId', 'sampleTestcases');

        if (!submission) {
            throw new Error(`FATAL: Submission document with ID ${submissionId} not found in the database.`);
        }
        if (!submission.problemId) {
            throw new Error(`FATAL: Could not populate problemId for submission ${submissionId}. The problem may have been deleted.`);
        }

        const sampleTestcases = submission.problemId.sampleTestcases || [];

        const hiddenTestcasesFromDB = await Testcase.find({ problemId: submission.problemId._id });

        const hiddenTestcasesWithContent = await Promise.all(
            hiddenTestcasesFromDB.map(async (tc) => {
                const [input, expectedOutput] = await Promise.all([
                    downloadFromS3(tc.inputS3Key),
                    downloadFromS3(tc.outputS3Key),
                ]);
                return { input, expectedOutput };
            })
        );
        
        const allTestcases = [...sampleTestcases, ...hiddenTestcasesWithContent];
        if (allTestcases.length === 0) {
            throw new Error(`No testcases (sample or hidden) found for problem ${submission.problemId._id}`);
        }

        const code = await downloadFromS3(submission.codeS3Key);
        
        const result = await executeCodeAgainstTestcases(submission.language, code, allTestcases);
        
        await Submission.findByIdAndUpdate(submissionId, { verdict: result.verdict, executionTime: result.executionTime, memoryUsed: result.memoryUsed, failedTestCase: result.failedTestCase });
        const resultMsg = JSON.stringify({ submissionId: submission._id, userId: submission.userId, verdict: result.verdict });
        channel.publish(process.env.RESULT_EXCHANGE, '', Buffer.from(resultMsg));
        console.log(`[EvalSvc-Worker] Finished job for ${submissionId}, verdict: ${result.verdict}`);

    } catch (err) {
        console.error(`[EvalSvc-Worker] An error occurred on submission ${submissionId}:`, err); 
        await Submission.findByIdAndUpdate(submissionId, { verdict: 'System Error' }).catch(e => console.error("Failed to update submission with System Error:", e));
        const { userId } = await Submission.findById(submissionId).select('userId').lean();
        if (userId) {
            const resultMsg = JSON.stringify({ submissionId, userId, verdict: 'System Error' });
            channel.publish(process.env.RESULT_EXCHANGE, '', Buffer.from(resultMsg));
        }
    } finally {
        channel.ack(msg);
    }
});
    } catch (err) {
        console.error('[EvalSvc-Worker] Startup failed, retrying in 5s...', err);
        setTimeout(startWorker, 5000);
    }
}

function startApiServer() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.post('/run', async (req, res) => {
        const { language, code, input } = req.body;
        const result = await executeSingleRun(language, code, input);
        res.status(200).json(result);
    });
    app.post('/run-multiple', async (req, res) => {
        const { language, code, testcases } = req.body;
        if (!language || typeof code === 'undefined' || !Array.isArray(testcases)) {
            return res.status(400).json({ message: 'Missing language, code, or testcases array.' });
        }
        const results = await executeAndCollectResults(language, code, testcases);
        res.status(200).json(results);
    });
    app.listen(PORT, () => console.log(`[EvalSvc-API] Listening on port ${PORT}`));
}

startWorker();
startApiServer();