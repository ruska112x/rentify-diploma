import { useEffect, useState } from "react";
import authoredApi from "../api/authoredApi";
import { OneRentalListing } from "../shared/types";
import {
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Container,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    FormControlLabel,
    DialogActions,
    Button,
    Switch
} from '@mui/material';

const RentalListingsCard: React.FC<{ userId: string }> = ({ userId }) => {
    const [rentalListings, setRentalListings] = useState<Array<OneRentalListing>>([]);
    const [loading, setLoading] = useState(true);
    const initializeRentalListings = async () => {
        await authoredApi.get(`/user/${userId}/rentalListings`)
            .then((response) => {
                setRentalListings(response.data);
            }).catch((error) => {
                console.error('Error fetching rental listings:', error);
            });
    };
    useEffect(() => {
        initializeRentalListings();
        setLoading(false);
    }, [])

    const [open, setOpen] = useState(false);

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

    const handleClose = () => {
        setOpen(false);
        setFormErrors({
            title: '',
            description: '',
            address: '',
            tariffDescription: '',
            autoRenew: ''
        });
    };

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

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }
    return (
        <>
            <Box sx={{ mt: 1 }}>
                <Typography variant="h5">Rentail Listngs</Typography>
                {
                    rentalListings.length === 0 ?
                        (<Typography variant="body1" sx={{ mt: 2 }}>
                            No rental listings found.
                        </Typography>
                        ) : (
                            <List>
                                {rentalListings.map((rental, index) => (
                                    <Paper key={index} elevation={2} sx={{ mb: 2 }}>
                                        <ListItem>
                                            <ListItemText
                                                primary={rental.title}
                                                secondary={
                                                    <>
                                                        <Typography component="span" variant="body2">
                                                            {rental.description}
                                                        </Typography>
                                                        <br />
                                                        <Typography component="span" variant="body2">
                                                            Address: {rental.address}
                                                        </Typography>
                                                        <br />
                                                        <Typography component="span" variant="body2">
                                                            Tariff: {rental.tariffDescription}
                                                        </Typography>
                                                        <br />
                                                        <Typography component="span" variant="body2">
                                                            Auto Renew: {rental.autoRenew ? 'Yes' : 'No'}
                                                        </Typography>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                    </Paper>
                                ))}
                            </List>
                        )
                }
                <Button variant="contained" onClick={() => setOpen(true)}>
                    Add Rental Listing
                </Button>
            </Box>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default RentalListingsCard;