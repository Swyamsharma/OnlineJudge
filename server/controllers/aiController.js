import axios from 'axios';
import Submission from '../models/submissionModel.js';
import Problem from '../models/problemModel.js';
import { downloadFromS3 } from '../utils/s3.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5002';

export const proxyGenerateTestcases = async (req, res) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/generate-testcases`, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Proxy to AI service for test cases failed:", error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: "Error proxying to AI service" });
    }
};

export const proxyDebugSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }
        if (submission.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        if (submission.verdict !== 'Wrong Answer' || !submission.failedTestCase) {
            return res.status(400).json({ message: 'This submission is not eligible for a hint.' });
        }
        
        const [code, problem] = await Promise.all([
            downloadFromS3(submission.codeS3Key),
            Problem.findById(submission.problemId).select('statement')
        ]);

        const payload = {
            code,
            language: submission.language,
            failedTestCase: submission.failedTestCase,
            problemStatement: problem.statement
        };

        const response = await axios.post(`${AI_SERVICE_URL}/api/debug-wrong-answer`, payload);
        res.status(200).json(response.data);

    } catch (error) {
        console.error("Proxy to AI service for debugging failed:", error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: "Error proxying to AI service for debugging" });
    }
};