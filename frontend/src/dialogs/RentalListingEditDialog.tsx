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
import { useEffect, useState } from 'react';
import authoredApi from '../api/authoredApi';
import { OneRentalListing } from '../shared/types';

interface RentalListingEditDialogProps {
    isOpen: boolean;
    rental: OneRentalListing;
    handleClose: () => void;
    initializeRentalListings: () => void;
}

const RentalListingEditDialog: React.FC<RentalListingEditDialogProps> = ({ isOpen, rental, handleClose, initializeRentalListings }) => {
    const [updateFormData, setUpdateFormData] = useState({
        id: '',
        title: '',
        description: '',
        address: '',
        tariffDescription: '',
        autoRenew: false,
    });
    
    useEffect(() => {
        setUpdateFormData(
            {
                id: rental.id,
                title: rental.title,
                description: rental.description,
                address: rental.address,
                tariffDescription: rental.tariffDescription,
                autoRenew: rental.autoRenew
            }
        )
    }, [rental])

    const handleChangeUpdateDialog = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUpdateFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSwitchChangeUpdateDialog = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdateFormData((prev) => ({
            ...prev,
            autoRenew: e.target.checked,
        }));
    };

    const handleSubmitUpdateDialog = async (id: string) => {
        try {
            await authoredApi.patch(`/rentalListings/${id}`, {
                title: updateFormData.title,
                description: updateFormData.description,
                address: updateFormData.address,
                tariffDescription: updateFormData.tariffDescription,
                autoRenew: updateFormData.autoRenew,
            });
            handleClose();
            initializeRentalListings();
            setUpdateFormData({
                id: '',
                title: '',
                description: '',
                address: '',
                tariffDescription: '',
                autoRenew: false,
            });
        } catch (error) {
            console.error('Error update rental listing:', error);
        }
    }

    return (
        <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Rental Listing</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Title"
                        name="title"
                        value={updateFormData.title}
                        onChange={handleChangeUpdateDialog}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={updateFormData.description}
                        onChange={handleChangeUpdateDialog}
                        fullWidth
                        multiline
                        rows={3}
                    />
                    <TextField
                        label="Address"
                        name="address"
                        value={updateFormData.address}
                        onChange={handleChangeUpdateDialog}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Tariff Description"
                        name="tariffDescription"
                        value={updateFormData.tariffDescription}
                        onChange={handleChangeUpdateDialog}
                        fullWidth
                        required
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={updateFormData.autoRenew}
                                onChange={handleSwitchChangeUpdateDialog}
                                name="autoRenew"
                            />
                        }
                        label="Auto Renew"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={() => handleSubmitUpdateDialog(updateFormData.id)} variant="contained" color="primary">
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default RentalListingEditDialog;
