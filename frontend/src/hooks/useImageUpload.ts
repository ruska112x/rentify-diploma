import { useState, useCallback } from "react";
import { validateImageFile, readFileAsDataURL, readFilesAsDataURLs } from "../shared/imageValidation";
import { IMAGE_CONFIG } from "../shared/imageConstants";

interface UseImageUploadOptions {
    onError?: (error: string) => void;
}

interface UseImageUploadReturn {
    file: File | null;
    preview: string | null;
    error: string;
    handleFile: (file: File) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    reset: () => void;
    setPreview: (preview: string | null) => void;
}

export const useImageUpload = (options?: UseImageUploadOptions): UseImageUploadReturn => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string>("");

    const handleFile = useCallback(async (newFile: File) => {
        const validation = validateImageFile(newFile);
        if (!validation.valid) {
            setError(validation.error || "");
            setFile(null);
            setPreview(null);
            options?.onError?.(validation.error || "");
            return;
        }

        setFile(newFile);
        setError("");
        const dataUrl = await readFileAsDataURL(newFile);
        setPreview(dataUrl);
    }, [options]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFile(selectedFile);
        }
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            handleFile(droppedFile);
        }
    }, [handleFile]);

    const reset = useCallback(() => {
        setFile(null);
        setPreview(null);
        setError("");
    }, []);

    return {
        file,
        preview,
        error,
        handleFile,
        handleChange,
        handleDragOver,
        handleDrop,
        reset,
        setPreview,
    };
};

interface UseMultipleImagesUploadReturn {
    files: File[];
    previews: string[];
    error: string;
    handleFiles: (files: File[]) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    removeImage: (index: number) => void;
    reset: () => void;
}

export const useMultipleImagesUpload = (
    maxImages: number = IMAGE_CONFIG.MAX_ADDITIONAL_IMAGES,
    options?: UseImageUploadOptions
): UseMultipleImagesUploadReturn => {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [error, setError] = useState<string>("");

    const handleFiles = useCallback(async (newFiles: File[]) => {
        const validFiles: File[] = [];

        for (const file of newFiles) {
            const validation = validateImageFile(file);
            if (!validation.valid) {
                setError(validation.error || "");
                options?.onError?.(validation.error || "");
                return;
            }
            validFiles.push(file);
        }

        if (files.length + validFiles.length > maxImages) {
            const errorMsg = `Максимум ${maxImages} изображений`;
            setError(errorMsg);
            options?.onError?.(errorMsg);
            return;
        }

        setError("");
        setFiles(prev => [...prev, ...validFiles]);
        const newPreviews = await readFilesAsDataURLs(validFiles);
        setPreviews(prev => [...prev, ...newPreviews]);
    }, [files.length, maxImages, options]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            handleFiles(selectedFiles);
        }
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            handleFiles(droppedFiles);
        }
    }, [handleFiles]);

    const removeImage = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    }, []);

    const reset = useCallback(() => {
        setFiles([]);
        setPreviews([]);
        setError("");
    }, []);

    return {
        files,
        previews,
        error,
        handleFiles,
        handleChange,
        handleDragOver,
        handleDrop,
        removeImage,
        reset,
    };
};
