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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import TransparentLoadingSpinner from "../components/TransparentLoadingSpinner";
import authoredApi from "../api/authoredApi";

interface RentalListingAddDialogProps {
    isOpen: boolean;
    userId: string;
    handleClose: () => void;
    initializeRentalListings: () => void;
}

const RentalListingAddDialog: React.FC<RentalListingAddDialogProps> = ({
    isOpen,
    userId,
    handleClose,
    initializeRentalListings,
}) => {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        autoRenew: false,
    });

    const [address, setAddress] = useState({
        district: "",
        locality: "",
        street: "",
        houseNumber: "",
        additionalInfo: "",
    });

    const [tariff, setTariff] = useState({
        perHour: "",
        perDay: "",
        perWeek: "",
        additionalInfo: "",
    });

    const [formErrors, setFormErrors] = useState({
        title: "",
        description: "",
        address: "",
        tariff: "",
        mainImage: "",
        additionalImages: "",
    });

    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
    const [additionalImages, setAdditionalImages] = useState<File[]>([]);
    const [additionalImagesPreviews, setAdditionalImagesPreviews] = useState<string[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const MAX_ADDITIONAL_IMAGES = 4;
    const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg"];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTariffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTariff((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            autoRenew: e.target.checked,
        }));
    };

    // Handle image drag-and-drop and file input
    const handleMainImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleMainImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processMainImage(file);
        }
    };

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processMainImage(file);
        }
    };

    const processMainImage = (file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            setFormErrors((prev) => ({
                ...prev,
                mainImage: "Основное изображение должно быть меньше 5MB",
            }));
            return;
        }
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            setFormErrors((prev) => ({
                ...prev,
                mainImage: "Основное изображение должно быть PNG или JPEG",
            }));
            return;
        }

        setMainImage(file);
        setFormErrors((prev) => ({ ...prev, mainImage: "" }));

        const reader = new FileReader();
        reader.onloadend = () => {
            setMainImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAdditionalImagesDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleAdditionalImagesDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);
        processAdditionalImages(files);
    };

    const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        processAdditionalImages(files);
    };

    const processAdditionalImages = (files: File[]) => {
        const validFiles = files.filter((file) => {
            if (file.size > MAX_FILE_SIZE) {
                setFormErrors((prev) => ({
                    ...prev,
                    additionalImages: "Каждое дополнительное изображение должно быть меньше 5MB",
                }));
                return false;
            }
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                setFormErrors((prev) => ({
                    ...prev,
                    additionalImages: "Каждое дополнительное изображение должно быть PNG или JPEG",
                }));
                return false;
            }
            return true;
        });

        if (additionalImages.length + validFiles.length > MAX_ADDITIONAL_IMAGES) {
            setFormErrors((prev) => ({
                ...prev,
                additionalImages: `Вы можете загрузить максимум ${MAX_ADDITIONAL_IMAGES} дополнительных изображений`,
            }));
            return;
        }

        setAdditionalImages((prev) => [...prev, ...validFiles]);
        setFormErrors((prev) => ({ ...prev, additionalImages: "" }));

        const previews = validFiles.map((file) => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(previews).then((newPreviews) => {
            setAdditionalImagesPreviews((prev) => [...prev, ...newPreviews]);
        });
    };

    const handleDeleteAdditionalImage = (index: number) => {
        setAdditionalImagesPreviews((prev) => prev.filter((_, i) => i !== index));
        setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Validate form based on DTO constraints
    const validateForm = () => {
        let valid = true;
        const newErrors = {
            title: "",
            description: "",
            address: "",
            tariff: "",
            mainImage: "",
            additionalImages: "",
        };

        if (!mainImage) {
            newErrors.mainImage = "Основное изображение обязательно";
            valid = false;
        }
        if (!formData.title) {
            newErrors.title = "Название обязательно";
            valid = false;
        } else if (formData.title.length < 1 || formData.title.length > 255) {
            newErrors.title = "Название должно быть от 1 до 255 символов";
            valid = false;
        }
        if (formData.description.length > 1023) {
            newErrors.description = "Описание должно быть не более 1023 символов";
            valid = false;
        }
        if (!tariff.perHour) {
            newErrors.tariff = "Тариф за час обязателен";
            valid = false;
        }
        if (tariff.perDay && tariff.perDay.length > 255) {
            newErrors.tariff = "Тариф за день должен быть не более 255 символов";
            valid = false;
        }
        if (tariff.perWeek && tariff.perWeek.length > 255) {
            newErrors.tariff = "Тариф за неделю должен быть не более 255 символов";
            valid = false;
        }
        if (tariff.additionalInfo && tariff.additionalInfo.length > 255) {
            newErrors.tariff = "Дополнительная информация тарифа должна быть не более 255 символов";
            valid = false;
        }
        if (!address.locality || !address.street || !address.houseNumber) {
            newErrors.address = "Населенный пункт, улица и номер дома обязательны";
            valid = false;
        }

        setFormErrors(newErrors);
        return valid;
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append(
                "data",
                new Blob(
                    [
                        JSON.stringify({
                            userId,
                            title: formData.title,
                            description: formData.description,
                            address: {
                                district: address.district || null,
                                locality: address.locality,
                                street: address.street,
                                houseNumber: address.houseNumber,
                                additionalInfo: address.additionalInfo || null,
                            },
                            tariff: {
                                perHour: tariff.perHour,
                                perDay: tariff.perDay || null,
                                perWeek: tariff.perWeek || null,
                                additionalInfo: tariff.additionalInfo || null,
                            },
                            autoRenew: formData.autoRenew,
                        }),
                    ],
                    { type: "application/json" }
                )
            );

            if (mainImage) {
                formDataToSend.append("mainImage", mainImage);
            }

            additionalImages.forEach((image) => {
                formDataToSend.append("additionalImages", image);
            });

            await authoredApi.post("/rentalListings/create", formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            handleClose();
            initializeRentalListings();
            setFormData({
                title: "",
                description: "",
                autoRenew: false,
            });
            setAddress({
                district: "",
                locality: "",
                street: "",
                houseNumber: "",
                additionalInfo: "",
            });
            setTariff({
                perHour: "",
                perDay: "",
                perWeek: "",
                additionalInfo: "",
            });
            setMainImage(null);
            setMainImagePreview(null);
            setAdditionalImages([]);
            setAdditionalImagesPreviews([]);
        } catch (error) {
            console.error("Error creating rental listing:", error);
            setFormErrors((prev) => ({
                ...prev,
                address: "Ошибка при создании объявления. Проверьте данные адреса.",
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const innerHandleClose = () => {
        handleClose();
        setFormErrors({
            title: "",
            description: "",
            address: "",
            tariff: "",
            mainImage: "",
            additionalImages: "",
        });
        setFormData({
            title: "",
            description: "",
            autoRenew: false,
        });
        setAddress({
            district: "",
            locality: "",
            street: "",
            houseNumber: "",
            additionalInfo: "",
        });
        setTariff({
            perHour: "",
            perDay: "",
            perWeek: "",
            additionalInfo: "",
        });
        setMainImage(null);
        setMainImagePreview(null);
        setAdditionalImages([]);
        setAdditionalImagesPreviews([]);
    };

    return (
        <Dialog open={isOpen} onClose={innerHandleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Создание нового объявления</DialogTitle>
            <DialogContent>
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Основные данные:
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    {/* Main Image Upload */}
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
                        onDragOver={handleMainImageDragOver}
                        onDrop={handleMainImageDrop}
                    >
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            {mainImage ? `Основное изображение: ${mainImage.name}` : "Перетащите основное изображение сюда"}
                        </Typography>
                        <Button variant="outlined" component="label" sx={{ textTransform: "none" }}>
                            Выбрать основное изображение
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
                        {mainImagePreview && (
                            <Box sx={{ mt: 2, textAlign: "center" }}>
                                <img
                                    src={mainImagePreview}
                                    alt="Main image preview"
                                    style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "4px" }}
                                />
                            </Box>
                        )}
                    </Box>

                    {/* Additional Images Upload */}
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
                        onDragOver={handleAdditionalImagesDragOver}
                        onDrop={handleAdditionalImagesDrop}
                    >
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            {additionalImages.length > 0
                                ? `Дополнительные изображения: ${additionalImages.map((img) => img.name).join(", ")}`
                                : "Перетащите дополнительные изображения сюда"}
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
                        {additionalImagesPreviews.length > 0 && (
                            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                                {additionalImagesPreviews.map((preview, index) => (
                                    <Box key={index} sx={{ position: "relative" }}>
                                        <img
                                            src={preview}
                                            alt={`Additional image ${index + 1}`}
                                            style={{ maxWidth: "100px", maxHeight: "100px", borderRadius: "4px" }}
                                        />
                                        <IconButton
                                            sx={{ position: "absolute", top: 0, right: 0 }}
                                            onClick={() => handleDeleteAdditionalImage(index)}
                                        >
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Form Fields */}
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
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Адрес:
                    </Typography>
                    <TextField
                        label="Район"
                        name="district"
                        value={address.district}
                        onChange={handleAddressChange}
                        fullWidth
                        error={!!formErrors.address}
                        helperText={formErrors.address}
                    />
                    <TextField
                        label="Населенный пункт"
                        name="locality"
                        value={address.locality}
                        onChange={handleAddressChange}
                        fullWidth
                        required
                        error={!!formErrors.address}
                        helperText={formErrors.address}
                    />
                    <TextField
                        label="Улица"
                        name="street"
                        value={address.street}
                        onChange={handleAddressChange}
                        fullWidth
                        required
                        error={!!formErrors.address}
                        helperText={formErrors.address}
                    />
                    <TextField
                        label="Номер дома"
                        name="houseNumber"
                        value={address.houseNumber}
                        onChange={handleAddressChange}
                        fullWidth
                        required
                        error={!!formErrors.address}
                        helperText={formErrors.address}
                    />
                    <TextField
                        label="Дополнительная информация об адресе"
                        name="additionalInfo"
                        value={address.additionalInfo}
                        onChange={handleAddressChange}
                        fullWidth
                        error={!!formErrors.address}
                        helperText={formErrors.address}
                    />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Цены и тарифы:
                    </Typography>
                    <TextField
                        label="Цена за час"
                        name="perHour"
                        value={tariff.perHour}
                        onChange={handleTariffChange}
                        fullWidth
                        required
                        error={!!formErrors.tariff}
                        helperText={formErrors.tariff}
                    />
                    <TextField
                        label="Цена за день"
                        name="perDay"
                        value={tariff.perDay}
                        onChange={handleTariffChange}
                        fullWidth
                        error={!!formErrors.tariff}
                        helperText={formErrors.tariff}
                    />
                    <TextField
                        label="Цена за неделю"
                        name="perWeek"
                        value={tariff.perWeek}
                        onChange={handleTariffChange}
                        fullWidth
                        error={!!formErrors.tariff}
                        helperText={formErrors.tariff}
                    />
                    <TextField
                        label="Дополнительная информация о тарифе"
                        name="additionalInfo"
                        value={tariff.additionalInfo}
                        onChange={handleTariffChange}
                        fullWidth
                        error={!!formErrors.tariff}
                        helperText={formErrors.tariff}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.autoRenew}
                                onChange={handleSwitchChange}
                                name="autoRenew"
                            />
                        }
                        label="Автопродление"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={innerHandleClose}>Отмена</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Создать
                </Button>
            </DialogActions>
            <TransparentLoadingSpinner isLoading={isLoading} />
        </Dialog>
    );
};

export default RentalListingAddDialog;