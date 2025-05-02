import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { User, OneRentalListing } from '../shared/types';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import api from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';

const UserProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [rentalListings, setRentalListings] = useState<OneRentalListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchUserData = async () => {
        if (!userId) {
            setError('Invalid user ID');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const userResponse = await api.get(`/users/${userId}`);
            const listingsResponse = await api.get(`/users/${userId}/rentalListings`);
            setUser(userResponse.data);
            setRentalListings(listingsResponse.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError('Failed to load user profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    if (error || !user) {
        return (
            <Container sx={{ mt: 4 }}>
                <Typography variant="h6" color="error">
                    {error || 'User not found'}
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/')}
                    sx={{ mt: 2 }}
                >
                    Back to Home
                </Button>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        {user.firstName} {user.lastName}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                        <Box sx={{ flexShrink: 0, textAlign: 'center' }}>
                            {user.photoLink ? (
                                <img
                                    src={user.photoLink}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    style={{
                                        width: '200px',
                                        height: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '50%',
                                        border: '2px solid #1976d2',
                                    }}
                                    loading="lazy"
                                />
                            ) : (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    No profile photo
                                </Typography>
                            )}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Email:</strong> {user.email}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Phone:</strong> {user.phone || 'Not provided'}
                            </Typography>
                        </Box>
                    </Box>
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Rental Listings
                        </Typography>
                        {rentalListings.length === 0 ? (
                            <Typography variant="body1">
                                No rental listings found.
                            </Typography>
                        ) : (
                            <List>
                                {rentalListings.map((listing, index) => (
                                    <Paper key={index} elevation={1} sx={{ mb: 2, p: 2 }}>
                                        <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                                {listing.mainPhotoLink ? (
                                                    <Box sx={{ position: 'relative' }}>
                                                        <img
                                                            src={listing.mainPhotoLink}
                                                            alt={`${listing.title} main`}
                                                            style={{
                                                                width: '150px',
                                                                height: '150px',
                                                                objectFit: 'cover',
                                                                borderRadius: '8px',
                                                                border: '2px solid #1976d2',
                                                            }}
                                                            loading="lazy"
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
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    >
                                                        No main image
                                                    </Typography>
                                                )}
                                                {listing.additionalPhotoLinks.map((url, idx) => (
                                                    <img
                                                        key={idx}
                                                        src={url}
                                                        alt={`${listing.title} additional ${idx + 1}`}
                                                        style={{
                                                            width: '150px',
                                                            height: '150px',
                                                            objectFit: 'cover',
                                                            borderRadius: '4px',
                                                        }}
                                                        loading="lazy"
                                                    />
                                                ))}
                                            </Box>
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="h6"
                                                        component={Link}
                                                        to={`/rentalListings/${listing.id}`}
                                                        sx={{ textDecoration: 'none', color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                                                    >
                                                        {listing.title}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box display="flex" flexDirection="column">
                                                        <Typography component="span" variant="body2" sx={{ mt: 1 }}>
                                                            {listing.description || 'No description provided'}
                                                        </Typography>
                                                        <Typography component="span" variant="body2">
                                                            Address: {listing.address}
                                                        </Typography>
                                                        <Typography component="span" variant="body2">
                                                            Tariff: {listing.tariffDescription}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    </Paper>
                                ))}
                            </List>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default UserProfilePage;