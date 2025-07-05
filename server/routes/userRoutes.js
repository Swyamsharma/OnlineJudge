import express from 'express';
import { getDashboardStats, getUserProfile, updateUserProfile, changeUserPassword, getAllUsers, updateUserByAdmin, deleteUserByAdmin } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.put('/profile/change-password', protect, changeUserPassword);

router.get('/all', protect, admin, getAllUsers);

router.route('/admin/:id')
    .put(protect, admin, updateUserByAdmin)
    .delete(protect, admin, deleteUserByAdmin);

export default router;