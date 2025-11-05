// auth.js - Authentication utility functions

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('token');
};

// Set token to localStorage and set default header
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    // For future API calls with axios, would do:
    // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    // For future API calls with axios, would do:
    // delete axios.defaults.headers.common['Authorization'];
  }
};

// Remove token from localStorage
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Get user info from localStorage
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Save user info to localStorage
export const saveUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};