export const IMAGE_CONFIG = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_ADDITIONAL_IMAGES: 4,
    ALLOWED_FILE_TYPES: ["image/png", "image/jpeg"] as const,
} as const;

export type AllowedFileType = typeof IMAGE_CONFIG.ALLOWED_FILE_TYPES[number];
