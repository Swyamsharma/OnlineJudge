import Submission from '../models/submissionModel.js';
import Problem from '../models/problemModel.js';

// @desc    Get user dashboard statistics
// @route   GET /api/users/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
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

        const submissions = await Submission.find({ 
            userId,
            submittedAt: { $gte: oneYearAgo } 
        }).populate('problemId', 'difficulty title').sort({ submittedAt: -1 });

        const activityByDate = {};
        submissions.forEach(sub => {
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

        const allSubmissions = await Submission.find({ userId });
        const totalSubmissions = allSubmissions.length;
        const acceptedSubmissions = allSubmissions.filter(s => s.verdict === 'Accepted');

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

        const recentSubmissions = submissions.slice(0, 5).map(s => ({
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
                yearlySubmissions: submissions.length,
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