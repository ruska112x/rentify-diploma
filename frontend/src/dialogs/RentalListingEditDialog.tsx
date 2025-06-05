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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
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
    autoRenew: boolean;
}

interface AddressData {
    district: string;
    locality: string;
    street: string;
    houseNumber: string;
    additionalInfo: string;
}

interface TariffData {
    perHour: string;
    perDay: string;
    perWeek: string;
    additionalInfo: string;
}

interface Image {
    key: string;
    preview: string;
    isNew?: boolean;
    file?: File;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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
        autoRenew: false,
    });

    const [address, setAddress] = useState<AddressData>({
        district: "",
        locality: "",
        street: "",
        houseNumber: "",
        additionalInfo: "",
    });

    const [tariff, setTariff] = useState<TariffData>({
        perHour: "",
        perDay: "",
        perWeek: "",
        additionalInfo: "",
    });

    const [mainImage, setMainImage] = useState<Image | null>(null);
    const [additionalImages, setAdditionalImages] = useState<Image[]>([]);
    const [deleteImageKeys, setDeleteImageKeys] = useState<string[]>([]);
    const [formErrors, setFormErrors] = useState({
        title: "",
        description: "",
        address: {
            district: "",
            locality: "",
            street: "",
            houseNumber: "",
            additionalInfo: "",
        },
        tariff: {
            perHour: "",
            perDay: "",
            perWeek: "",
            additionalInfo: "",
        },
        mainImage: "",
        additionalImages: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setFormData({
            title: rental.title,
            description: rental.description,
            autoRenew: rental.autoRenew,
        });
        setAddress({
            district: rental.address.district || "",
            locality: rental.address.locality || "",
            street: rental.address.street || "",
            houseNumber: rental.address.houseNumber || "",
            additionalInfo: rental.address.additionalInfo || "",
        });
        setTariff({
            perHour: rental.tariff.perHour || "",
            perDay: rental.tariff.perDay || "",
            perWeek: rental.tariff.perWeek || "",
            additionalInfo: rental.tariff.additionalInfo || "",
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
            address: {
                district: "",
                locality: "",
                street: "",
                houseNumber: "",
                additionalInfo: "",
            },
            tariff: {
                perHour: "",
                perDay: "",
                perWeek: "",
                additionalInfo: "",
            },
            mainImage: "",
            additionalImages: "",
        });
    }, [rental]);

    const validateForm = () => {
        let valid = true;
        const newErrors = {
            title: "",
            description: "",
            address: {
                district: "",
                locality: "",
                street: "",
                houseNumber: "",
                additionalInfo: "",
            },
            tariff: {
                perHour: "",
                perDay: "",
                perWeek: "",
                additionalInfo: "",
            },
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
            newErrors.tariff.perHour = "Тариф за час обязателен";
            valid = false;
        }
        if (tariff.perHour.length > 50) {
            newErrors.tariff.perHour = "Тариф за час должен быть не более 50 символов";
            valid = false;
        }
        if (tariff.perDay && tariff.perDay.length > 50) {
            newErrors.tariff.perDay = "Тариф за день должен быть не более 50 символов";
            valid = false;
        }
        if (tariff.perWeek && tariff.perWeek.length > 50) {
            newErrors.tariff.perWeek = "Тариф за неделю должен быть не более 50 символов";
            valid = false;
        }
        if (tariff.additionalInfo && tariff.additionalInfo.length > 255) {
            newErrors.tariff.additionalInfo = "Дополнительная информация тарифа должна быть не более 255 символов";
            valid = false;
        }
        if (!address.locality) {
            newErrors.address.locality = "Населенный пункт обязателен";
            valid = false;
        }
        if (!address.street) {
            newErrors.address.street = "Улица обязательна";
            valid = false;
        }
        if (!address.houseNumber) {
            newErrors.address.houseNumber = "Номер дома обязателен";
            valid = false;
        }

        setFormErrors(newErrors);
        return valid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
    };

    const handleTariffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTariff((prev) => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, autoRenew: e.target.checked }));
    };

    const processImage = (file: File): Promise<Image> => {
        return new Promise((resolve, reject) => {
            if (file.size > MAX_FILE_SIZE) {
                reject("Размер изображения превышает 5MB");
                return;
            }
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                reject("Изображение должно быть в формате PNG или JPEG");
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
            reader.onerror = () => reject("Ошибка чтения файла");
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
                additionalImages: `Вы можете загрузить максимум ${MAX_ADDITIONAL_IMAGES} дополнительных изображений`,
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
                new Blob(
                    [
                        JSON.stringify({
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
            setAdditionalImages([]);
            setDeleteImageKeys([]);
        } catch (error) {
            const axiosError = error as AxiosError;
            let errorMessage = "Не удалось обновить объявление";
            if (axiosError.response) {
                if (axiosError.response.status === 400) {
                    // const errorData = axiosError.response.data as { [key: string]: string };
                } else if (axiosError.response.status === 404) {
                    errorMessage = "Объявление не найдено.";
                } else if (axiosError.response.status === 405) {
                    errorMessage = "Сервер не поддерживает эту операцию. Обратитесь в поддержку.";
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
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Основные данные:
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
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
                                ? `Новые изображения: ${additionalImages
                                    .filter((img) => img.isNew)
                                    .map((img) => img.file!.name)
                                    .join(", ")}`
                                : additionalImages.length > 0
                                    ? "Текущие дополнительные изображения"
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
                        {additionalImages.length > 0 && (
                            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                                {additionalImages.map((image) => (
                                    <Box key={image.key} sx={{ position: "relative" }}>
                                        <img
                                            src={image.preview}
                                            alt="Additional image"
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
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Адрес:
                    </Typography>
                    <TextField
                        label="Район"
                        name="district"
                        value={address.district}
                        onChange={handleAddressChange}
                        fullWidth
                        error={!!formErrors.address.district}
                        helperText={formErrors.address.district}
                    />
                    <TextField
                        label="Населенный пункт"
                        name="locality"
                        value={address.locality}
                        onChange={handleAddressChange}
                        fullWidth
                        required
                        error={!!formErrors.address.locality}
                        helperText={formErrors.address.locality}
                    />
                    <TextField
                        label="Улица"
                        name="street"
                        value={address.street}
                        onChange={handleAddressChange}
                        fullWidth
                        required
                        error={!!formErrors.address.street}
                        helperText={formErrors.address.street}
                    />
                    <TextField
                        label="Номер дома"
                        name="houseNumber"
                        value={address.houseNumber}
                        onChange={handleAddressChange}
                        fullWidth
                        required
                        error={!!formErrors.address.houseNumber}
                        helperText={formErrors.address.houseNumber}
                    />
                    <TextField
                        label="Дополнительная информация"
                        name="additionalInfo"
                        value={address.additionalInfo}
                        onChange={handleAddressChange}
                        fullWidth
                        error={!!formErrors.address.additionalInfo}
                        helperText={formErrors.address.additionalInfo}
                    />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Цены и тарифы:
                    </Typography>
                    <TextField
                        label="Тариф за час"
                        name="perHour"
                        value={tariff.perHour}
                        onChange={handleTariffChange}
                        fullWidth
                        required
                        error={!!formErrors.tariff.perHour}
                        helperText={formErrors.tariff.perHour}
                    />
                    <TextField
                        label="Тариф за день"
                        name="perDay"
                        value={tariff.perDay}
                        onChange={handleTariffChange}
                        fullWidth
                        error={!!formErrors.tariff.perDay}
                        helperText={formErrors.tariff.perDay}
                    />
                    <TextField
                        label="Тариф за неделю"
                        name="perWeek"
                        value={tariff.perWeek}
                        onChange={handleTariffChange}
                        fullWidth
                        error={!!formErrors.tariff.perWeek}
                        helperText={formErrors.tariff.perWeek}
                    />
                    <TextField
                        label="Дополнительная информация тарифа"
                        name="additionalInfo"
                        value={tariff.additionalInfo}
                        onChange={handleTariffChange}
                        fullWidth
                        error={!!formErrors.tariff.additionalInfo}
                        helperText={formErrors.tariff.additionalInfo}
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