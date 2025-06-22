import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import problemService from "./problemService";

const initialState = {
    problems: [],
    problem: {},
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
};

// Create a problem
export const createProblem = createAsyncThunk(
    "problem/create",
    async (problemData, thunkAPI) => {
        try {
            return await problemService.createProblem(problemData, thunkAPI);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get all problems
export const getProblems = createAsyncThunk(
    "problem/getAll",
    async (_, thunkAPI) => {
        try {
            return await problemService.getProblems();
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get a single problem by ID
export const getProblem = createAsyncThunk(
    "problem/getOne",
    async (problemId, thunkAPI) => {
        try {
            return await problemService.getProblem(problemId, thunkAPI);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Update a problem
export const updateProblem = createAsyncThunk(
    "problem/update",
    async (problemData, thunkAPI) => {
        try {
            return await problemService.updateProblem(problemData, thunkAPI);
        } catch (error) {
            const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const problemSlice = createSlice({
    name: "problem",
    initialState,
    reducers: {
        reset: (state) => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(createProblem.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createProblem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // state.problems.push(action.payload);
            })
            .addCase(createProblem.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getProblems.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProblems.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.problems = action.payload;
            })
            .addCase(getProblems.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getProblem.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProblem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.problem = action.payload;
            })
            .addCase(getProblem.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateProblem.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateProblem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
            })
            .addCase(updateProblem.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset } = problemSlice.actions;
export default problemSlice.reducer;