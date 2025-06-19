import axios from 'axios';

const API_URL = '/api/auth/';

// Register user
const register = async (userData) => {
    const response = await axios.post(API_URL + 'register', userData);
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

// Login user
const login = async (userData) => {
    const response = await axios.post(API_URL + 'login', userData);
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

// Logout user
const logout = () => {
    localStorage.removeItem('user');
};

// Forgot password
const forgotPassword = async (email) => {
    const response = await axios.post(API_URL + 'forgotpassword', { email });
    return response.data;
};

// Reset password
const resetPassword = async (data) => {
    const {token, password} = data;
    const response = await axios.put(API_URL + `resetpassword/${token}`, { password });
    return response.data;
};

const authService = {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
};

export default authService;