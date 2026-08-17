import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Protected Requests - Bearer Token 
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// 1. Auth Status (Check if registered user exists)
export const checkAuthStatus = () => API.get('/auth/status');

// 2. Register First User
export const registerUser = (data) => API.post('/auth/register', data);

// 3. Login User
export const loginUser = (data) => API.post('/auth/login', data);

// 4. Forgot Password (Request Reset Link)
export const forgotPassword = (email_address) => API.post('/auth/forgot-password', { email_address });

// 5. Activate Reset Link (Triggers 5-min window)
export const activateResetLink = (token) => API.get(`/auth/activate-reset/${token}`);

// 6. Perform Password Reset
export const resetPassword = (token, passwords) => API.post(`/auth/reset-password/${token}`, passwords);

export const uploadGalleryMedia = (formData) =>
  API.post('/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getGalleryItems = () => API.get('/gallery');

export const deleteGalleryMedia = (ids) =>
  API.delete('/gallery/delete', { data: { ids } });

export const updateGalleryMedia = (id, formData) =>
  API.put(`/gallery/update/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export default API;