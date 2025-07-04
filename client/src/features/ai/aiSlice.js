import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import aiService from "./aiService";

const initialState = {
    hint: '',
    analysis: null,
    isGenerating: false,
    isFetchingHint: false,
    isFetchingAnalysis: false,
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

export const getHint = createAsyncThunk('ai/getHint', async (submissionId, thunkAPI) => {
    try {
        return await aiService.getHint(submissionId, thunkAPI);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || 'Failed to fetch hint';
        return thunkAPI.rejectWithValue(message);
    }
});

export const getAnalysis = createAsyncThunk('ai/getAnalysis', async (submissionId, thunkAPI) => {
    try {
        return await aiService.getAnalysis(submissionId, thunkAPI);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || 'Failed to fetch analysis';
        return thunkAPI.rejectWithValue(message);
    }
});


export const aiSlice = createSlice({
    name: 'ai',
    initialState,
    reducers: {
        reset: (state) => {
            state.hint = '';
            state.analysis = null;
            state.isGenerating = false;
            state.isFetchingHint = false;
            state.isFetchingAnalysis = false;
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
            .addCase(getHint.pending, (state) => {
                state.isFetchingHint = true;
                state.hint = '';
            })
            .addCase(getHint.fulfilled, (state, action) => {
                state.isFetchingHint = false;
                state.hint = action.payload.hint;
            })
            .addCase(getHint.rejected, (state, action) => {
                state.isFetchingHint = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getAnalysis.pending, (state) => {
                state.isFetchingAnalysis = true;
                state.analysis = null;
            })
            .addCase(getAnalysis.fulfilled, (state, action) => {
                state.isFetchingAnalysis = false;
                state.analysis = action.payload.analysis;
            })
            .addCase(getAnalysis.rejected, (state, action) => {
                state.isFetchingAnalysis = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset } = aiSlice.actions;
export default aiSlice.reducer;