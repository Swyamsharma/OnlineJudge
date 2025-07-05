import Submission from '../models/submissionModel.js';
import { getChannel } from '../config/rabbitmq.js';
import { uploadToS3, downloadFromS3, deleteFromS3 } from '../utils/s3.js';

export const getUserSubmissionsForProblem = async (req, res) => {
    const { problemId } = req.query;
    try {
        const submissions = await Submission.find({ userId: req.user._id, problemId }).sort({ submittedAt: -1 }).select("language verdict submittedAt executionTime memoryUsed");
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch submissions" });
    }
};

export const getSubmissionById = async (req, res) => {
     try {
        const submission = await Submission.findById(req.params.id).lean();

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }
        if (submission.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this submission.' });
        }
        const code = await downloadFromS3(submission.codeS3Key);
        submission.code = code;

        res.status(200).json(submission);

    } catch (error) {
        console.error("Error fetching submission detail:", error);
        res.status(500).json({ message: 'Failed to fetch submission details.' });
    }
}

export const createSubmission = async (req, res) => {
    const { problemId, language, code } = req.body;
    console.log(`[API Server] Received submission for problemId: ${problemId}`);
    try {
        const tempSubmission = new Submission();
        const submissionId = tempSubmission._id;

        const codeS3Key = `submissions/${req.user._id}/${problemId}/${submissionId}.${language}`;

        await uploadToS3(codeS3Key, code);

        const submission = await Submission.create({
            _id: submissionId,
            userId: req.user._id,
            problemId,
            language,
            codeS3Key, 
            verdict: "Pending"
        });

        const channel = getChannel();
        const queue = 'submission_queue';
        const msg = JSON.stringify({ submissionId: submission._id.toString() });

        channel.sendToQueue(queue, Buffer.from(msg), { persistent: true });
        
        console.log(`[API Server] Successfully queued job for submissionId: ${submission._id}`);

        const fullSubmission = await Submission.findById(submission._id).select("language verdict submittedAt executionTime memoryUsed");
        res.status(202).json(fullSubmission);
    } catch (error) {
        console.error("[API Server] FAILED to queue submission:", error);
        res.status(500).json({ message: "Failed to queue submission" });
    }
};

export const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ userId: req.user._id })
            .select('problemId verdict');
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user submission summary." });
    }
};

export const getAllSubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({})
            .sort({ submittedAt: -1 })
            .populate('userId', 'name email')
            .populate('problemId', 'title')
            .limit(100);
        res.status(200).json(submissions);
    } catch (error) {
        console.error("Failed to fetch all submissions:", error);
        res.status(500).json({ message: "Failed to fetch all submissions", error: error.message });
    }
};

export const deleteSubmission = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id);

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        if (submission.codeS3Key) {
            await deleteFromS3([submission.codeS3Key]);
        }

        await submission.deleteOne();

        res.status(200).json({ message: "Submission deleted successfully" });
    } catch (error) {
        console.error("Failed to delete submission:", error);
        res.status(500).json({ message: "Failed to delete submission", error: error.message });
    }
};