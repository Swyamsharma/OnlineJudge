import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
    },
    statement: {
        type: String,
        required: [true, "Statement is required"],
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: [true, "Difficulty is required"],
    },
    constraints: {
        type: String,
        required: [true, "Constraints are required"],
        inputFormat: {
            type: String,
            required: [true, "Input format is required"],
        },
        outputFormat: {
            type: String,
            required: [true, "Output format is required"],
        },
    },
    tags: [{
        type: String,
        trim: true,
    }],
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
}, {
    timestamps: true,
});

const Problem = mongoose.model("Problem", problemSchema);
export default Problem;