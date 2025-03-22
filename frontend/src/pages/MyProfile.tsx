import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container,
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
} from '@mui/material';
import { AppDispatch, RootState } from '../state/store';
import { fetchUser } from '../state/userSlice';

const MyProfile: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { userEmail } = useSelector((state: RootState) => state.auth);
    const { user, loading } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        const initialize = async () => {
            if (userEmail && !user) {
                await dispatch(fetchUser(userEmail)).unwrap();
            }
        };
        initialize();
    }, [dispatch, userEmail, user]);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
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