import React, { useState, FormEvent } from 'react';
import { TextField, Button, Container, Typography, Box, Alert } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import axios, { AxiosError } from 'axios';
import { AppDispatch } from '../state/store';
import { setTokens } from '../state/authSlice';

interface RegisterResponse {
    accessToken: string;
}

interface ErrorRegisterResponse {
    error?: string;
}

const Register: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rPassword, setRPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== rPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const response = await axios.post<RegisterResponse>('http://localhost:8080/api/auth/register', {
                email,
                password,
            });
            dispatch(setTokens({
                accessToken: response.data.accessToken
            }));
            navigate('/');
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
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Register
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Register;