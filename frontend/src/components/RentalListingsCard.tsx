import { useEffect, useState } from "react";
import authoredApi from "../api/authoredApi";
import { ExtendedRentalListing } from "../shared/types";
import {
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    Button,
} from '@mui/material';
import RentalListingAddDialog from "../dialogs/RentalListingAddDialog";
import RentalListingEditDialog from "../dialogs/RentalListingEditDialog";
import { Link } from "react-router";
import api from "../api/api";
import LoadingSpinner from "./LoadingSpinner";
import ImageSquare from "./ImageSquare";

interface RentalListingsCardProps {
    userId: string;
}

const RentalListingsCard: React.FC<RentalListingsCardProps> = ({ userId }) => {
    const [rentalListings, setRentalListings] = useState<Array<ExtendedRentalListing>>([]);
    const [loading, setLoading] = useState(true);

    const initializeRentalListings = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/users/${userId}/rentalListings`);
            const listings: ExtendedRentalListing[] = response.data;
            setRentalListings(listings);
        } catch (error) {
            console.error('Error fetching rental listings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeRentalListings();
    }, [userId]);

    const [open, setOpen] = useState(false);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [rentalToPass, setRentalToPass] = useState<ExtendedRentalListing>({
        id: '',
        title: '',
        description: '',
        address: '',
        tariffDescription: '',
        autoRenew: false,
        mainImageData: {
            key: null,
            link: '',
        },
        additionalImagesData: [],
        userId: '',
    });

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpenEditDialog = (rental: ExtendedRentalListing) => {
        setOpenUpdateDialog(true);
        setRentalToPass(rental);
    };

    const handleCloseUpdateDialog = () => {
        setOpenUpdateDialog(false);
    };

    const handleDelete = async (id: string) => {
        try {
            await authoredApi.delete(`/rentalListings/${id}`);
            setRentalListings(rentalListings.filter((rental) => rental.id !== id));
            initializeRentalListings();
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete rental listing. Please try again.');
        }
    };

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    return (
        <>
            <Box sx={{ mt: 1 }}>
                <Typography variant="h5">Rental Listings</Typography>
                {rentalListings.length === 0 ? (
                    <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                        No rental listings found.
                    </Typography>
                ) : (
                    <List>
                        {rentalListings.map((rental) => (
                            <Paper key={rental.id} elevation={2} sx={{ mb: 2, p: 2 }}>
                                <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                        <ImageSquare imageUrl={rental.mainImageData.link} fallbackText="Rental Main Photo" />
                                        {rental.additionalImagesData.map((imageData, idx)  => (
                                            <ImageSquare key={`${rental.id}-additional-${idx}`} imageUrl={imageData.link} fallbackText={`Additional Image ${idx}`} />
                                        ))}
                                    </Box>
                                    <Link key={rental.id} to={`/rentalListings/${rental.id}`} style={{ textDecoration: 'none' }}>
                                        <Typography variant="h6">{rental.title}</Typography>
                                    </Link>
                                    <Box display="flex" flexDirection="column">
                                        <Typography component="span" variant="body2" sx={{ mt: 1 }}>
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
                                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleOpenEditDialog(rental)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDelete(rental.id)}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    </Box>
                                </ListItem>
                            </Paper>
                        ))}
                    </List>
                )}
                <Button variant="contained" onClick={() => setOpen(true)}>
                    Add Rental Listing
                </Button>
            </Box>

            <RentalListingAddDialog
                isOpen={open}
                userId={userId}
                handleClose={handleClose}
                initializeRentalListings={initializeRentalListings}
            />
            <RentalListingEditDialog
                isOpen={openUpdateDialog}
                rental={rentalToPass}
                handleClose={handleCloseUpdateDialog}
                initializeRentalListings={initializeRentalListings}
            />
        </>
    );
};

export default RentalListingsCard;
