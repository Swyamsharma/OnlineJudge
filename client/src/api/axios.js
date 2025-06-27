import axios from 'axios';
import { store } from '../store/store';
import { logout, reset } from '../features/auth/authSlice';

const axiosInstance = axios.create();

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
    return Promise.reject(error);
  }
);

export default axiosInstance;