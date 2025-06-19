import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email",
        ],
    },
    password: {
        type: String,
        required: [function(){ return !this.googleId;}, "Password is required"],
        minlength: [6,'Password must be at least 6 characters'],
        select: false,
    },
    googleId:{
        type: String,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
},
{
    timestamps: true,
});

//Middleware to hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
//Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
//Method to generate reset password token
userSchema.methods.getResetPasswordToken = function () {
    //Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");
    //Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    //Set expire time for token
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;