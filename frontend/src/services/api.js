import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Protected Requests - Bearer Token Interceptor
API.interceptors.request.use((req) => {
  // Make sure your localStorage key matches what you use on login!
  const token = localStorage.getItem('authToken'); // Note: previously you used 'token'
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ==========================================
// 1. AUTHENTICATION MODULE
// ==========================================
export const checkAuthStatus = () => API.get('/auth/status');
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const forgotPassword = (email_address) => API.post('/auth/forgot-password', { email_address });
export const activateResetLink = (token) => API.get(`/auth/activate-reset/${token}`);
export const resetPassword = (token, passwords) => API.post(`/auth/reset-password/${token}`, passwords);

// ==========================================
// 2. GALLERY MODULE
// ==========================================
export const uploadGalleryMedia = (formData) =>
  API.post('/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getGalleryItems = () => API.get('/gallery');
export const deleteGalleryMedia = (ids) =>
  API.delete('/gallery/delete', { data: { ids } });
export const updateGalleryMedia = (id, data) => API.put(`/gallery/update/${id}`, data);
// ==========================================
// 3. BHAJAN SAHITYA MODULE
// ==========================================
export const getAllBhajans = () => API.get('/bhajanSahitya');
export const getBhajanById = (id) => API.get(`/bhajanSahitya/${id}`);
export const createBhajan = (data) => API.post('/bhajanSahitya', data);
export const updateBhajan = (id, data) => API.put(`/bhajanSahitya/${id}`, data);
export const deleteBhajan = (id) => API.delete(`/bhajanSahitya/${id}`);

export default API;