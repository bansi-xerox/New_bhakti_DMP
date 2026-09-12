import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'https://new-bhakti-dmp.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

export const getAllBhajans = (params) => API.get('/bhajanSahitya', { params });
export const getBhajanById = (id) => API.get(`/bhajanSahitya/${id}`);
export const searchBhajans = (query, params) => API.get('/bhajanSahitya/search', { params: { q: query, ...params } });

export default API;