
import axios from 'axios';
import toast from 'react-hot-toast';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
axiosClient.interceptors.response.use(
    (response) => {
        // Return the full response object so components can access .data.success, .data.message, etc.
        // Or if you prefer to just return the data payload:
        return response.data;
    },
    (error) => {
        const { response } = error;
        if (response) {
            // Handle 401 Unauthorized (e.g., token expired)
            if (response.status === 401) {
                localStorage.removeItem('token');
                // Optionally redirect to login
                // window.location.href = '/login';
            }

            // Return the error response data if available
            return Promise.reject(response.data || error);
        } else if (error.request) {
            // Network error
            toast.error('Network error. Please check your connection.');
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
