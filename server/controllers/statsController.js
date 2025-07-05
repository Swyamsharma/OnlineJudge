import Problem from '../models/problemModel.js';
import User from '../models/userModel.js';
import Submission from '../models/submissionModel.js';

export const getPublicStats = async (req, res) => {
    try {
        const [totalProblems, totalUsers, totalSubmissions] = await Promise.all([
            Problem.countDocuments(),
            User.countDocuments(),
            Submission.countDocuments()
        ]);

        res.status(200).json({
            totalProblems,
            totalUsers,
            totalSubmissions
        });

    } catch (error) {
        console.error("Error fetching public stats:", error);
        res.status(500).json({ message: "Server error while fetching platform statistics." });
    }
};