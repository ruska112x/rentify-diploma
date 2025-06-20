import React, { useState, FormEvent, ChangeEvent } from "react";
import { TextField, Button, Container, Typography, Box, Alert, InputAdornment, IconButton, Paper } from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";
import { AppDispatch } from "../state/store";
import { setAccessToken } from "../state/authSlice";
import { ErrorRegisterResponse, AccessToken } from "../shared/types";
import api from "../api/api";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PhoneMaskInput, { phoneRegex } from "../components/PhoneMaskInput";

const Register: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [rPassword, setRPassword] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{
        email?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        profilePicture?: string;
    }>({});
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const validatePhone = (value: string): string | null => {
        const cleanValue = value.replace(/[^+\d]/g, "");
        if (!cleanValue) return "Номер телефона обязателен";
        if (!phoneRegex.test(cleanValue)) return "Номер телефона должен быть в международном формате";
        if (cleanValue.length < 12) return "Номер телефона должен содержать 11 цифр";
        return null;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhone(value);
        setPhoneError(validatePhone(value));
    };

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
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

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImage(file);
        }
    };

    const processImage = (file: File) => {
        const allowedFileTypes = ["image/png", "image/jpeg"];
        if (file.size > MAX_FILE_SIZE) {
            setFieldErrors(prev => ({
                ...prev,
                profilePicture: "Изображение слишком большого размера. Максимальный размер 5 МБ"
            }));
            setProfilePicture(null);
            setImagePreview(null);
            return;
        }

        if (!allowedFileTypes.includes(file.type)) {
            setFieldErrors(prev => ({
                ...prev,
                profilePicture: "Недопустимый формат файла. Допустимые форматы: PNG, JPEG"
            }));
            setProfilePicture(null);
            setImagePreview(null);
            return;
        }

        setProfilePicture(file);
        setFieldErrors(prev => ({ ...prev, profilePicture: undefined }));

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        const phoneValidationError = validatePhone(phone);
        if (phoneValidationError) {
            setPhoneError(phoneValidationError);
            return;
        }

        if (password !== rPassword) {
            setError("Пароли не совпадают");
            return;
        }

        const cleanPhone = phone.replace(/[^+\d]/g, "");

        const formFields = {
            email,
            password,
            firstName,
            lastName,
            phone: cleanPhone,
        };

        const formData = new FormData();
        formData.append("data", new Blob([JSON.stringify(formFields)], { type: "application/json" }));
        if (profilePicture) {
            formData.append("profilePicture", profilePicture);
        }

        try {
            const response = await api.post<AccessToken>(
                "/auth/register",
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            dispatch(setAccessToken({
                accessToken: response.data.accessToken
            }));
            navigate("/");
        } catch (error) {
            const axiosError = error as AxiosError<ErrorRegisterResponse>;
            if (axiosError.response?.status === 409) {
                const errorData = axiosError.response.data;
                setFieldErrors({
                    email: errorData.error,
                });
                if (!errorData.error) {
                    setError("An unexpected error occurred. Please try again.");
                }
            } else if (axiosError.response?.status === 400) {
                const errorData = axiosError.response.data as { [key: string]: string };
                setFieldErrors({
                    email: errorData.email,
                    password: errorData.password,
                    firstName: errorData.firstName,
                    lastName: errorData.lastName,
                    phone: errorData.phone,
                    profilePicture: errorData.profilePicture,
                });
            } else {
                console.error("Register error:", error);
                setError("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <Paper component={Container} maxWidth="xs" sx={{ mt: 4, p: 4 }}>
            <Box sx={{ mt: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
                    Регистрация
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Box
                        sx={{
                            mt: 2,
                            border: "2px dashed",
                            borderColor: fieldErrors.profilePicture ? "error.main" : "grey.500",
                            borderRadius: 2,
                            p: 3,
                            textAlign: "center",
                            bgcolor: "grey.50",
                            "&:hover": { bgcolor: "grey.100" },
                            minHeight: "120px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Загрузите фотографию профиля:
                        </Typography>
                        <Typography variant="body2" color="grey" sx={{ mb: 2 }}>
                            {profilePicture ? `Selected: ${profilePicture.name}` : "Перенесите файл сюда или нажмите, чтобы выбрать"}
                        </Typography>
                        <Button
                            variant="outlined"
                            component="label"
                            sx={{ textTransform: "none" }}
                        >
                            Выбрать файл
                            <input
                                type="file"
                                hidden
                                accept="image/png,image/jpeg"
                                onChange={handleImageChange}
                            />
                        </Button>
                        {fieldErrors.profilePicture && (
                            <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                                {fieldErrors.profilePicture}
                            </Typography>
                        )}
                        {imagePreview && (
                            <Box sx={{ mt: 2, textAlign: "center" }}>
                                <img
                                    src={imagePreview}
                                    alt="Profile preview"
                                    style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "4px" }}
                                />
                            </Box>
                        )}
                    </Box>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Электронная почта"
                        placeholder="example@mail.org"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!fieldErrors.email}
                        helperText={fieldErrors.email}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Пароль"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!fieldErrors.password}
                        helperText={fieldErrors.password}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Повторите пароль"
                        type="password"
                        value={rPassword}
                        onChange={(e) => setRPassword(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Имя"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        error={!!fieldErrors.firstName}
                        helperText={fieldErrors.firstName}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Фамилия"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        error={!!fieldErrors.lastName}
                        helperText={fieldErrors.lastName}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Номер телефона"
                        placeholder="+7 (123) 456-7890"
                        value={phone}
                        onChange={handlePhoneChange}
                        error={!!phoneError || !!fieldErrors.phone}
                        helperText={phoneError || fieldErrors.phone || "Используйте формат +7 (123) 456-7890"}
                        slotProps={{
                            input: {
                                inputComponent: PhoneMaskInput,
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={!!phoneError}
                    >
                        Зарегистрироваться
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default Register;