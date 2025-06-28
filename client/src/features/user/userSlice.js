import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from './userService';

const initialState = {
    dashboardData: null,
    isLoading: true,
    isError: false,
    message: ''
};

export const getDashboardStats = createAsyncThunk('user/dashboard', async (_, thunkAPI) => {
    try {
        return await userService.getDashboardStats(thunkAPI);
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getDashboardStats.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getDashboardStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.dashboardData = action.payload;
            })
            .addCase(getDashboardStats.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.dashboardData = null;
            });
    }
});

export const { reset } = userSlice.actions;
export default userSlice.reducer;