import React, { useEffect, useState } from 'react';
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
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tabs,
    Tab,
} from '@mui/material';
import { AppDispatch, RootState } from '../state/store';
import { fetchUser } from '../state/userSlice';
import authoredApi from '../api/authoredApi';
import PhoneMaskInput, { phoneRegex } from '../components/PhoneMaskInput';

const MyProfile: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { userId } = useSelector((state: RootState) => state.auth);
    const { user, loading, error } = useSelector((state: RootState) => state.user);

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
    });
    const [formErrors, setFormErrors] = useState({
        firstName: '',
        lastName: '',
        phone: '',
    });
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const initialize = async () => {
            if (userId && !user) {
                await dispatch(fetchUser(userId)).unwrap();
            }
        };
        initialize();
    }, [dispatch, userId, user]);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setFormErrors({ firstName: '', lastName: '', phone: '' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        let valid = true;
        const errors = { firstName: '', lastName: '', phone: '' };

        if (!formData.firstName || formData.firstName.length < 1 || formData.firstName.length > 255) {
            errors.firstName = 'First name must be between 1 and 255 characters';
            valid = false;
        }
        if (!formData.lastName || formData.lastName.length < 1 || formData.lastName.length > 255) {
            errors.lastName = 'Last name must be between 1 and 255 characters';
            valid = false;
        }

        formData.phone = formData.phone.replace(/[^+\d]/g, '');
        if (!formData.phone || !phoneRegex.test(formData.phone)) {
            errors.phone = 'Phone must follow international format (e.g., +123456789)';
            valid = false;
        }

        setFormErrors(errors);
        return valid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            await authoredApi.patch(`/api/user/${userId}`, formData);
            await dispatch(fetchUser(userId)).unwrap();
            handleClose();
        } catch (err) {
            console.error('Update error:', err);
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
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
                    <Button variant="contained" onClick={handleOpen} sx={{ mt: 2 }}>
                        Edit Profile
                    </Button>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ mt: 1, p: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} centered>
                    <Tab label="Rentail Listngs" />
                    <Tab label="Bookings" />
                    <Tab label="Reviews" />
                </Tabs>

                {tabValue === 0 && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="h5">Rentail Listngs</Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="1.1" secondary="1.2" />
                            </ListItem>
                        </List>
                    </Box>
                )}

                {tabValue === 1 && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="h5">Bookings</Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="2.1" secondary="2.2" />
                            </ListItem>
                        </List>
                    </Box>
                )}

                {tabValue === 2 && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="h5">Reviews</Typography>
                        <List>
                            <ListItem>
                                <ListItemText primary="3.1" secondary="3.2" />
                            </ListItem>
                        </List>
                    </Box>
                )}
            </Paper>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="First Name"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        fullWidth
                        error={!!formErrors.firstName}
                        helperText={formErrors.firstName}
                    />
                    <TextField
                        margin="dense"
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        fullWidth
                        error={!!formErrors.lastName}
                        helperText={formErrors.lastName}
                    />
                    <TextField
                        margin="dense"
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        fullWidth
                        error={!!formErrors.phone}
                        helperText={formErrors.phone || 'Format: +7 (123) 456-7890'}
                        slotProps={{
                            input: {
                                inputComponent: PhoneMaskInput,
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MyProfile;