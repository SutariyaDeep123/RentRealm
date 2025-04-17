"use client"
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Check localStorage for existing token on app load
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            // Set default authorization header for all future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
        setMounted(true);
    }, []);

    const login = (userData) => {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    };

    const logout = () => {
        // Clear localStorage and state
        localStorage.removeItem('user');
        setUser(null);
        
        // Remove authorization header
        delete axios.defaults.headers.common['Authorization'];
        
        // Redirect to login page
        window.location.href = '/login';
    };

    // Don't render children until mounted
    if (!mounted) {
        return null;
    }

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}