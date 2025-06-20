import Problem from "../models/problemModel";
import Testcase from "../models/testcaseModel";

// @desc    Create a new problem with test cases
// @route   POST /api/problems
// @access  Private (Admin)
export const createProblem = async (req, res) => {
    const { title, statement, difficulty, constraints, inputFormat, outputFormat, tags, testcases } = req.body;

    try {
        const problem = await Problem.create({
            title,
            statement,
            difficulty,
            constraints,
            inputFormat,
            outputFormat,
            tags,
            addedBy: req.user._id 
        });

        if (problem && testcases && testcases.length > 0) {
            const testcasesToCreate = testcases.map(tc => ({
                ...tc,
                problemId: problem._id
            }));

            await Testcase.insertMany(testcasesToCreate);
        }
        res.status(201).json(problem);
    } catch (error) {
        res.status(400).json({
            message: "Failed to create problem",
            error: error.message
        });
    }
};

// @desc    Get all problems
// @route   GET /api/problems
// @access  Public
export const getProblems = async (req, res) => {
    try {
        const problems = await Problem.find({}).select("title difficulty tags");
        res.status(200).json(problems);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch problems",
            error: error.message
        });
    }
};

// @desc    Get a single problem by ID
// @route   GET /api/problems/:id
// @access  Public
export const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if(problem){
            const query = {problemId: problem._id};
            if(req.user?.role !== 'admin'){
                query.isSample = true;
            }
            const testcases = await Testcase.find(query);
            res.status(200).json({ ...problem.toObject(), testcases });
        } else {
            res.status(404).json({
                message: "Problem not found"
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch problem",
            error: error.message
        });
    }
};


