import axios from 'axios';
const API_URL = '/api/submissions';

const getTokenConfig = (thunkAPI) => ({
    headers: { Authorization: `Bearer ${thunkAPI.getState().auth.user.token}` }
});

const createSubmission = async (submissionData, thunkAPI) => {
    const response = await axios.post(API_URL, submissionData, getTokenConfig(thunkAPI));
    return response.data;
};

const getSubmissions = async (problemId, thunkAPI) => {
    const response = await axios.get(`${API_URL}?problemId=${problemId}`, getTokenConfig(thunkAPI));
    return response.data;
}

const getSubmissionDetail = async(submissionId, thunkAPI) => {
    const response = await axios.get(`${API_URL}/${submissionId}`, getTokenConfig(thunkAPI));
    return response.data;
}

const submissionService = { createSubmission, getSubmissions, getSubmissionDetail };
export default submissionService;