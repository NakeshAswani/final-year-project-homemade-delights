import axios from 'axios';
import Cookies from 'js-cookie';
import { redirect } from 'next/navigation';

const axiosInstance = axios.create({
    baseURL: "/api"
});

axiosInstance.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => {
        if (response && (response.status === 401 || response.status === 403)) {
            Cookies.remove('token');
            redirect('/signin');
        }
        return response;
    },
    (error) => {
        const { response } = error;
        if (response && (response.status === 401 || response.status === 403)) {
            Cookies.remove('token');
            redirect('/signin');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;