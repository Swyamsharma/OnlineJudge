import mongoose from "mongoose";

const testcaseSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true
    },
    inputS3Key: {
        type: String,
        required: [true, "Input S3 Key is required"]
    },
    outputS3Key: {
        type: String,
        required: [true, "Expected Output S3 Key is required"]
    },
    isSample: {
        type: Boolean,
        default: false
    },
    explanation: {
        type: String,
    },
});

const Testcase = mongoose.model("Testcase", testcaseSchema);
export default Testcase;