import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: `${apiUrl}/unauthorizedApi/v1`,
    withCredentials: true,
});

export default api;
