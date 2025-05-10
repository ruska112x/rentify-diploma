import { useEffect, useState } from 'react';
import { ExtendedRentalListing, ExtendedUser } from '../shared/types';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
} from '@mui/material';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageSquare from '../components/ImageSquare';
import authoredApi from '../api/authoredApi';
import BookingAddDialog from '../dialogs/BookingAddDialog';
import { parseJwtPayload } from '../shared/jwtDecode';
import { useSelector } from 'react-redux';
import { RootState } from '../state/store';

const ExtendedRentalListingPage: React.FC<{ rentalListingId: string | undefined }> = ({ rentalListingId }) => {
    const { accessToken } = useSelector((state: RootState) => state.auth);
    const [listing, setListing] = useState<ExtendedRentalListing | null>(null);
    const [user, setUser] = useState<ExtendedUser>({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        roleName: "",
        imageData: {
            key: "",
            link: ""
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

    const handleOpenBookingDialog = () => {
        setIsBookingDialogOpen(true);
    };

    const handleCloseBookingDialog = () => {
        setIsBookingDialogOpen(false);
    };

    const handleBookingSuccess = () => { };

    const isNotMyRentalListing = () => {
        const userId = parseJwtPayload(accessToken!).sub;
        return listing && userId !== listing.userId;
    };

    const fetchRentalListing = async () => {
        if (!rentalListingId) {
            setError('Invalid rental listing ID');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await authoredApi.get(`/rentalListings/${rentalListingId}`);
            setListing(response.data);
            const userResponse = await authoredApi.get(`/users/${response.data.userId}`);
            setUser(userResponse.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching rental listing:', err);
            setError('Failed to load rental listing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRentalListing();
    }, [rentalListingId]);

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    if (error || !listing) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography variant="h6" color="error">
                    {error || 'Rental listing not found'}
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                >
                    Back to Listings
                </Button>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={2}>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h4" gutterBottom>
                            {listing.title}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            <ImageSquare imageUrl={listing.mainImageData.link} showFullScreen={true} size={256} altText="Главное изображение объявления" />
                            {listing.additionalImagesData.map((imageData, idx) => (
                                <ImageSquare key={`${listing.id}-additional-${idx}`} imageUrl={imageData.link} showFullScreen={true} size={196} altText={`Дополнительное изображение ${idx}`} />
                            ))}
                        </Box>
                        <Box>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Description:</strong> {listing.description || 'No description provided'}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Address:</strong> {listing.address}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Tariff:</strong> {listing.tariffDescription}
                            </Typography>
                        </Box>
                    </Box>
                    <Box marginTop={4} sx={{ backgroundColor: '#f5f5f5', padding: 2, borderRadius: 2, width: '300px' }}>
                        <Typography variant="h5" gutterBottom>
                            <Link key={listing.userId} to={`/users/${listing.userId}`} style={{ textDecoration: 'none' }}>
                                Owner
                            </Link>
                        </Typography>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <ImageSquare imageUrl={user.imageData.link} altText="Фото пользователя" />
                        </Box>
                        <Typography variant="h6" gutterBottom>
                            {user.firstName + " " + user.lastName}
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                            Email: {user.email}
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                            Phone: {user.phone}
                        </Typography>
                    </Box>
                </Box>
                {
                    isNotMyRentalListing() && (
                        <Box sx={{ margin: 2 }}>
                            <Button variant="contained" sx={{ mb: 2}} onClick={handleOpenBookingDialog}>
                                Book
                            </Button>
                        </Box>
                    )
                }
            </Paper>
            <BookingAddDialog
                isOpen={isBookingDialogOpen}
                rentalListingId={rentalListingId!}
                handleClose={handleCloseBookingDialog}
                onBookingSuccess={handleBookingSuccess}
            />
        </Container>
    );
};

export default ExtendedRentalListingPage;
