import axios from '../../api/axios';

const API_URL = '/api/ai';

const getTokenConfig = (thunkAPI) => ({
    headers: { Authorization: `Bearer ${thunkAPI.getState().auth.user.token}` }
});

const generateTestcases = async (problemData, thunkAPI) => {
    const response = await axios.post(`${API_URL}/generate-testcases`, problemData, getTokenConfig(thunkAPI));
    return response.data;
};

const getDebugHint = async (submissionId, thunkAPI) => {
    const response = await axios.post(`${API_URL}/debug-submission/${submissionId}`, {}, getTokenConfig(thunkAPI));
    return response.data;
};

const aiService = {
    generateTestcases,
    getDebugHint,
};
export default aiService;