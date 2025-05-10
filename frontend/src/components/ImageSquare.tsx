import { useState } from 'react';
import {
    Box,
    Typography,
    SxProps,
    Theme,
    IconButton,
    Dialog,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

interface ImageSquareProps {
    imageUrl?: string;
    altText: string;
    fallbackText?: string;
    size?: number | string;
    border?: string;
    borderRadius?: number | string;
    sx?: SxProps<Theme>;
    showFullScreen?: boolean;
}

const ImageSquare: React.FC<ImageSquareProps> = ({
    imageUrl,
    altText,
    fallbackText = "Не удалось загрузить изображение",
    size = 150,
    border = 'none',
    borderRadius = 4,
    sx = {},
    showFullScreen = false,
}) => {
    const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

    const handleOpenFullScreen = () => {
        setIsFullScreenOpen(true);
    };

    const handleCloseFullScreen = () => {
        setIsFullScreenOpen(false);
    };

    return (
        <>
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
                    position: 'relative',
                    ...sx,
                }}
            >
                {imageUrl ? (
                    <>
                        <img
                            src={imageUrl}
                            alt={altText}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                            loading="lazy"
                        />
                        {showFullScreen && (
                            <IconButton
                                onClick={handleOpenFullScreen}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                                }}
                                size="small"
                            >
                                <FullscreenIcon fontSize="small" />
                            </IconButton>
                        )}
                    </>
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

            {showFullScreen && imageUrl && (
                <Dialog
                    open={isFullScreenOpen}
                    onClose={handleCloseFullScreen}
                    maxWidth="lg"
                    slotProps={{
                        backdrop: {
                            sx: {
                                backdropFilter: 'blur(8px)',
                                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                            },
                        },
                    }}
                    sx={{
                        '& .MuiDialog-paper': {
                            bgcolor: 'rgba(255, 255, 255, 0.7)',
                            boxShadow: 'none',
                            borderRadius: 2,
                        },
                    }}
                >
                    <DialogContent
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2,
                            bgcolor: 'transparent',
                        }}
                    >
                        <img
                            src={imageUrl}
                            alt={altText}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                                borderRadius: 4,
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ bgcolor: 'transparent', justifyContent: 'center' }}>
                        <Button
                            onClick={handleCloseFullScreen}
                            variant="contained"
                            color="primary"
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </>
    );
};

export default ImageSquare;
