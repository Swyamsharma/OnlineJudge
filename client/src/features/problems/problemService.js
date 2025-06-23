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

const updateProblem = async (problemData, thunkAPI) => {
    const config = {
        headers: {  
            Authorization: `Bearer ${getToken(thunkAPI)}`
        }
    };
    const { id, ...dataToUpdate } = problemData;
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, dataToUpdate, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message || error.message);
    }
};

const deleteProblem = async (problemId, thunkAPI) => {
    const config = {
        headers: {
            Authorization: `Bearer ${getToken(thunkAPI)}`
        }
    };
    try {
        const response = await axios.delete(`${API_BASE_URL}/${problemId}`, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message || error.message);
    }
};

const runCode = async (runData, thunkAPI) => {
    const config = {
        headers: {
            Authorization: `Bearer ${thunkAPI.getState().auth.user.token}`
        }
    };
    const response = await axios.post(`${API_BASE_URL}/run`, runData, config);
    return response.data;
};

const problemService = {
    createProblem,
    getProblems,
    getProblem,
    updateProblem,
    deleteProblem,
    runCode
};
export default problemService;
