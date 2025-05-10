import { useEffect, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router";
import { ExtendedRentalListing, ExtendedUser } from "../shared/types";
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    List,
    ListItem
} from "@mui/material";
import LoadingSpinner from "../components/LoadingSpinner";
import ImageSquare from "../components/ImageSquare";
import authoredApi from "../api/authoredApi";
import { RootState } from "../state/store";
import { useSelector } from "react-redux";
import { parseJwtPayload } from "../shared/jwtDecode";

const ExtendedUserProfilePage: React.FC<{ userId: string | undefined }> = ({ userId }) => {
    const { accessToken } = useSelector((state: RootState) => state.auth);
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [rentalListings, setRentalListings] = useState<ExtendedRentalListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchUserData = async () => {
        if (!userId) {
            setError("Invalid user ID");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const userResponse = await authoredApi.get(`/users/${userId}`);
            const listingsResponse = await authoredApi.get(`/users/${userId}/rentalListings`);
            setUser(userResponse.data);
            setRentalListings(listingsResponse.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Failed to load user profile. Please try again.");
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
                    {error || "User not found"}
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate("/")}
                    sx={{ mt: 2 }}
                >
                    Back to Home
                </Button>
            </Container>
        );
    }

    if (accessToken != null && userId === parseJwtPayload(accessToken).sub) {
        return <Navigate to="/profile" />;
    }

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        {user.firstName} {user.lastName}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3 }}>
                        <Box sx={{ flexShrink: 0, textAlign: "center" }}>
                            <ImageSquare imageUrl={user.imageData.link} altText="Фото пользователя" />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Email:</strong> {user.email}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Phone:</strong> {user.phone || "Not provided"}
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
                                        <ListItem sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, flexWrap: "wrap", mb: 2 }}>
                                                <ImageSquare imageUrl={listing.mainImageData.link} altText="Главное изображение объявления" />
                                                {listing.additionalImagesData.map((imageData, idx) => (
                                                    <ImageSquare key={`${listing.id}-additional-${idx}`} imageUrl={imageData.link}  altText={`Дополнительное изображение ${idx}`} />
                                                ))}
                                            </Box>
                                            <Typography
                                                variant="h6"
                                                component={Link}
                                                to={`/rentalListings/${listing.id}`}
                                                sx={{ textDecoration: "none", color: "primary.main", "&:hover": { textDecoration: "underline" } }}
                                            >
                                                {listing.title}
                                            </Typography>
                                            <Box display="flex" flexDirection="column">
                                                <Typography component="span" variant="body2" sx={{ mt: 1 }}>
                                                    {listing.description || "No description provided"}
                                                </Typography>
                                                <Typography component="span" variant="body2">
                                                    Address: {listing.address}
                                                </Typography>
                                                <Typography component="span" variant="body2">
                                                    Tariff: {listing.tariffDescription}
                                                </Typography>
                                            </Box>
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

export default ExtendedUserProfilePage;