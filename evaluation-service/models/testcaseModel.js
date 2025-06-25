import mongoose from "mongoose";

const testcaseSchema = new mongoose.Schema({
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true
    },
    input: {
        type: String,
        required: [true, "Input is required"]
    },
    expectedOutput: {
        type: String,
        required: [true, "Expected output is required"]
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
