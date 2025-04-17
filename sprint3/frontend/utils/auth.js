import axios from 'axios';

export const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('token', token);
    } else {
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    }
};

export const getUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

export const loginUser = (userData) => {
    const { token, user } = userData;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', JSON.stringify(token));
    setAuthToken(token);
};

export const logoutUser = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setAuthToken(null);
    
    // Clear any other stored data if needed
    // localStorage.clear(); // Use this if you want to clear all localStorage

    // Force a page reload to clear all state
    window.location.href = '/login';
};

export const initializeAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
        setAuthToken(token);
    }
};