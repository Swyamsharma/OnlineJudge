import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        user = await User.create({ name, email, password });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select("+password");
        if(user && (await user.matchPassword(password))) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
// @access  Public
export const googleAuthCallback = (req, res) => {
    const user = req.user;
    const token = generateToken(user._id);
    res.redirect(`${process.env.CLIENT_URL}/login/success?token=${token}`);
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user){
        return res.status(200).json({ message: "If the email exists, you will receive a reset link" });
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = `Hello ${user.name},\n\nYou requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n\nThank you!`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            message,
        });
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending email:", error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        res.status(500).json({ message: "Email could not be sent", error: error.message });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        console.log('Incoming reset token from params:', req.params.resettoken);
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex");
        console.log('Hashed token for DB search:', resetPasswordToken);

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        
        console.log('User found for token:', user ? user.email : 'No user found');

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: "Password has been reset successfully",
            token: generateToken(user._id),
        });
        
    } catch (error) {
        console.error("Error in resetPassword controller:", error);
        res.status(500).json({ message: "Server error", error: error.message });
        
    }
};

// @desc    Get current user's profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = (req, res) => {
    res.status(200).json(req.user);
};
