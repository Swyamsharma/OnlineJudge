import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from './userService';
import { loginSuccess } from "../auth/authSlice";

const initialState = {
    dashboardData: null,
    profileData: null,
    adminUsers: [],
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

export const getAllUsers = createAsyncThunk('user/admin/getAll', async (_, thunkAPI) => {
    try {
        return await userService.getAllUsers(thunkAPI);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || 'Failed to fetch users.';
        return thunkAPI.rejectWithValue(message);
    }
});

export const updateUserByAdmin = createAsyncThunk('user/admin/update', async (data, thunkAPI) => {
    try {
        return await userService.updateUserByAdmin(data, thunkAPI);
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || 'Failed to update user.';
        return thunkAPI.rejectWithValue(message);
    }
});

export const deleteUserByAdmin = createAsyncThunk('user/admin/delete', async (userId, thunkAPI) => {
    try {
        await userService.deleteUserByAdmin(userId, thunkAPI);
        return userId;
    } catch (error) {
        const message = (error.response?.data?.message) || error.message || 'Failed to delete user.';
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
                state.profileData = action.payload;
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
            })
            .addCase(getAllUsers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.adminUsers = action.payload;
            })
            .addCase(getAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateUserByAdmin.pending, (state) => {
                state.isUpdating = true;
            })
            .addCase(updateUserByAdmin.fulfilled, (state, action) => {
                state.isUpdating = false;
                const index = state.adminUsers.findIndex(u => u._id === action.payload._id);
                if (index !== -1) {
                    state.adminUsers[index] = action.payload;
                }
            })
            .addCase(updateUserByAdmin.rejected, (state, action) => {
                state.isUpdating = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(deleteUserByAdmin.pending, (state) => {
                state.isUpdating = true;
            })
            .addCase(deleteUserByAdmin.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.adminUsers = state.adminUsers.filter(u => u._id !== action.payload);
            })
            .addCase(deleteUserByAdmin.rejected, (state, action) => {
                state.isUpdating = false;
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { reset, resetProfile } = userSlice.actions;
export default userSlice.reducer;