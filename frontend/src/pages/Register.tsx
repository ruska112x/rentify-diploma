import React, { useState, FormEvent } from 'react';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';
import { IMaskInput } from 'react-imask';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import axios, { AxiosError } from 'axios';
import { AppDispatch } from '../state/store';
import { setTokens } from '../state/authSlice';

interface RegisterResponse {
    accessToken: string;
    refreshToken?: string;
}

interface ErrorRegisterResponse {
    error?: string;
}

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

// Компонент для маскированного ввода
const PhoneMaskInput = React.forwardRef<HTMLInputElement, any>((props, ref) => {
    const { onChange, ...other } = props;
    return (
        <IMaskInput
            {...other}
            mask="+{7} (000) 000-0000"
            inputRef={ref}
            onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
            overwrite
        />
    );
});

const Register: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rPassword, setRPassword] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{
        email?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
    }>({});
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const validatePhone = (value: string): string | null => {
        const cleanValue = value.replace(/[^+\d]/g, '');
        if (!cleanValue) return "Phone number is required";
        if (!phoneRegex.test(cleanValue)) return "Phone number must follow the international format";
        return null;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPhone(value);
        setPhoneError(validatePhone(value));
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
            setError('Passwords do not match');
            return;
        }

        const cleanPhone = phone.replace(/[^+\d]/g, '');

        try {
            const response = await axios.post<RegisterResponse>(
                'http://localhost:8080/api/auth/register',
                {
                    email,
                    password,
                    firstName,
                    lastName,
                    phone: cleanPhone,
                },
                { withCredentials: true }
            );
            dispatch(setTokens({
                accessToken: response.data.accessToken
            }));
            navigate('/');
        } catch (error) {
            const axiosError = error as AxiosError<ErrorRegisterResponse>;
            if (axiosError.response?.status === 409) {
                const errorData = axiosError.response.data;
                setFieldErrors({
                    email: errorData.error === 'Email already exists' ? errorData.error : undefined,
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
                });
            } else {
                console.error("Register error:", error);
                setError("An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Register
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Email Address"
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
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!fieldErrors.password}
                        helperText={fieldErrors.password}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Confirm password"
                        type="password"
                        value={rPassword}
                        onChange={(e) => setRPassword(e.target.value)}
                        onPaste={(e) => e.preventDefault()}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        error={!!fieldErrors.firstName}
                        helperText={fieldErrors.firstName}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        error={!!fieldErrors.lastName}
                        helperText={fieldErrors.lastName}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Phone Number"
                        placeholder="+1 (234) 567-8900"
                        value={phone}
                        onChange={handlePhoneChange}
                        InputProps={{
                            inputComponent: PhoneMaskInput as any, // Используем react-imask
                        }}
                        error={!!phoneError || !!fieldErrors.phone}
                        helperText={phoneError || fieldErrors.phone || "Use international format"}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={!!phoneError}
                    >
                        Register
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Register;
