import { Box, Typography, SxProps, Theme } from '@mui/material';

interface ImageSquareProps {
    imageUrl?: string;
    fallbackText: string;
    size?: number | string;
    border?: string;
    borderRadius?: number | string;
    sx?: SxProps<Theme>;
}

const ImageSquare: React.FC<ImageSquareProps> = ({
    imageUrl,
    fallbackText,
    size = 150,
    border = 'none',
    borderRadius = 4,
    sx = {},
}) => {
    return (
        <Box
            sx={{
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border,
                borderRadius,
                overflow: 'hidden',
                bgcolor: 'grey.100',
                ...sx,
            }}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={fallbackText}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                    loading="lazy"
                />
            ) : (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', px: 2 }}
                >
                    {fallbackText}
                </Typography>
            )}
        </Box>
    );
};

export default ImageSquare;