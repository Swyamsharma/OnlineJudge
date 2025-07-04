import axios from 'axios';
import Submission from '../models/submissionModel.js';
import Problem from '../models/problemModel.js';
import { downloadFromS3 } from '../utils/s3.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5002';
const HINTABLE_VERDICTS = ['Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded'];

export const proxyGenerateTestcases = async (req, res) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/api/generate-testcases`, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Proxy to AI service for test cases failed:", error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: "Error proxying to AI service" });
    }
};

export const getHintForSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }
        if (submission.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        if (!HINTABLE_VERDICTS.includes(submission.verdict)) {
            return res.status(400).json({ message: 'This submission is not eligible for a hint.' });
        }
        
        if (submission.aiHint) {
            return res.status(200).json({ hint: submission.aiHint });
        }

        const [code, problem] = await Promise.all([
            downloadFromS3(submission.codeS3Key),
            Problem.findById(submission.problemId).select('statement')
        ]);

        const payload = {
            code,
            language: submission.language,
            problemStatement: problem.statement,
            verdict: submission.verdict,
            failedTestCase: submission.verdict === 'Wrong Answer' ? submission.failedTestCase : undefined,
        };

        const response = await axios.post(`${AI_SERVICE_URL}/api/get-hint`, payload);
        const { hint } = response.data;

        submission.aiHint = hint;
        await submission.save();

        res.status(200).json({ hint });

    } catch (error) {
        console.error("Proxy to AI service for hint failed:", error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: "Error proxying to AI service for hint" });
    }
};

export const getAnalysisForSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const submission = await Submission.findById(submissionId);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found.' });
        }
        if (submission.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        if (submission.verdict !== 'Accepted') {
            return res.status(400).json({ message: 'Only accepted submissions can be analyzed.' });
        }

        if (submission.aiAnalysis && submission.aiAnalysis.complexity) {
            return res.status(200).json({ analysis: submission.aiAnalysis });
        }

        const [code, problem] = await Promise.all([
            downloadFromS3(submission.codeS3Key),
            Problem.findById(submission.problemId).select('statement')
        ]);

        const payload = {
            code,
            language: submission.language,
            problemStatement: problem.statement,
        };

        const response = await axios.post(`${AI_SERVICE_URL}/api/analyze-code`, payload);
        const { analysis } = response.data;

        submission.aiAnalysis = analysis;
        await submission.save();

        res.status(200).json({ analysis });

    } catch (error) {
        console.error("Proxy to AI service for analysis failed:", error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { message: "Error proxying to AI service for analysis" });
    }
};