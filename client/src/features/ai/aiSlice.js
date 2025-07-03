import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import aiService from "./aiService";

const initialState = {
    hint: '',
    isGenerating: false,
    isFetchingHint: false,
    isError: false,
    message: ''
};

export const generateTestcases = createAsyncThunk('ai/generateTestcases', async (data, thunkAPI) => {
    try {
        return await aiService.generateTestcases(data, thunkAPI);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || 'Failed to generate test cases';
        return thunkAPI.rejectWithValue(message);
    }
});

export const getDebugHint = createAsyncThunk('ai/getDebugHint', async (submissionId, thunkAPI) => {
    try {
        return await aiService.getDebugHint(submissionId, thunkAPI);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || 'Failed to fetch hint';
        return thunkAPI.rejectWithValue(message);
    }
});


export const aiSlice = createSlice({
    name: 'ai',
    initialState,
    reducers: {
        reset: (state) => {
            state.hint = '';
            state.isGenerating = false;
            state.isFetchingHint = false;
            state.isError = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(generateTestcases.pending, (state) => {
                state.isGenerating = true;
            })
            .addCase(generateTestcases.fulfilled, (state) => {
                state.isGenerating = false;
            })
            .addCase(generateTestcases.rejected, (state, action) => {
                state.isGenerating = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getDebugHint.pending, (state) => {
                state.isFetchingHint = true;
                state.hint = '';
            })
            .addCase(getDebugHint.fulfilled, (state, action) => {
                state.isFetchingHint = false;
                state.hint = action.payload.hint;
            })
            .addCase(getDebugHint.rejected, (state, action) => {
                state.isFetchingHint = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = aiSlice.actions;
export default aiSlice.reducer;