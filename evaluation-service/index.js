import express from 'express';
import cors from 'cors';
import amqp from 'amqplib';
import mongoose from 'mongoose';
import Submission from './models/submissionModel.js'; 
import Testcase from './models/testcaseModel.js';
import { executeSingleRun, executeCodeAgainstTestcases, executeAndCollectResults } from './executionEngine.js';

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
            try {
                const submission = await Submission.findById(submissionId);
                const testcases = await Testcase.find({ problemId: submission.problemId });
                const result = await executeCodeAgainstTestcases(submission.language, submission.code, testcases);
                await Submission.findByIdAndUpdate(submissionId, { verdict: result.verdict, executionTime: result.executionTime, memoryUsed: result.memoryUsed });
                const resultMsg = JSON.stringify({ submissionId: submission._id, userId: submission.userId, verdict: result.verdict });
                channel.publish(RESULT_EXCHANGE, '', Buffer.from(resultMsg));
            } catch (err) {
                await Submission.findByIdAndUpdate(submissionId, { verdict: 'System Error' }).catch(()=>{});
                console.error(`[EvalSvc-Worker] Error on ${submissionId}:`, err);
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