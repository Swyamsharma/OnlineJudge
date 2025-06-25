import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import problemReducer from "../features/problems/problemSlice";
import submissionReducer from "../features/submissions/submissionSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        problem: problemReducer,
        submission: submissionReducer,
    },
});
