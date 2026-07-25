import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [role, setRole] = useState(localStorage.getItem('role'));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        }
    }, [token]);

    useEffect(() => {
        if (role) {
            localStorage.setItem('role', role);
        }
    }, [role]);

    const register = async (name, email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authAPI.register(name, email, password);
            setToken(response.data.token);
            setRole(response.data.role);
            setUser({ id: response.data.userId });
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authAPI.login(email, password);
            setToken(response.data.token);
            setRole(response.data.role);
            setUser({ id: response.data.userId });
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole(null);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    };

    return (
        <AuthContext.Provider value={{ user, token, role, loading, error, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};