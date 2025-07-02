import axios from "axios";
import mongoose from "mongoose";
import Problem from "../models/problemModel.js";
import Testcase from '../models/testcaseModel.js';
import { uploadToS3, deleteFromS3, downloadFromS3 } from "../utils/s3.js";

const splitTestcases = (testcases) => {
    const sampleCases = testcases.filter(tc => tc.isSample).map(({ input, expectedOutput, explanation }) => ({ input, expectedOutput, explanation }));
    const hiddenCases = testcases.filter(tc => !tc.isSample);
    return { sampleCases, hiddenCases };
};

// @desc    Create a new problem with test cases
// @route   POST /api/problems
// @access  Private (Admin)
export const createProblem = async (req, res) => {
    const { title, statement, difficulty, constraints, inputFormat, outputFormat, tags, testcases } = req.body;

    if (!testcases || !Array.isArray(testcases) || testcases.length === 0) {
        return res.status(400).json({ message: "A problem must have at least one test case." });
    }

    const { sampleCases, hiddenCases } = splitTestcases(testcases);

    try {
        const problem = await Problem.create({
            title, statement, difficulty, constraints, inputFormat, outputFormat, tags,
            sampleTestcases: sampleCases,
            addedBy: req.user._id
        });

        if (problem && hiddenCases.length > 0) {
            const hiddenTestcasesToCreate = await Promise.all(hiddenCases.map(async (tc) => {
                const testcaseId = new mongoose.Types.ObjectId();
                const inputKey = `testcases/${problem._id}/${testcaseId}/input.txt`;
                const outputKey = `testcases/${problem._id}/${testcaseId}/output.txt`;

                await Promise.all([
                    uploadToS3(inputKey, tc.input),
                    uploadToS3(outputKey, tc.expectedOutput)
                ]);

                return {
                    _id: testcaseId,
                    problemId: problem._id,
                    inputS3Key: inputKey,
                    outputS3Key: outputKey,
                    isSample: false
                };
            }));
            await Testcase.insertMany(hiddenTestcasesToCreate);
        }
        res.status(201).json(problem);
    } catch (error) {
        console.error("!!! FAILED TO CREATE PROBLEM !!!", error);
        res.status(500).json({ message: "Failed to create problem", error: error.message });
    }
};

// @desc    Get all problems (summary view)
// @route   GET /api/problems
// @access  Public
export const getProblems = async (req, res) => {
    try {
        const problems = await Problem.find({}).select("title difficulty tags");
        res.status(200).json(problems);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch problems", error: error.message });
    }
};

// @desc    Get a single problem by ID (with embedded sample cases)
// @route   GET /api/problems/:id
// @access  Public or Private (Admin gets more data)
export const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        
        if (req.user?.role === 'admin') {
            const problemObject = problem.toObject();

            const sampleCases = problemObject.sampleTestcases.map(tc => ({ ...tc, isSample: true }));

            const hiddenTestcases = await Testcase.find({ problemId: problem._id });

            const hydratedHiddenCases = await Promise.all(
                hiddenTestcases.map(async (tc) => {
                    const [input, expectedOutput] = await Promise.all([
                        downloadFromS3(tc.inputS3Key),
                        downloadFromS3(tc.outputS3Key)
                    ]);
                    return {
                        _id: tc._id,
                        input,
                        expectedOutput,
                        isSample: false,
                        explanation: tc.explanation || '',
                    };
                })
            );

            problemObject.testcases = [...sampleCases, ...hydratedHiddenCases];
            
            return res.status(200).json(problemObject);
        }

        res.status(200).json(problem);

    } catch (error) {
        res.status(500).json({ message: "Failed to fetch problem", error: error.message });
    }
};


// @desc    Update a problem and its test cases
// @route   PUT /api/problems/:id
// @access  Private (Admin)
export const updateProblem = async (req, res) => {
    const problemId = req.params.id;
    const { title, statement, difficulty, constraints, inputFormat, outputFormat, tags, testcases } = req.body;

    try {
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        
        const oldHiddenTestcases = await Testcase.find({ problemId });
        if (oldHiddenTestcases.length > 0) {
            const keysToDelete = oldHiddenTestcases.reduce((keys, tc) => {
                keys.push(tc.inputS3Key, tc.outputS3Key);
                return keys;
            }, []);
            await deleteFromS3(keysToDelete);
            await Testcase.deleteMany({ problemId });
        }
        
        const { sampleCases, hiddenCases } = splitTestcases(testcases);
        
        problem.title = title || problem.title;
        problem.statement = statement || problem.statement;
        problem.difficulty = difficulty || problem.difficulty;
        problem.constraints = constraints || problem.constraints;
        problem.inputFormat = inputFormat || problem.inputFormat;
        problem.outputFormat = outputFormat || problem.outputFormat;
        problem.tags = tags || problem.tags;
        problem.sampleTestcases = sampleCases;
        
        const updatedProblem = await problem.save();
        
        if (hiddenCases.length > 0) {
            const hiddenTestcasesToCreate = await Promise.all(hiddenCases.map(async (tc) => {
                const testcaseId = new mongoose.Types.ObjectId();
                const inputKey = `testcases/${problem._id}/${testcaseId}/input.txt`;
                const outputKey = `testcases/${problem._id}/${testcaseId}/output.txt`;

                await Promise.all([ uploadToS3(inputKey, tc.input), uploadToS3(outputKey, tc.expectedOutput) ]);

                return { _id: testcaseId, problemId: problem._id, inputS3Key: inputKey, outputS3Key: outputKey, isSample: false };
            }));
            await Testcase.insertMany(hiddenTestcasesToCreate);
        }

        res.status(200).json(updatedProblem);
    } catch (error) {
        res.status(400).json({ message: "Failed to update problem", error: error.message });
    }
};


// @desc    Delete a problem and its associated test cases (from DB and S3)
// @route   DELETE /api/problems/:id
// @access  Private (Admin)
export const deleteProblem = async (req, res) => {
    try {
        const problemId = req.params.id;
        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        const hiddenTestcases = await Testcase.find({ problemId: problemId });
        if (hiddenTestcases && hiddenTestcases.length > 0) {
            const s3KeysToDelete = hiddenTestcases.reduce((keys, tc) => {
                keys.push(tc.inputS3Key, tc.outputS3Key);
                return keys;
            }, []);
            console.log(`Preparing to delete ${s3KeysToDelete.length} hidden test case objects from S3...`);
            await deleteFromS3(s3KeysToDelete);
        }

        await Testcase.deleteMany({ problemId: problemId });
        await problem.deleteOne();

        res.status(200).json({ message: "Problem and associated test cases deleted successfully" });
    } catch (error) {
        console.error("Failed to delete problem:", error);
        res.status(500).json({ message: "Failed to delete problem", error: error.message });
    }
};

// @desc    Run code against custom input (unaffected by the schema change)
// @route   POST /api/problems/run
// @access  Private
export const runCode = async (req, res) => {
    const { language, code, input } = req.body;
    const EVALUATION_SERVICE_URL = process.env.EVALUATION_SERVICE_URL || 'http://localhost:5001/run';

    try {
        const response = await axios.post(EVALUATION_SERVICE_URL, { language, code, input }, { timeout: 15000 });
        res.status(200).json(response.data);
    } catch (error) {
        const status = error.response?.status || 503;
        const data = error.response?.data || { error: 'Service Unavailable' };
        res.status(status).json(data);
    }
};

// @desc    Run code against sample test cases (unaffected by the schema change, still useful for pre-submission checks)
// @route   POST /api/problems/:id/run-samples
// @access  Private
export const runSampleTests = async (req, res) => {
    const { language, code } = req.body;
    const { id: problemId } = req.params;
    const EVALUATION_SERVICE_BASE_URL = process.env.EVALUATION_SERVICE_URL || 'http://localhost:5001';

    try {
        const problem = await Problem.findById(problemId).select('sampleTestcases');
        
        if (!problem || !problem.sampleTestcases || problem.sampleTestcases.length === 0) {
            return res.status(200).json({ message: "No sample testcases available to run." });
        }
        
        const payload = {
            language,
            code,
            testcases: problem.sampleTestcases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput }))
        };

        const response = await axios.post(`${EVALUATION_SERVICE_BASE_URL}/run-multiple`, payload, { timeout: 30000 });
        res.status(200).json(response.data);

    } catch (error) {
        const status = error.response?.status || 503;
        const data = error.response?.data || { verdict: 'Service Error', stderr: 'The evaluation service is down or timed out.' };
        res.status(status).json(data);
    }
};