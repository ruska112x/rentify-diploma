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
    Button,
} from '@mui/material';
import RentalListingAddDialog from "../dialogs/RentalListingAddDialog";
import RentalListingEditDialog from "../dialogs/RentalListingEditDialog";

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
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [rentalToPass, setRentalToPass] = useState<OneRentalListing>({
        id: '',
        title: '',
        description: '',
        address: '',
        tariffDescription: '',
        autoRenew: false,
    });

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpenEditDialog = (rental: OneRentalListing) => {
        setOpenUpdateDialog(true)
        setRentalToPass(rental);
    }

    const handleCloseUpdateDialog = () => {
        setOpenUpdateDialog(false);
    }

    const handleDelete = async (id: string) => {
        try {
            await authoredApi.delete(`/rentalListings/${id}`);
            rentalListings.filter((rental) => rental.id !== id);
            setRentalListings(rentalListings);
            initializeRentalListings();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete rental listing. Please try again.');
        }
    }

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
                        (<Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                            No rental listings found.
                        </Typography>
                        ) : (
                            <List>
                                {rentalListings.map((rental, index) => (
                                    <Paper key={index} elevation={2} sx={{ mb: 2, display: 'flex', padding: 2 }}>
                                        <ListItem>
                                            <ListItemText
                                                primary={
                                                    rental.title
                                                }
                                                secondary={
                                                    <Box display={'flex'} flexDirection="column">
                                                        <Typography component="span" variant="body2">
                                                            {rental.description}
                                                        </Typography>
                                                        <Typography component="span" variant="body2">
                                                            Address: {rental.address}
                                                        </Typography>
                                                        <Typography component="span" variant="body2">
                                                            Tariff: {rental.tariffDescription}
                                                        </Typography>
                                                        <Typography component="span" variant="body2">
                                                            Auto Renew: {rental.autoRenew ? 'Yes' : 'No'}
                                                        </Typography>
                                                        <Box sx={{ mt: 2 }}>
                                                            <Button variant="contained" color="primary" sx={{ maxWidth: '8vw', mt: 1, mr: 2 }} onClick={() => handleOpenEditDialog(rental)}>
                                                                Edit
                                                            </Button>
                                                            <Button variant="contained" color="primary" sx={{ maxWidth: '8vw', mt: 1, mr: 2 }} onClick={() => handleDelete(rental.id)}>
                                                                Delete
                                                            </Button>
                                                        </Box>
                                                    </Box>
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
            
            <RentalListingAddDialog isOpen={open} userId={userId} handleClose={handleClose} initializeRentalListings={initializeRentalListings} />
            <RentalListingEditDialog isOpen={openUpdateDialog} rental={rentalToPass} handleClose={handleCloseUpdateDialog} initializeRentalListings={initializeRentalListings} />
        </>
    );
}
export default RentalListingsCard;