import Submission from '../models/submissionModel.js';
import Problem from '../models/problemModel.js';
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile (non-password fields)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.username = req.body.username || user.username;

        try {
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                token: generateToken(updatedUser._id),
            });
        } catch (error) {
            if (error.code === 11000) { // Mongoose duplicate key error
                const field = Object.keys(error.keyValue)[0];
                return res.status(400).json({ message: `An account with that ${field} already exists.` });
            }
            if (error.name === 'ValidationError') {
                 const messages = Object.values(error.errors).map(val => val.message);
                 return res.status(400).json({ message: messages.join('. ') });
            }
            res.status(400).json({ message: "Failed to update profile", error: error.message });
        }
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};


// @desc    Change user password
// @route   PUT /api/users/profile/change-password
// @access  Private
export const changeUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Please provide both current and new passwords." });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
        return res.status(401).json({ message: "Incorrect current password." });
    }

    user.password = newPassword;
    try {
        await user.save();
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
       }
       res.status(500).json({ message: 'Server error while changing password', error: error.message });
    }
};


// @desc    Get user dashboard statistics
// @route   GET /api/users/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const allUserSubmissions = await Submission.find({ userId })
            .populate('problemId', 'difficulty title');

        const totalProblemsByDifficulty = await Problem.aggregate([
            { $group: { _id: '$difficulty', count: { $sum: 1 } } }
        ]);

        const totalProblems = { Easy: 0, Medium: 0, Hard: 0 };
        totalProblemsByDifficulty.forEach(group => {
            if (totalProblems.hasOwnProperty(group._id)) {
                totalProblems[group._id] = group.count;
            }
        });

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const submissionsLastYear = allUserSubmissions.filter(sub => sub.submittedAt >= oneYearAgo);
        submissionsLastYear.sort((a, b) => b.submittedAt - a.submittedAt);
        
        const activityByDate = {};
        submissionsLastYear.forEach(sub => {
            const dateStr = sub.submittedAt.toISOString().split('T')[0];
            activityByDate[dateStr] = (activityByDate[dateStr] || 0) + 1;
        });

        const activeDates = Object.keys(activityByDate).sort();
        let maxStreak = 0;
        let currentStreak = 0;
        if (activeDates.length > 0) {
            currentStreak = 1;
            maxStreak = 1;
            for (let i = 1; i < activeDates.length; i++) {
                const currentDate = new Date(activeDates[i]);
                const prevDate = new Date(activeDates[i-1]);
                const diffTime = currentDate - prevDate;
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    currentStreak++;
                } else {
                    maxStreak = Math.max(maxStreak, currentStreak);
                    currentStreak = 1;
                }
            }
            maxStreak = Math.max(maxStreak, currentStreak);
        }

        const totalSubmissions = allUserSubmissions.length;
        const acceptedSubmissions = allUserSubmissions.filter(s => s.verdict === 'Accepted');

        const solvedProblemIds = new Set();
        const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 };

        acceptedSubmissions.forEach(sub => {
            if (sub.problemId && sub.problemId._id) { 
                const problemIdString = sub.problemId._id.toString();
                if (!solvedProblemIds.has(problemIdString)) {
                    solvedProblemIds.add(problemIdString);
                    if (sub.problemId.difficulty) {
                        difficultyCount[sub.problemId.difficulty]++;
                    }
                }
            }
        });

        const problemsSolved = solvedProblemIds.size;
        const acceptanceRate = totalSubmissions > 0 ? ((acceptedSubmissions.length / totalSubmissions) * 100).toFixed(1) : 0;
        
        const activityData = Object.keys(activityByDate).map(date => ({
            date,
            count: activityByDate[date],
        }));

        const recentSubmissions = submissionsLastYear.slice(0, 5).map(s => ({
            _id: s._id,
            problemTitle: s.problemId.title,
            problemId: s.problemId._id,
            verdict: s.verdict,
            submittedAt: s.submittedAt,
            language: s.language,
        }));
        
        res.status(200).json({
            stats: {
                problemsSolved,
                totalSubmissions,
                acceptanceRate,
                easySolved: difficultyCount.Easy,
                mediumSolved: difficultyCount.Medium,
                hardSolved: difficultyCount.Hard,
                yearlySubmissions: submissionsLastYear.length,
                activeDays: activeDates.length,
                maxStreak,
                totalProblems,
            },
            activity: activityData,
            recentSubmissions,
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Server error while fetching dashboard data" });
    }
};

// @desc    Get all users (admin)
// @route   GET /api/users/all
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 }).select('_id name username email role createdAt');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

// @desc    Update a user by ID (admin)
// @route   PUT /api/users/admin/:id
// @access  Private (Admin)
export const updateUserByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.user._id.toString() === user._id.toString() && req.body.role && req.body.role !== 'admin') {
            return res.status(400).json({ message: 'You cannot revoke your own admin role.' });
        }

        user.role = req.body.role || user.role;

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to update user', error: error.message });
        console.error("Update User Error:", error);
    }
};

// @desc    Delete a user by ID (admin)
// @route   DELETE /api/users/admin/:id
// @access  Private (Admin)
export const deleteUserByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (req.user._id.toString() === user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own account.' });
        }

        await user.deleteOne();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};