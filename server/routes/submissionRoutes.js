import express from 'express';
import { createSubmission, getUserSubmissionsForProblem, getSubmissionById, getAllSubmissions, deleteSubmission } from '../controllers/submissionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createSubmission)
    .get(protect, getUserSubmissionsForProblem);

router.route('/all')
    .get(protect, admin, getAllSubmissions);
router.route('/:id')
    .get(protect, getSubmissionById)
    .delete(protect, admin, deleteSubmission);

export default router;