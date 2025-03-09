import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../state/store';
import { logout, setTokens } from '../state/authSlice';


interface RefreshResponse {
    accessToken: string;
    refreshToken: string;
}

const api = axios.create({
    baseURL: 'http://localhost:8080',
});

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = store.getState().auth.accessToken;
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = store.getState().auth.refreshToken;
                const response = await axios.post<RefreshResponse>('http://localhost:8080/api/auth/refresh', {
                    refreshToken,
                });
                store.dispatch(setTokens({
                    accessToken: response.data.accessToken,
                    refreshToken: response.data.refreshToken,
                }));
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                store.dispatch(logout());
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
