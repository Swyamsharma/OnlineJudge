import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { proxyGenerateTestcases, proxyDebugSubmission } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-testcases', protect, admin, proxyGenerateTestcases);
router.post('/debug-submission/:submissionId', protect, proxyDebugSubmission);

export default router;