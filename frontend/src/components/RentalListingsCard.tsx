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

interface RentalListingsCardProps {
    userId: string;
}

const RentalListingsCard: React.FC<RentalListingsCardProps> = ({ userId }) => {
    const [rentalListings, setRentalListings] = useState<Array<OneRentalListing>>([]);
    const [loading, setLoading] = useState(true);

    const initializeRentalListings = async () => {
        setLoading(true);
        try {
            const response = await authoredApi.get(`/user/${userId}/rentalListings`);
            const listings: OneRentalListing[] = response.data;
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
    const [rentalToPass, setRentalToPass] = useState<OneRentalListing>({
        id: '',
        title: '',
        description: '',
        address: '',
        tariffDescription: '',
        autoRenew: false,
        mainPhotoLink: '',
        additionalPhotoLinks: [],
    });

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpenEditDialog = (rental: OneRentalListing) => {
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
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
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
                        {rentalListings.map((rental, index) => (
                            <Paper key={index} elevation={2} sx={{ mb: 2, p: 2 }}>
                                <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                        {rental.mainPhotoLink ? (
                                            <Box sx={{ position: 'relative' }}>
                                                <img
                                                    src={rental.mainPhotoLink}
                                                    alt={`${rental.title} main`}
                                                    style={{
                                                        width: '150px',
                                                        height: '150px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        border: '2px solid #1976d2',
                                                    }}
                                                />
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        left: 8,
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        px: 1,
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    Main Image
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary" sx={{ width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                No main image
                                            </Typography>
                                        )}
                                        {rental.additionalPhotoLinks.map((url, idx) => (
                                            <img
                                                key={idx}
                                                src={url}
                                                alt={`${rental.title} additional ${idx + 1}`}
                                                style={{
                                                    width: '150px',
                                                    height: '150px',
                                                    objectFit: 'cover',
                                                    borderRadius: '4px',
                                                }}
                                            />
                                        ))}
                                    </Box>
                                    <ListItemText
                                        primary={<Typography variant="h6">{rental.title}</Typography>}
                                        secondary={
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
                                        }
                                    />
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
