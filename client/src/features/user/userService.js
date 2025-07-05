import axios from '../../api/axios';

const API_URL = '/api/users/';

const getTokenConfig = (thunkAPI) => ({
    headers: {
        Authorization: `Bearer ${thunkAPI.getState().auth.user.token}`
    }
});

const getDashboardStats = async (thunkAPI) => {
    const response = await axios.get(API_URL + 'dashboard', getTokenConfig(thunkAPI));
    return response.data;
};

const getUserProfile = async (thunkAPI) => {
    const response = await axios.get(API_URL + 'profile', getTokenConfig(thunkAPI));
    return response.data;
};

const updateUserProfile = async (userData, thunkAPI) => {
    const response = await axios.put(API_URL + 'profile', userData, getTokenConfig(thunkAPI));
    return response.data;
}

const changeUserPassword = async (passwordData, thunkAPI) => {
    const response = await axios.put(API_URL + 'profile/change-password', passwordData, getTokenConfig(thunkAPI));
    return response.data;
}

const getAllUsers = async (thunkAPI) => {
    const response = await axios.get(API_URL + 'all', getTokenConfig(thunkAPI));
    return response.data;
};

const updateUserByAdmin = async ({ userId, userData }, thunkAPI) => {
    const response = await axios.put(API_URL + `admin/${userId}`, userData, getTokenConfig(thunkAPI));
    return response.data;
};

const deleteUserByAdmin = async (userId, thunkAPI) => {
    const response = await axios.delete(API_URL + `admin/${userId}`, getTokenConfig(thunkAPI));
    return response.data;
};

const userService = {
    getDashboardStats,
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
    getAllUsers,
    updateUserByAdmin,
    deleteUserByAdmin,
};

export default userService;