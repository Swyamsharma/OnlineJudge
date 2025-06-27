import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import submissionService from "./submissionService";

const initialState = { 
    submissions: [], 
    selectedSubmission: null,
    isSubmitting: false, 
    isFetching: false,
    isFetchingDetail: false, 
    isError: false, 
    message: "" 
};

export const createSubmission = createAsyncThunk("submissions/create", async (data, thunkAPI) => {
    try { return await submissionService.createSubmission(data, thunkAPI); }
    catch (error) { return thunkAPI.rejectWithValue(error.response?.data?.message || "Submission failed"); }
});

export const getSubmissions = createAsyncThunk("submissions/getAll", async (problemId, thunkAPI) => {
    try { return await submissionService.getSubmissions(problemId, thunkAPI); }
    catch (error) { return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch submissions"); }
});

export const getSubmissionDetail = createAsyncThunk("submissions/getDetail", async (submissionId, thunkAPI) => {
    try { return await submissionService.getSubmissionDetail(submissionId, thunkAPI); }
    catch (error) { return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch submission details"); }
});

export const submissionSlice = createSlice({
    name: "submission",
    initialState,
    reducers: {
        reset: (state) => {
            state.submissions = [];
            state.selectedSubmission = null;
            state.isSubmitting = false;
            state.isFetching = false;
            state.isFetchingDetail = false;
            state.isError = false;
            state.message = "";
        },
        resetSelected: (state) => {
            state.selectedSubmission = null;
        },
        updateSubmission: (state, action) => {
            const updatedSub = action.payload;
            const index = state.submissions.findIndex(s => s._id === updatedSub._id);
            if (index !== -1) {
                state.submissions[index] = { ...state.submissions[index], ...updatedSub };
            }
            if (state.selectedSubmission && state.selectedSubmission._id === updatedSub._id) {
                state.selectedSubmission = { ...state.selectedSubmission, ...updatedSub };
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
            .addCase(getSubmissions.rejected, (state, action) => { state.isFetching = false; state.isError = true; state.message = action.payload; })
            .addCase(getSubmissionDetail.pending, (state) => { state.isFetchingDetail = true; })
            .addCase(getSubmissionDetail.fulfilled, (state, action) => {
                state.isFetchingDetail = false;
                state.selectedSubmission = action.payload;
            })
            .addCase(getSubmissionDetail.rejected, (state, action) => {
                state.isFetchingDetail = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset, resetSelected, updateSubmission } = submissionSlice.actions;
export default submissionSlice.reducer;