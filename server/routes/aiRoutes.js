import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { proxyGenerateTestcases, getHintForSubmission, getAnalysisForSubmission } from '../controllers/aiController.js';

const router = express.Router();
router.post('/generate-testcases', protect, admin, proxyGenerateTestcases);
router.post('/hint/:submissionId', protect, getHintForSubmission);
router.post('/analysis/:submissionId', protect, getAnalysisForSubmission);

export default router;