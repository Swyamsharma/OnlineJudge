import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import submissionService from "./submissionService";

const initialState = { submissions: [], isSubmitting: false, isFetching: false, isError: false, message: "" };

export const createSubmission = createAsyncThunk("submissions/create", async (data, thunkAPI) => {
    try { return await submissionService.createSubmission(data, thunkAPI); }
    catch (error) { return thunkAPI.rejectWithValue(error.response?.data?.message || "Submission failed"); }
});

export const getSubmissions = createAsyncThunk("submissions/getAll", async (problemId, thunkAPI) => {
    try { return await submissionService.getSubmissions(problemId, thunkAPI); }
    catch (error) { return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch submissions"); }
});

export const submissionSlice = createSlice({
    name: "submission",
    initialState,
    reducers: {
        reset: (state) => initialState,
        updateSubmission: (state, action) => {
            const index = state.submissions.findIndex(s => s._id === action.payload._id);
            if (index !== -1) {
                state.submissions[index].verdict = action.payload.verdict;
            } else { // If it's a new pending submission, add it
                state.submissions.unshift(action.payload);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createSubmission.pending, (state) => { state.isSubmitting = true; })
            .addCase(createSubmission.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.submissions.unshift(action.payload); 
            })
            .addCase(createSubmission.rejected, (state, action) => { state.isSubmitting = false; state.isError = true; state.message = action.payload; })
            .addCase(getSubmissions.pending, (state) => { state.isFetching = true; })
            .addCase(getSubmissions.fulfilled, (state, action) => { state.isFetching = false; state.submissions = action.payload; })
            .addCase(getSubmissions.rejected, (state, action) => { state.isFetching = false; state.isError = true; state.message = action.payload; });
    }
});

export const { reset, updateSubmission } = submissionSlice.actions;
export default submissionSlice.reducer;