import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import authoredApi from '../api/authoredApi';
import PhoneMaskInput, { phoneRegex } from '../components/PhoneMaskInput';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../state/store';
import { fetchUser } from '../state/userSlice';
import { User } from '../shared/types';

interface ProfileEditDialogProps {
    isOpen: boolean;
    userId: string;
    user: User | null;
    handleClose: () => void;
}

const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({ isOpen, userId, user, handleClose }) => {
    const dispatch = useDispatch<AppDispatch>();

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

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const innerHandleClose = () => {
        handleClose();
        setFormErrors({ firstName: '', lastName: '', phone: '' });
    }

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
        if (!formData.phone || !phoneRegex.test(formData.phone) || (formData.phone.length < 12)) {
            errors.phone = 'Phone must follow international format (e.g., +123456789)';
            valid = false;
        }

        setFormErrors(errors);
        return valid;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            await authoredApi.patch(`/user/${userId}`, formData);
            await dispatch(fetchUser(userId)).unwrap();
            handleClose();
        } catch (err) {
            console.error('Update error:', err);
            alert('Failed to update profile. Please try again.');
        }
    };


    return (
        <Dialog open={isOpen} onClose={handleClose}>
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
                <Button onClick={innerHandleClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ProfileEditDialog;
