import { Box, Button, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface ImageDropZoneProps {
    label: string;
    selectedLabel?: string;
    error?: string;
    preview?: string | null;
    previews?: string[];
    multiple?: boolean;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDelete?: (index: number) => void;
    onDeleteSingle?: () => void;
}

const ImageDropZone: React.FC<ImageDropZoneProps> = ({
    label,
    selectedLabel,
    error,
    preview,
    previews = [],
    multiple = false,
    onDragOver,
    onDrop,
    onChange,
    onDelete,
    onDeleteSingle,
}) => {
    const hasImages = multiple ? previews.length > 0 : !!preview;

    return (
        <Box
            sx={{
                border: "2px dashed",
                borderColor: error ? "error.main" : "grey.500",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
                bgcolor: "grey.50",
                "&:hover": { bgcolor: "grey.100" },
                minHeight: "100px",
            }}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <Typography variant="body1" sx={{ mb: 1 }}>
                {hasImages ? (selectedLabel || label) : label}
            </Typography>
            <Button variant="outlined" component="label" sx={{ textTransform: "none" }}>
                {multiple ? "Выбрать изображения" : "Выбрать изображение"}
                <input
                    type="file"
                    hidden
                    accept="image/png,image/jpeg"
                    multiple={multiple}
                    onChange={onChange}
                />
            </Button>
            {error && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
                    {error}
                </Typography>
            )}
            {!multiple && preview && (
                <Box sx={{ mt: 2, textAlign: "center", position: "relative", display: "inline-block" }}>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "4px" }}
                    />
                    {onDeleteSingle && (
                        <IconButton
                            sx={{ position: "absolute", top: 0, right: 0 }}
                            onClick={onDeleteSingle}
                        >
                            <DeleteIcon color="error" />
                        </IconButton>
                    )}
                </Box>
            )}
            {multiple && previews.length > 0 && (
                <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                    {previews.map((previewUrl, index) => (
                        <Box key={index} sx={{ position: "relative" }}>
                            <img
                                src={previewUrl}
                                alt={`Preview ${index + 1}`}
                                style={{ maxWidth: "100px", maxHeight: "100px", borderRadius: "4px" }}
                            />
                            {onDelete && (
                                <IconButton
                                    sx={{ position: "absolute", top: 0, right: 0 }}
                                    onClick={() => onDelete(index)}
                                >
                                    <DeleteIcon color="error" />
                                </IconButton>
                            )}
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default ImageDropZone;
