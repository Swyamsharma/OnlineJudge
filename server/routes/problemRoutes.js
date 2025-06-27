import express from 'express';
import { getProblems, getProblemById, createProblem, updateProblem, deleteProblem, runCode, runSampleTests } from '../controllers/problemController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/', getProblems);
router.post('/', protect, admin, createProblem);
router.post('/run', protect, runCode);
router.post('/:id/run-samples', protect, runSampleTests);
router.get('/:id', getProblemById);
router.put('/:id', protect, admin, updateProblem);
router.delete('/:id', protect, admin, deleteProblem);

export default router;