import Submission from '../models/submissionModel.js';
import { getChannel } from '../config/rabbitmq.js';

export const getUserSubmissionsForProblem = async (req, res) => {
    const { problemId } = req.query;
    try {
        const submissions = await Submission.find({ userId: req.user._id, problemId }).sort({ submittedAt: -1 }).select("language verdict submittedAt");
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch submissions" });
    }
};

export const createSubmission = async (req, res) => {
    const { problemId, language, code } = req.body;
    console.log(`[API Server] Received submission for problemId: ${problemId}`);
    try {
        const submission = await Submission.create({ userId: req.user._id, problemId, language, code, verdict: "Pending" });
        
        const channel = getChannel();
        const queue = 'submission_queue';
        const msg = JSON.stringify({ submissionId: submission._id.toString() });

        channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });
        
        console.log(`[API Server] Successfully queued job for submissionId: ${submission._id}`);

        res.status(202).json(submission);
    } catch (error) {
        console.error("[API Server] FAILED to queue submission:", error);
        res.status(500).json({ message: "Failed to queue submission" });
    }
};