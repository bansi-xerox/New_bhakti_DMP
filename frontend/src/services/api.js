import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', //  backend API URL 
  headers: { 'Content-Type': 'application/json' },
});

// Protected Requests માટે Auth Header જોડવું
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const checkAdminExists = () => API.get('/auth/check-admin');
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email_address: email });
export const validateResetToken = (token) => API.get(`/auth/validate-token/${token}`);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

export default API;