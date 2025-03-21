import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { AppDispatch, RootState } from '../state/store';
import { fetchUser } from '../state/userSlice';
import { refresh } from '../state/authSlice';

const MyProfile: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, loading, error } = useSelector((state: RootState) => state.user);
    const { isAuthenticated, userEmail } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const initialize = async () => {
            await dispatch(refresh()).unwrap();

            if (isAuthenticated) {
                dispatch(fetchUser(userEmail));
            }
        };
        initialize();
    }, [dispatch, isAuthenticated]);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Account Details
                </Typography>
                <Box sx={{ mt: 2 }}>
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
                </Box>
            </Paper>
        </Container>
    );
};

export default MyProfile;