import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { PartialRentalListing, PartialUser } from "../shared/types";
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    List,
    ListItem
} from "@mui/material";
import api from "../api/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ImageSquare from "../components/ImageSquare";

const PartialUserProfilePage: React.FC<{ userId: string | undefined }> = ({ userId }) => {
    const [user, setUser] = useState<PartialUser | null>(null);
    const [rentalListings, setRentalListings] = useState<PartialRentalListing[]>([]);
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
            const userResponse = await api.get(`/users/${userId}`);
            const listingsResponse = await api.get(`/users/${userId}/rentalListings`);
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
                    Назад
                </Button>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={2} sx={{ p: 3 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3 }}>
                        <Box sx={{ flexShrink: 0, textAlign: "center" }}>
                            <ImageSquare imageUrl={user.imageData.link} altText="Фото пользователя" />
                        </Box>
                        <Typography variant="h4" gutterBottom>
                            {user.firstName} {user.lastName}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Объявления
                        </Typography>
                        {rentalListings.length === 0 ? (
                            <Typography variant="body1">
                                Объявлений нет
                            </Typography>
                        ) : (
                            <List>
                                {rentalListings.map((listing, index) => (
                                    <Paper key={index} elevation={1} sx={{ mb: 2, p: 2 }}>
                                        <ListItem sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, flexWrap: "wrap", mb: 2 }}>
                                                <ImageSquare imageUrl={listing.mainImageData.link} altText="Главное изображение объявления" />
                                                {listing.additionalImagesData.map((imageData, idx) => (
                                                    <ImageSquare key={`${listing.id}-additional-${idx}`} imageUrl={imageData.link} altText={`Дополнительное изображение ${idx}`} />
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
                                                    Адрес: {listing.address}
                                                </Typography>
                                                <Typography component="span" variant="body2">
                                                    Тариф: {listing.tariffDescription}
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

export default PartialUserProfilePage;
