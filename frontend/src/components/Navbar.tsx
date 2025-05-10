import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { logoutUser } from "../state/authSlice";
import { AppDispatch, RootState } from "../state/store";
import { clearUserInfo } from "../state/userSlice";

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleLogout = () => {
    const logout = async () => {
      await dispatch(logoutUser()).unwrap();
      await dispatch(clearUserInfo());
    }
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="static" sx={{ borderRadius: "0 0 10px 10px" }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Button color="inherit" sx={{ fontWeight: 700 }} component={Link} to="/">
            Rentify
          </Button>
        </Typography>
        {!isAuthenticated ? (
          <>
            <Button color="inherit" component={Link} to="/login">
              Войти
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Регистрация
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/profile">
              Личный кабинет
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Выйти
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;