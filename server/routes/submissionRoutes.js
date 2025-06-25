import express from 'express';
import { createSubmission, getUserSubmissionsForProblem } from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createSubmission).get(protect, getUserSubmissionsForProblem);

export default router;