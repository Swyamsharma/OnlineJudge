import express from 'express';
import { getProblems, getProblemById, createProblem, updateProblem, deleteProblem } from '../controllers/problemController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProblems);
// router.get('/:id', getProblemById);
router.get('/:id', protect, getProblemById);
router.post('/', protect, admin, createProblem);
router.put('/:id', protect, admin, updateProblem);
router.delete('/:id', protect, admin, deleteProblem);

export default router;