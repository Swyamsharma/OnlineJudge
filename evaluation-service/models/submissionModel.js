import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    codeS3Key: { type: String, required: true },
    language: { type: String, required: true },
    verdict: {
        type: String,
        enum: ["Pending", "Accepted", "Wrong Answer", "Time Limit Exceeded", "Memory Limit Exceeded", "Compilation Error", "Runtime Error", "System Error"],
        default: "Pending",
    },
    executionTime: { type: Number },
    memoryUsed: { type: Number },
    failedTestCase: {
        type: {
            input: String,
            expectedOutput: String,
            actualOutput: String
        },
        required: false
    }
}, { timestamps: { createdAt: 'submittedAt' } });

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;