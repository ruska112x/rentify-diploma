import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container,
    Box,
    List,
    ListItem,
    ListItemText,
    Alert,
    Button
} from '@mui/material';
import { AppDispatch, RootState } from '../state/store';
import { clearUserInfo, fetchUser } from '../state/userSlice';
import authoredApi from '../api/authoredApi';
import { logoutUser } from '../state/authSlice';
import { useNavigate } from 'react-router';
import ProfileEditDialog from '../dialogs/ProfileEditDialog';
import LoadingSpinner from './LoadingSpinner';
import ImageSquare from './ImageSquare';

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
            navigate('/login');
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete account. Please try again.');
        }
    }

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    if (error) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
                <ImageSquare imageUrl={user.imageData.link} fallbackText='Profile Photo' />
                <List>
                    <ListItem>
                        <ListItemText primary="Email" secondary={user.email} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="First Name" secondary={user.firstName} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Last Name" secondary={user.lastName} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Phone" secondary={user.phone} />
                    </ListItem>
                </List>
                <Button variant="contained" onClick={handleOpen} sx={{ mt: 2, mr: 2 }}>
                    Edit Profile
                </Button>
                <Button variant="contained" color="error" onClick={handleDelete} sx={{ mt: 2, mr: 2 }}>
                    Delete Account
                </Button>
            </Box>

            <ProfileEditDialog isOpen={open} userId={userId} user={user} handleClose={handleClose} />
        </>
    );
}
export default ProfileCard;
