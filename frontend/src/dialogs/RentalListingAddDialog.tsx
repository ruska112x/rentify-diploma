import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    FormControlLabel,
    DialogActions,
    Button,
    Switch
} from '@mui/material';
import { useState } from "react";
import authoredApi from "../api/authoredApi";

interface RentalListingAddDialogProps {
    isOpen: boolean;
    userId: string;
    handleClose: () => void;
    initializeRentalListings: () => void;
}

const RentalListingAddDialog: React.FC<RentalListingAddDialogProps> = ({ isOpen, userId, handleClose, initializeRentalListings }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        tariffDescription: '',
        autoRenew: false,
    });

    const [formErrors, setFormErrors] = useState({
        title: '',
        description: '',
        address: '',
        tariffDescription: '',
        autoRenew: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            autoRenew: e.target.checked,
        }));
    };

    const handleSubmit = async () => {
        try {
            await authoredApi.post('/rentalListings/create', {
                userId: userId,
                title: formData.title,
                description: formData.description,
                address: formData.address,
                tariffDescription: formData.tariffDescription,
                autoRenew: formData.autoRenew,
            });
            handleClose();
            initializeRentalListings();
            setFormData({
                title: '',
                description: '',
                address: '',
                tariffDescription: '',
                autoRenew: false,
            });
        } catch (error) {
            console.error('Error creating rental listing:', error);
        }
    };

    const innerHandleClose = () => {
        handleClose();
        setFormErrors({
            title: '',
            description: '',
            address: '',
            tariffDescription: '',
            autoRenew: ''
        });
    }

    return (
        <Dialog open={isOpen} onClose={innerHandleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Rental Listing</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <TextField
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Tariff Description"
                        name="tariffDescription"
                        value={formData.tariffDescription}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.autoRenew}
                                onChange={handleSwitchChange}
                                name="autoRenew"
                            />
                        }
                        label="Auto Renew"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={innerHandleClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default RentalListingAddDialog;
