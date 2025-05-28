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
    ListItem,
    Tabs,
    Tab
} from "@mui/material";
import api from "../api/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ImageSquare from "../components/ImageSquare";

const PartialUserProfilePage: React.FC<{ userId: string | undefined }> = ({ userId }) => {
    const [user, setUser] = useState<PartialUser | null>(null);
    const [activeRentalListings, setActiveRentalListings] = useState<Array<PartialRentalListing>>([]);
    const [archivedRentalListings, setArchivedRentalListings] = useState<Array<PartialRentalListing>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const fetchUserData = async () => {
        if (!userId) {
            setError("Invalid user ID");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const userResponse = await api.get(`/users/${userId}`);
            setUser(userResponse.data);
            const response = await api.get(`/users/${userId}/activeRentalListings`);
            const listings: PartialRentalListing[] = response.data;
            setActiveRentalListings(listings);

            const archivedResponse = await api.get(`/users/${userId}/archivedRentalListings`);
            const archivedListings: PartialRentalListing[] = archivedResponse.data;
            setArchivedRentalListings(archivedListings);
            setError(null);
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError("Не удалось удалить аккаунт. Пожалуйста, попробуйте позже.");
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
                        <Tabs value={tabValue} onChange={handleTabChange} centered>
                            <Tab label="Активные" />
                            <Tab label="Архивированные" />
                        </Tabs>

                        {tabValue === 0 &&
                            (
                                activeRentalListings.length === 0 ? (
                                    <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                                        Объявлений не найдено
                                    </Typography>
                                ) : (
                                    <List>
                                        {activeRentalListings.map((listing, index) => (
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
                                                            <strong>Населённый пункт:</strong> {listing.address}
                                                        </Typography>
                                                        <Typography component="span" variant="body2">
                                                            <strong>Цена за час аренды:</strong> {listing.tariff}
                                                        </Typography>
                                                    </Box>
                                                </ListItem>
                                            </Paper>
                                        ))}
                                    </List>
                                )
                            )
                        }

                        {tabValue === 1 && (
                            archivedRentalListings.length === 0 ? (
                                <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                                    Объявлений не найдено
                                </Typography>
                            ) : (
                                <List>
                                    {archivedRentalListings.map((listing, index) => (
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
                                                        <strong>Населённый пункт:</strong> {listing.address}
                                                    </Typography>
                                                    <Typography component="span" variant="body2">
                                                        <strong>Цена за час аренды:</strong> {listing.tariff}
                                                    </Typography>
                                                </Box>
                                            </ListItem>
                                        </Paper>
                                    ))}
                                </List>
                            )
                        )}
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default PartialUserProfilePage;
