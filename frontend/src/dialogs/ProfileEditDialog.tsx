import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    Typography,
} from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import authoredApi from "../api/authoredApi";
import PhoneMaskInput, { phoneRegex } from "../components/PhoneMaskInput";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../state/store";
import { fetchUser } from "../state/userSlice";
import { ExtendedUser } from "../shared/types";
import TransparentLoadingSpinner from "../components/TransparentLoadingSpinner";

interface ProfileEditDialogProps {
    isOpen: boolean;
    userId: string;
    user: ExtendedUser | null;
    handleClose: () => void;
}

const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({ isOpen, userId, user, handleClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [deleteMainImage, setDeleteMainImage] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
    });
    const [formErrors, setFormErrors] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        profilePicture: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
            });
            setImagePreview(user.imageData.link);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const innerHandleClose = () => {
        handleClose();
        setFormErrors({ firstName: "", lastName: "", phone: "", profilePicture: "" });
    }

    const validateForm = () => {
        let valid = true;
        const errors = { firstName: "", lastName: "", phone: "", profilePicture: "" };

        if (!formData.firstName || formData.firstName.length < 1 || formData.firstName.length > 255) {
            errors.firstName = "First name must be between 1 and 255 characters";
            valid = false;
        }
        if (!formData.lastName || formData.lastName.length < 1 || formData.lastName.length > 255) {
            errors.lastName = "Last name must be between 1 and 255 characters";
            valid = false;
        }

        formData.phone = formData.phone.replace(/[^+\d]/g, "");
        if (!formData.phone || !phoneRegex.test(formData.phone) || (formData.phone.length < 12)) {
            errors.phone = "Phone must follow international format (e.g., +123456789)";
            valid = false;
        }

        setFormErrors(errors);
        return valid;
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImage(file);
        }
    };

    const processImage = (file: File) => {
        const allowedFileTypes = ["image/png", "image/jpeg"];
        if (file.size > MAX_FILE_SIZE) {
            setFormErrors(prev => ({
                ...prev,
                profilePicture: "Image size must be less than 5MB"
            }));
            setProfilePicture(null);
            setImagePreview(null);
            return;
        }

        if (!allowedFileTypes.includes(file.type)) {
            setFormErrors(prev => ({
                ...prev,
                profilePicture: "Please upload a PNG or JPEG image"
            }));
            setProfilePicture(null);
            setImagePreview(null);
            return;
        }

        setProfilePicture(file);
        setFormErrors(prev => ({ ...prev, profilePicture: "" }));

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processImage(file);
        }
    };

    const handleDeletePhoto = () => {
        setProfilePicture(null);
        setImagePreview(null);
        setFormErrors(prev => ({ ...prev, profilePicture: "" }));
        const input = document.querySelector("input[type=\"file\"]") as HTMLInputElement;
        if (input) {
            input.value = "";
        }
        setDeleteMainImage(true);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        const finalFormData = new FormData();
        finalFormData.append("data", new Blob([JSON.stringify(formData)], { type: "application/json" }));
        if (profilePicture) {
            if (user?.imageData.link) {
                finalFormData.append("mainImageAction", "change")
                finalFormData.append("mainImageFile", profilePicture);
            } else {
                finalFormData.append("mainImageAction", "add")
                finalFormData.append("mainImageFile", profilePicture);
            }
        } else {
            if (deleteMainImage) {
                finalFormData.append("mainImageAction", "delete");
            }
        }

        try {
            await authoredApi.patch(`/users/${userId}`, finalFormData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            await dispatch(fetchUser(userId)).unwrap();
            handleClose();
        } catch (err) {
            console.error("Update error:", err);
            alert("Не удалось обновить профиль. Попробуйте позже.");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Dialog open={isOpen} onClose={handleClose}>
            <DialogTitle>Редактировать профиль</DialogTitle>
            <Box
                sx={{
                    mt: 2,
                    border: "2px dashed",
                    borderColor: formErrors.profilePicture ? "error.main" : "grey.500",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    bgcolor: "grey.50",
                    "&:hover": { bgcolor: "grey.100" },
                    minHeight: "120px",
                    maxWidth: "400px",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <Typography variant="body1" sx={{ mb: 2 }}>
                    {profilePicture ? `Выбрано: ${profilePicture.name}` : "Перетащите сюда изображение или нажмите, чтобы выбрать"}
                </Typography>
                <Button
                    variant="outlined"
                    component="label"
                    sx={{ textTransform: "none" }}
                >
                    Выбрать изображение
                    <input
                        type="file"
                        hidden
                        accept="image/png,image/jpeg"
                        onChange={handleImageChange}
                    />
                </Button>
                {formErrors.profilePicture && (
                    <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                        {formErrors.profilePicture}
                    </Typography>
                )}
                {imagePreview && (
                    <>
                        <Box sx={{ mt: 2, textAlign: "center" }}>
                            <img
                                src={imagePreview}
                                alt="Profile preview"
                                style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "4px" }}
                            />
                        </Box>
                        <Button onClick={handleDeletePhoto} sx={{ mt: 2 }}>
                            Удалить фото
                        </Button>
                    </>
                )}
            </Box>
            <DialogContent>
                <TextField
                    margin="dense"
                    label="Имя"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    fullWidth
                    error={!!formErrors.firstName}
                    helperText={formErrors.firstName}
                />
                <TextField
                    margin="dense"
                    label="Фамилия"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    fullWidth
                    error={!!formErrors.lastName}
                    helperText={formErrors.lastName}
                />
                <TextField
                    margin="dense"
                    label="Номер телефона"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth
                    error={!!formErrors.phone}
                    helperText={formErrors.phone || "Формат: +7 (123) 456-7890"}
                    slotProps={{
                        input: {
                            inputComponent: PhoneMaskInput,
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={innerHandleClose}>Отменить</Button>
                <Button onClick={handleSubmit} variant="contained">
                    Сохранить
                </Button>
            </DialogActions>
            <TransparentLoadingSpinner isLoading={isLoading}/>
        </Dialog>
    )
}

export default ProfileEditDialog;
