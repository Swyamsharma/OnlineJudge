import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from './userService';
import { loginSuccess } from "../auth/authSlice";

const initialState = {
    dashboardData: null,
    profileData: null,
    isLoading: true,
    isUpdating: false,
    isChangingPassword: false,
    isError: false,
    message: ''
};

export const getDashboardStats = createAsyncThunk('user/dashboard', async (_, thunkAPI) => {
    try {
        return await userService.getDashboardStats(thunkAPI);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || 'Failed to get dashboard data.';
        return thunkAPI.rejectWithValue(message);
    }
});

export const getUserProfile = createAsyncThunk('user/getProfile', async (_, thunkAPI) => {
    try {
        return await userService.getUserProfile(thunkAPI);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || 'Failed to get profile data.';
        return thunkAPI.rejectWithValue(message);
    }
});

export const updateUserProfile = createAsyncThunk('user/updateProfile', async (userData, thunkAPI) => {
    try {
        const updatedUser = await userService.updateUserProfile(userData, thunkAPI);
        // After successful update, update the auth state as well
        thunkAPI.dispatch(loginSuccess(updatedUser));
        return updatedUser;
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || 'Failed to update profile.';
        return thunkAPI.rejectWithValue(message);
    }
});

export const changeUserPassword = createAsyncThunk('user/changePassword', async (passwordData, thunkAPI) => {
    try {
        return await userService.changeUserPassword(passwordData, thunkAPI);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || 'Failed to change password.';
        return thunkAPI.rejectWithValue(message);
    }
});


export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isUpdating = false;
            state.isChangingPassword = false;
            state.isError = false;
            state.message = '';
        },
        resetProfile: (state) => {
            state.profileData = null;
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
            })
            .addCase(getUserProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profileData = action.payload;
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.profileData = null;
            })
            .addCase(updateUserProfile.pending, (state) => {
                state.isUpdating = true;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.profileData = action.payload; // Also update profile data in this slice
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.isUpdating = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(changeUserPassword.pending, (state) => {
                state.isChangingPassword = true;
            })
            .addCase(changeUserPassword.fulfilled, (state) => {
                state.isChangingPassword = false;
            })
            .addCase(changeUserPassword.rejected, (state, action) => {
                state.isChangingPassword = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset, resetProfile } = userSlice.actions;
export default userSlice.reducer;