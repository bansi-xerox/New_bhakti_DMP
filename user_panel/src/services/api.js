import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || 'https://new-bhakti-dmp.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

//bhajan 
export const getAllBhajans = (params) => API.get('/bhajanSahitya', { params });
export const getBhajanById = (id) => API.get(`/bhajanSahitya/${id}`);
export const searchBhajans = (query, params) => API.get('/bhajanSahitya/search', { params: { q: query, ...params } });


//gallary
export const getGalleryItems = (params) => API.get('/gallery', { params });

// Search gallery media by text/keyword query
export const searchGalleryMedia = (params) => API.get('/gallery/search', { params });

// Face recognition search endpoint (Uploads an image file)
export const searchByFace = (formData) =>
  API.post('/gallery/face-search', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export default API;