import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    FormControlLabel,
    DialogActions,
    Button,
    Switch,
    Typography,
    IconButton,
    CircularProgress,
    Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import authoredApi from "../api/authoredApi";
import { ExtendedRentalListing } from "../shared/types";
import { AxiosError } from "axios";

interface RentalListingEditDialogProps {
    isOpen: boolean;
    rental: ExtendedRentalListing;
    handleClose: () => void;
    initializeRentalListings: () => void;
}

interface FormData {
    title: string;
    description: string;
    address: string;
    tariffDescription: string;
    autoRenew: boolean;
}

interface Image {
    key: string;
    preview: string;
    isNew?: boolean;
    file?: File;
}

interface FormErrors {
    title: string;
    description: string;
    address: string;
    tariffDescription: string;
    mainImage: string;
    additionalImages: string;
    server: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ADDITIONAL_IMAGES = 4;
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg"];

const RentalListingEditDialog: React.FC<RentalListingEditDialogProps> = ({
    isOpen,
    rental,
    handleClose,
    initializeRentalListings,
}) => {
    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        address: "",
        tariffDescription: "",
        autoRenew: false,
    });
    const [mainImage, setMainImage] = useState<Image | null>(null);
    const [additionalImages, setAdditionalImages] = useState<Image[]>([]);
    const [deleteImageKeys, setDeleteImageKeys] = useState<string[]>([]);
    const [formErrors, setFormErrors] = useState<FormErrors>({
        title: "",
        description: "",
        address: "",
        tariffDescription: "",
        mainImage: "",
        additionalImages: "",
        server: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setFormData({
            title: rental.title,
            description: rental.description,
            address: rental.address,
            tariffDescription: rental.tariffDescription,
            autoRenew: rental.autoRenew,
        });
        setMainImage({
            key: rental.mainImageData.key ?? "",
            preview: rental.mainImageData.link,
        });
        setAdditionalImages(
            rental.additionalImagesData.map((img) => ({
                key: img.key,
                preview: img.link,
            })) as Image[]
        );
        setDeleteImageKeys([]);
        setFormErrors({
            title: "",
            description: "",
            address: "",
            tariffDescription: "",
            mainImage: "",
            additionalImages: "",
            server: "",
        });
    }, [rental]);

    const validateForm = () => {
        let valid = true;
        const newErrors: FormErrors = {
            title: "",
            description: "",
            address: "",
            tariffDescription: "",
            mainImage: "",
            additionalImages: "",
            server: "",
        };
        if (!mainImage) {
            newErrors.mainImage = "Основное изображение обязательно";
            valid = false;
        }
        if (!formData.title) {
            newErrors.title = "Название обязательно";
            valid = false;
        }
        if (!formData.address) {
            newErrors.address = "Адрес обязателен";
            valid = false;
        }
        if (!formData.tariffDescription) {
            newErrors.tariffDescription = "Тариф обязателен";
            valid = false;
        }
        if (formData.title.length < 1 || formData.title.length > 255) {
            newErrors.title = "Название должно быть от 1 до 255 символов";
            valid = false;
        }
        if (formData.description.length > 1023) {
            newErrors.description = "Описание должно быть не более 1023 символов";
            valid = false;
        }
        if (formData.address.length < 1 || formData.address.length > 255) {
            newErrors.address = "Адрес должен быть от 1 до 255 символов";
            valid = false;
        }
        if (formData.tariffDescription.length < 1 || formData.tariffDescription.length > 255) {
            newErrors.tariffDescription = "Тариф должен быть от 1 до 255 символов";
            valid = false;
        }
        setFormErrors(newErrors);
        return valid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, autoRenew: e.target.checked }));
    };

    const processImage = (file: File): Promise<Image> => {
        return new Promise((resolve, reject) => {
            if (file.size > MAX_FILE_SIZE) {
                reject("Image size exceeds 5MB");
                return;
            }
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                reject("Image must be PNG or JPEG");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve({
                    key: `new-${Date.now()}-${Math.random()}`,
                    preview: reader.result as string,
                    isNew: true,
                    file,
                });
            };
            reader.onerror = () => reject("Error reading file");
            reader.readAsDataURL(file);
        });
    };

    const handleMainImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            try {
                const image = await processImage(file);
                setMainImage(image);
                setFormErrors((prev) => ({ ...prev, mainImage: "" }));
            } catch (error) {
                setFormErrors((prev) => ({ ...prev, mainImage: error as string }));
            }
        }
    };

    const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const image = await processImage(file);
                setMainImage(image);
                setFormErrors((prev) => ({ ...prev, mainImage: "" }));
            } catch (error) {
                setFormErrors((prev) => ({ ...prev, mainImage: error as string }));
            }
        }
    };

    const handleAdditionalImagesDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        await processAdditionalImages(files);
    };

    const handleAdditionalImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        await processAdditionalImages(files);
    };

    const processAdditionalImages = async (files: File[]) => {
        const newImages: Image[] = [];
        for (const file of files) {
            try {
                const image = await processImage(file);
                newImages.push(image);
            } catch (error) {
                setFormErrors((prev) => ({ ...prev, additionalImages: error as string }));
                return;
            }
        }

        if (additionalImages.length + newImages.length > MAX_ADDITIONAL_IMAGES) {
            setFormErrors((prev) => ({
                ...prev,
                additionalImages: `You can upload up to ${MAX_ADDITIONAL_IMAGES} additional images`,
            }));
            return;
        }

        setAdditionalImages((prev) => [...prev, ...newImages]);
        setFormErrors((prev) => ({ ...prev, additionalImages: "" }));
    };

    const handleDeleteAdditionalImage = (key: string) => {
        setAdditionalImages((prev) => prev.filter((img) => img.key !== key));
        if (!key.startsWith("new-")) {
            setDeleteImageKeys((prev) => [...prev, key]);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setFormErrors((prev) => ({ ...prev, server: "" }));
        try {
            const formDataToSend = new FormData();
            formDataToSend.append(
                "data",
                new Blob([JSON.stringify(formData)], { type: "application/json" })
            );

            if (mainImage?.isNew && mainImage.file) {
                formDataToSend.append("mainImageFile", mainImage.file);
            }

            if (deleteImageKeys.length > 0) {
                formDataToSend.append(
                    "deleteImageKeys",
                    new Blob([JSON.stringify(deleteImageKeys)], { type: "application/json" })
                );
            }

            const newImages = additionalImages.filter((img) => img.isNew && img.file);
            if (newImages.length > 0) {
                newImages.forEach((img) => formDataToSend.append("newImageFiles", img.file!));
            }

            await authoredApi.patch(`/rentalListings/${rental.id}`, formDataToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            handleClose();
            initializeRentalListings();
            setFormData({
                title: "",
                description: "",
                address: "",
                tariffDescription: "",
                autoRenew: false,
            });
            setMainImage(null);
            setAdditionalImages([]);
            setDeleteImageKeys([]);
        } catch (error) {
            const axiosError = error as AxiosError;
            let errorMessage = "Failed to update listing";
            if (axiosError.response) {
                if (axiosError.response.status === 400) {
                    const errorData = axiosError.response.data as { [key: string]: string };
                    const fieldErrors: FormErrors = {
                        title: errorData.title || "",
                        description: "",
                        address: errorData.address || "",
                        tariffDescription: errorData.tariffDescription || "",
                        mainImage: "",
                        additionalImages: "",
                        server: "",
                    };
                    setFormErrors((prev) => ({ ...prev, ...fieldErrors }));
                } else if (axiosError.response.status === 404) {
                    errorMessage = "Rental listing not found.";
                } else if (axiosError.response.status === 405) {
                    errorMessage = "Server does not support this operation. Please contact support.";
                }
            }
            setFormErrors((prev) => ({ ...prev, server: errorMessage }));
            console.error("Error updating rental listing:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Обновить объявление</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    {formErrors.server && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {formErrors.server}
                        </Alert>
                    )}
                    <Box
                        sx={{
                            border: "2px dashed",
                            borderColor: formErrors.mainImage ? "error.main" : "grey.500",
                            borderRadius: 2,
                            p: 2,
                            textAlign: "center",
                            bgcolor: "grey.50",
                            "&:hover": { bgcolor: "grey.100" },
                            minHeight: "100px",
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleMainImageDrop}
                    >
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            {mainImage?.isNew
                                ? `Новое главное изображение: ${mainImage.file?.name}`
                                : mainImage
                                    ? "Выбранное главное изображение"
                                    : "Перетащите главное изображение сюда"}
                        </Typography>
                        <Button variant="outlined" component="label" sx={{ textTransform: "none" }}>
                            Выбрать главное изображение
                            <input
                                type="file"
                                hidden
                                accept="image/png,image/jpeg"
                                onChange={handleMainImageChange}
                            />
                        </Button>
                        {formErrors.mainImage && (
                            <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
                                {formErrors.mainImage}
                            </Typography>
                        )}
                        {mainImage?.preview && (
                            <Box sx={{ mt: 2, textAlign: "center" }}>
                                <img
                                    src={mainImage.preview}
                                    alt="Main image preview"
                                    style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "4px" }}
                                />
                            </Box>
                        )}
                    </Box>

                    <Box
                        sx={{
                            border: "2px dashed",
                            borderColor: formErrors.additionalImages ? "error.main" : "grey.500",
                            borderRadius: 2,
                            p: 2,
                            textAlign: "center",
                            bgcolor: "grey.50",
                            "&:hover": { bgcolor: "grey.100" },
                            minHeight: "100px",
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleAdditionalImagesDrop}
                    >
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            {additionalImages.some((img) => img.isNew)
                                ? `New Images: ${additionalImages
                                    .filter((img) => img.isNew)
                                    .map((img) => img.file!.name)
                                    .join(", ")}`
                                : additionalImages.length > 0
                                    ? "Current Additional Images"
                                    : "Drag and drop additional images here"}
                        </Typography>
                        <Button variant="outlined" component="label" sx={{ textTransform: "none" }}>
                            Выбрать дополнительные изображения
                            <input
                                type="file"
                                hidden
                                accept="image/png,image/jpeg"
                                multiple
                                onChange={handleAdditionalImagesChange}
                            />
                        </Button>
                        {formErrors.additionalImages && (
                            <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
                                {formErrors.additionalImages}
                            </Typography>
                        )}
                        {additionalImages.length > 0 && (
                            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                                {additionalImages.map((image) => (
                                    <Box key={image.key} sx={{ position: "relative" }}>
                                        <img
                                            src={image.preview}
                                            alt={`Additional image`}
                                            style={{ maxWidth: "100px", maxHeight: "100px", borderRadius: "4px" }}
                                        />
                                        <IconButton
                                            sx={{ position: "absolute", top: 0, right: 0 }}
                                            onClick={() => handleDeleteAdditionalImage(image.key)}
                                        >
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    <TextField
                        label="Название"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!formErrors.title}
                        helperText={formErrors.title}
                    />
                    <TextField
                        label="Описание"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        error={!!formErrors.description}
                        helperText={formErrors.description}
                    />
                    <TextField
                        label="Адрес"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!formErrors.address}
                        helperText={formErrors.address}
                    />
                    <TextField
                        label="Тариф"
                        name="tariffDescription"
                        value={formData.tariffDescription}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!formErrors.tariffDescription}
                        helperText={formErrors.tariffDescription}
                    />
                    <FormControlLabel
                        control={<Switch checked={formData.autoRenew} onChange={handleSwitchChange} />}
                        label="Автопродление"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isLoading}>
                    Отменить
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : "Обновить"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RentalListingEditDialog;
