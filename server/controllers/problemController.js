import axios from "axios";
import Problem from "../models/problemModel.js";
import Testcase from "../models/testcaseModel.js";

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

// @desc    Update a problem and its test cases
// @route   PUT /api/problems/:id
// @access  Private (Admin)
export const updateProblem = async (req, res) => {
    const { title, statement, difficulty, constraints, inputFormat, outputFormat, tags, testcases } = req.body;
    try {
        const problem = await Problem.findById(req.params.id);
        if(problem){
            problem.title = title || problem.title;
            problem.statement = statement || problem.statement;
            problem.difficulty = difficulty || problem.difficulty;
            problem.constraints = constraints || problem.constraints;
            problem.inputFormat = inputFormat || problem.inputFormat;
            problem.outputFormat = outputFormat || problem.outputFormat;
            problem.tags = tags || problem.tags;

            const updatedProblem = await problem.save();

            if (testcases && testcases.length > 0) {
                await Testcase.deleteMany({problemId: problem._id});
                const testcasesToCreate = testcases.map(tc => ({
                    ...tc,
                    problemId: problem._id
                }));
                await Testcase.insertMany(testcasesToCreate);
            }
            res.status(200).json(updatedProblem);
        }
        else {
            res.status(404).json({
                message: "Problem not found"
            });
        }
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to update problem",
            error: error.message
        });
    }
};

// @desc    Delete a problem and its test cases
// @route   DELETE /api/problems/:id
// @access  Private (Admin)
export const deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if(problem){
            await Testcase.deleteMany({problemId: problem._id});
            await problem.deleteOne();
            res.status(200).json({
                message: "Problem deleted successfully"
            });
        } else {
            res.status(404).json({
                message: "Problem not found"
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete problem",
            error: error.message
        });
    }
};

// @desc    Run code against custom input
// @route   POST /api/problems/run
// @access  Private
export const runCode = async (req, res, next) => {
    const { language, code, input } = req.body;
    const EVALUATION_SERVICE_URL = process.env.EVALUATION_SERVICE_URL || 'http://localhost:5001/run';

    try {
        const response = await axios.post(EVALUATION_SERVICE_URL, {
            language,
            code,
            input
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error calling evaluation service:", error.message);
        res.status(503).json({ 
            error: 'Service Unavailable',
            message: 'The code evaluation service is temporarily down. Please try again later.' 
        });
    }
};