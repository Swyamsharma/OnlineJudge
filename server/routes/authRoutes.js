import express from 'express';
import passport from 'passport';
import { registerUser, loginUser, googleAuthCallback, forgotPassword, resetPassword, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', {session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }), googleAuthCallback);
router.get('/me', protect, getMe);
export default router;
