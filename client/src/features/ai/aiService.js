import axios from '../../api/axios';

const API_URL = '/api/ai';

const getTokenConfig = (thunkAPI) => ({
    headers: { Authorization: `Bearer ${thunkAPI.getState().auth.user.token}` }
});

const generateTestcases = async (problemData, thunkAPI) => {
    const response = await axios.post(`${API_URL}/generate-testcases`, problemData, getTokenConfig(thunkAPI));
    return response.data;
};

const getHint = async (submissionId, thunkAPI) => {
    const response = await axios.post(`${API_URL}/hint/${submissionId}`, {}, getTokenConfig(thunkAPI));
    return response.data;
};

const getAnalysis = async (submissionId, thunkAPI) => {
    const response = await axios.post(`${API_URL}/analysis/${submissionId}`, {}, getTokenConfig(thunkAPI));
    return response.data;
};

const aiService = {
    generateTestcases,
    getHint,
    getAnalysis,
};
export default aiService;