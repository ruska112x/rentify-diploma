// authoredApi.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { refresh, logout } from '../state/authSlice'; // Import thunks
import { AppDispatch } from '../state/store'; // Import types

const apiUrl = import.meta.env.VITE_API_URL;

let refreshPromise: Promise<any> | null = null;

const authoredApi = axios.create({
    baseURL: `${apiUrl}/authorizedApi/v1`,
    withCredentials: true,
});

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

export const configureAuthInterceptors = (
    dispatch: AppDispatch,
    getState: () => { auth: { accessToken: string | null; isRefreshing: boolean } }
) => {
    authoredApi.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
            const { accessToken, isRefreshing } = getState().auth;

            if (accessToken && !isRefreshing) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${accessToken}`;
            } else if (isRefreshing && refreshPromise) {
                await refreshPromise;
                const newToken = getState().auth.accessToken;
                if (newToken) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${newToken}`;
                }
            }
            return config;
        },
        (error: AxiosError) => Promise.reject(error)
    );

    authoredApi.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as CustomAxiosRequestConfig;
            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    if (refreshPromise) {
                        await refreshPromise;
                    } else {
                        refreshPromise = dispatch(refresh()).unwrap();
                        await refreshPromise;
                    }

                    const { accessToken } = getState().auth;
                    if (!accessToken) throw new Error('Refresh failed');

                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    refreshPromise = null;
                    return authoredApi(originalRequest);
                } catch (refreshError) {
                    refreshPromise = null;
                    dispatch(logout());
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );
};

export default authoredApi;