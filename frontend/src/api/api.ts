import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { store } from '../state/store';
import { logout } from '../state/authSlice';
import { refresh } from '../state/authSlice';

let refreshPromise: Promise<any> | null = null;

const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true,
});

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const { accessToken, isRefreshing } = store.getState().auth;

        if (accessToken && !isRefreshing) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${accessToken}`;
        } else if (isRefreshing && refreshPromise) {
            await refreshPromise;
            const newToken = store.getState().auth.accessToken;
            if (newToken) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${newToken}`;
            }
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
                if (refreshPromise) {
                    await refreshPromise;
                } else {
                    refreshPromise = store.dispatch(refresh()).unwrap();
                    await refreshPromise;
                }

                const { accessToken } = store.getState().auth;
                if (!accessToken) throw new Error('Refresh failed');

                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                refreshPromise = null;
                return api(originalRequest);
            } catch (refreshError) {
                refreshPromise = null;
                store.dispatch(logout());
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;