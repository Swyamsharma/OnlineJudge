import axios from 'axios';
const API_BASE_URL = '/api/problems';

const getToken = (thunkAPI) => {
    return thunkAPI.getState().auth.user.token;
};

const createProblem = async (problemData, thunkAPI) => {
    const config = {
        headers: {
            Authorization: `Bearer ${getToken(thunkAPI)}`
        }
    };
    try {
        const response = await axios.post(API_BASE_URL, problemData, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message || error.message);
    }
};

const getProblems = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    } catch (error) {
        throw new Error(error.response.data.message || error.message);
    }
}

const getProblem = async (problemId, thunkAPI) => {
    const token = thunkAPI.getState().auth.user?.token;
    const config = {};
    if(token){
        config.headers = {
            Authorization: `Bearer ${token}`
        };
    }
    try {
        const response = await axios.get(`${API_BASE_URL}/${problemId}`, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message || error.message);
    }
}

const problemService = {
    createProblem,
    getProblems,
    getProblem,
};
export default problemService;
