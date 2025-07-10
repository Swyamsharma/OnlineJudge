import axios from 'axios';
import { store } from '../store/store';
import { logout, reset } from '../features/auth/authSlice';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const axiosInstance = axios.create({
    baseURL: API_BASE_URL
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Authentication error (401) detected. Logging out user.');
      store.dispatch(logout());
      store.dispatch(reset());
    }
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;