import { AxiosError } from "axios";

export const getErrorMessage = (error: unknown, context?: string): string => {
    const axiosError = error as AxiosError;

    if (!axiosError.response) {
        return "Ошибка сети. Проверьте подключение к интернету.";
    }

    switch (axiosError.response.status) {
        case 400:
            return "Неверные данные. Проверьте введённую информацию.";
        case 401:
            return "Требуется авторизация. Пожалуйста, войдите снова.";
        case 403:
            return "Доступ запрещён.";
        case 404:
            return context ? `${context} не найден.` : "Ресурс не найден.";
        case 409:
            return "Ресурс уже существует.";
        case 500:
            return "Ошибка сервера. Попробуйте позже.";
        default:
            return "Произошла ошибка. Попробуйте ещё раз.";
    }
};

export const getFieldErrors = <T extends Record<string, string>>(error: unknown): Partial<T> => {
    const axiosError = error as AxiosError<T>;
    if (axiosError.response?.status === 400 && axiosError.response.data) {
        return axiosError.response.data as Partial<T>;
    }
    return {};
};
