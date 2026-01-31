import { useState, useCallback } from "react";

interface UseFormStateReturn<T, E> {
    formData: T;
    formErrors: E;
    isLoading: boolean;
    setFormData: React.Dispatch<React.SetStateAction<T>>;
    setFormErrors: React.Dispatch<React.SetStateAction<E>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNestedChange: (section: keyof T) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    resetForm: () => void;
    clearErrors: () => void;
}

export const useFormState = <T extends Record<string, unknown>, E extends Record<string, unknown>>(
    initialData: T,
    initialErrors: E
): UseFormStateReturn<T, E> => {
    const [formData, setFormData] = useState<T>(initialData);
    const [formErrors, setFormErrors] = useState<E>(initialErrors);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }, []);

    const handleNestedChange = useCallback((section: keyof T) => {
        return (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [section]: {
                    ...(prev[section] as Record<string, unknown>),
                    [name]: value,
                },
            }));
        };
    }, []);

    const resetForm = useCallback(() => {
        setFormData(initialData);
        setFormErrors(initialErrors);
        setIsLoading(false);
    }, [initialData, initialErrors]);

    const clearErrors = useCallback(() => {
        setFormErrors(initialErrors);
    }, [initialErrors]);

    return {
        formData,
        formErrors,
        isLoading,
        setFormData,
        setFormErrors,
        setIsLoading,
        handleChange,
        handleNestedChange,
        resetForm,
        clearErrors,
    };
};

export default useFormState;
