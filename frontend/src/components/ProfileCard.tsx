import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Container,
    Box,
    List,
    ListItem,
    ListItemText,
    Alert,
    Button,
    Dialog
} from "@mui/material";
import { AppDispatch, RootState } from "../state/store";
import { clearUserInfo, fetchUser } from "../state/userSlice";
import authoredApi from "../api/authoredApi";
import { logoutUser } from "../state/authSlice";
import { useNavigate } from "react-router";
import ProfileEditDialog from "../dialogs/ProfileEditDialog";
import LoadingSpinner from "./LoadingSpinner";
import ImageSquare from "./ImageSquare";
import { AxiosError } from "axios";

const ProfileCard: React.FC<{ userId: string }> = ({ userId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user, loading, error } = useSelector((state: RootState) => state.user);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const initialize = async () => {
            if (userId && !user) {
                await dispatch(fetchUser(userId)).unwrap();
            }
        };
        initialize();
    }, [dispatch, userId, user]);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleDelete = async () => {
        try {
            await authoredApi.delete(`/users`);
            await dispatch(logoutUser()).unwrap();
            await dispatch(clearUserInfo());
            navigate("/login");
        } catch (err) {
            const axiosError = err as AxiosError;
            if (axiosError.status === 400) {
                setOnDeleteFailDialog(true);
                return;
            }
            console.error("Delete error:", err);
            alert("Не удалось удалить аккаунт. Пожалуйста, попробуйте позже.");
        }
    }

    const [onDeleteFailDialog, setOnDeleteFailDialog] = useState(false);
    const onDeleteFailDialogHandleClose = () => {
        setOnDeleteFailDialog(false);
    };

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    if (error) {
        return (
            <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <Box sx={{ mt: 2 }}>
                <ImageSquare imageUrl={user.imageData.link} altText="Фото пользователя" />
                <List>
                    <ListItem>
                        <ListItemText primary="Электронная почта" secondary={user.email} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Имя" secondary={user.firstName} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Фамилия" secondary={user.lastName} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Номер телефона" secondary={user.phone} />
                    </ListItem>
                </List>
                <Button variant="contained" onClick={handleOpen} sx={{ mt: 2, mr: 2 }}>
                    Редактировать
                </Button>
                <Button variant="contained" color="error" onClick={handleDelete} sx={{ mt: 2, mr: 2 }}>
                    Удалить
                </Button>
            </Box>

            <ProfileEditDialog isOpen={open} userId={userId} user={user} handleClose={handleClose} />
            <Dialog open={onDeleteFailDialog} onClose={onDeleteFailDialogHandleClose}>
                <Box sx={{ p: 2 }}>
                    <Alert severity="error">Вы не можете удалить аккаунт, пока есть активные аренды на ваши объявления!</Alert>
                    <Button variant="contained" onClick={onDeleteFailDialogHandleClose} sx={{ mt: 2 }}>
                        Закрыть
                    </Button>
                </Box>
            </Dialog>
        </>
    );
}
export default ProfileCard;
