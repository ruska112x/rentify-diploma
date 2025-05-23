import React, { useState, FormEvent } from "react";
import { TextField, Button, Container, Typography, Box, Alert, IconButton, InputAdornment, Paper } from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";
import { AppDispatch } from "../state/store";
import { setAccessToken } from "../state/authSlice";
import api from "../api/api";
import { ErrorRegisterResponse, AccessToken } from "../shared/types";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }
    if (password.length < 8) {
      setFieldErrors({ password: "Пароль должен содержать не менее 8 символов." });
      return;
    }
    try {
      const response = await api.post<AccessToken>("/auth/login", {
        email,
        password,
      });
      dispatch(setAccessToken({
        accessToken: response.data.accessToken
      }));
      navigate("/");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorRegisterResponse>;
      if (axiosError.response?.status === 404) {
        const errorData = axiosError.response.data;
        setFieldErrors({
          email: errorData.error,
        });

        if (!errorData.error) {
          setError("Возникла ошибка. Пожалуйста, попробуйте еще раз.");
        }
      } else if (axiosError.response?.status === 400) { 
        const errorData = axiosError.response.data as { password: string };
        setFieldErrors({
          password: errorData.password,
        });
      } else {
        console.error("Register error:", error);
        setError("Возникла ошибка. Пожалуйста, попробуйте еще раз.");
      }
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Paper component={Container} maxWidth="xs" sx={{ mt: 4, p: 4 }}>
      <Box sx={{ mt: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography component="h1" variant="h5">
          Вход
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Войти
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default Login;