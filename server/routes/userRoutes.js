import express from 'express';
import { getDashboardStats, getUserProfile, updateUserProfile, changeUserPassword } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.put('/profile/change-password', protect, changeUserPassword);

export default router;