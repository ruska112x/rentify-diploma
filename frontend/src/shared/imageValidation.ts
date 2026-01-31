import { IMAGE_CONFIG } from "./imageConstants";

export interface ImageValidationResult {
    valid: boolean;
    error?: string;
}

export const validateImageFile = (file: File): ImageValidationResult => {
    if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
        return {
            valid: false,
            error: "Размер файла не должен превышать 5 МБ",
        };
    }

    if (!IMAGE_CONFIG.ALLOWED_FILE_TYPES.includes(file.type as typeof IMAGE_CONFIG.ALLOWED_FILE_TYPES[number])) {
        return {
            valid: false,
            error: "Поддерживаются только PNG и JPEG",
        };
    }

    return { valid: true };
};

export const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const readFilesAsDataURLs = (files: File[]): Promise<string[]> => {
    return Promise.all(files.map(readFileAsDataURL));
};
