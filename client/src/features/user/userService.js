import axios from '../../api/axios';

const API_URL = '/api/users/';

const getToken = (thunkAPI) => {
    return thunkAPI.getState().auth.user.token;
};

// Get user dashboard data
const getDashboardStats = async (thunkAPI) => {
    const config = {
        headers: {
            Authorization: `Bearer ${getToken(thunkAPI)}`
        }
    };
    const response = await axios.get(API_URL + 'dashboard', config);
    return response.data;
};

const userService = {
    getDashboardStats,
};

export default userService;