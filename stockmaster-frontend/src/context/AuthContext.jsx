import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../utils/axiosClient';
import toast from 'react-hot-toast';

const AuthContext = createContext({
    user: null,
    token: null,
    login: async () => { },
    signup: async () => { },
    verifyEmail: async () => { },
    loginWithOtp: async () => { },
    verifyLoginOtp: async () => { },
    logout: () => { },
    isAuthenticated: false,
    isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    // For MVP, we'll just assume the token is valid if it exists.
                    // In a real app, we would verify it with /auth/me
                    const storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }
                } catch (error) {
                    console.error("Auth initialization failed", error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await axiosClient.post('/auth/login', { email, password });
            // Backend returns { success: true, message: '...', data: { token, user } }
            const { token, user } = response.data;

            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            return response;
        } catch (error) {
            throw error;
        }
    };

    const signup = async (name, email, password) => {
        try {
            const response = await axiosClient.post('/auth/signup', { name, email, password });
            // Backend returns { success: true, message: '...', data: { requiresVerification: true, email } }
            // Do NOT set token here as user is not verified yet
            return response;
        } catch (error) {
            throw error;
        }
    };

    const verifyEmail = async (email, otp) => {
        try {
            const response = await axiosClient.post('/auth/verify-email', { email, otp });
            const { token, user } = response.data;

            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            return response;
        } catch (error) {
            throw error;
        }
    };

    const loginWithOtp = async (email) => {
        try {
            const response = await axiosClient.post('/auth/login-otp', { email });
            return response;
        } catch (error) {
            throw error;
        }
    };

    const verifyLoginOtp = async (email, otp) => {
        try {
            const response = await axiosClient.post('/auth/verify-login-otp', { email, otp });
            const { token, user } = response.data;

            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully.');
        // window.location.href = '/login'; // Let the router handle redirection if needed
    };

    const value = {
        user,
        token,
        login,
        signup,
        verifyEmail,
        loginWithOtp,
        verifyLoginOtp,
        logout,
        isAuthenticated: !!token,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
