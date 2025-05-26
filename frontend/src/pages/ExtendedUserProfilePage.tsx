import { useEffect, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router";
import { ExtendedRentalListing, ExtendedUser, RentalListingAddress, RentalListingTariff } from "../shared/types";
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
import LoadingSpinner from "../components/LoadingSpinner";
import ImageSquare from "../components/ImageSquare";
import authoredApi from "../api/authoredApi";
import { RootState } from "../state/store";
import { useSelector } from "react-redux";
import { parseJwtPayload } from "../shared/jwtDecode";

const ExtendedUserProfilePage: React.FC<{ userId: string | undefined }> = ({ userId }) => {
    const { accessToken } = useSelector((state: RootState) => state.auth);
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [activeRentalListings, setActiveRentalListings] = useState<Array<ExtendedRentalListing>>([]);
    const [archivedRentalListings, setArchivedRentalListings] = useState<Array<ExtendedRentalListing>>([]);
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
            const userResponse = await authoredApi.get(`/users/${userId}`);
            setUser(userResponse.data);
            const response = await authoredApi.get(`/users/${userId}/activeRentalListings`);
            const listings: ExtendedRentalListing[] = response.data;
            setActiveRentalListings(listings);

            const archivedResponse = await authoredApi.get(`/users/${userId}/archivedRentalListings`);
            const archivedListings: ExtendedRentalListing[] = archivedResponse.data;
            setArchivedRentalListings(archivedListings);
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

    const formatAddress = (address: RentalListingAddress) => {
        const parts = [
            address.locality,
            address.street,
            address.houseNumber,
            address.district ? `(${address.district})` : null,
            address.additionalInfo,
        ].filter(Boolean);
        return parts.join(", ");
    };

    const formatTariff = (tariff: RentalListingTariff) => {
        const parts = [
            tariff.perHour ? `За час: ${tariff.perHour}` : null,
            tariff.perDay ? `За день: ${tariff.perDay}` : null,
            tariff.perWeek ? `За неделю: ${tariff.perWeek}` : null,
            tariff.additionalInfo ? `Доп. инфо: ${tariff.additionalInfo}` : null,
        ].filter(Boolean);
        return parts.join("; ");
    };

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
                                                            Address: {formatAddress(listing.address)}
                                                        </Typography>
                                                        <Typography component="span" variant="body2">
                                                            Tariff: {formatTariff(listing.tariff)}
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
                                                        Address: {formatAddress(listing.address)}
                                                    </Typography>
                                                    <Typography component="span" variant="body2">
                                                        Tariff: {formatTariff(listing.tariff)}
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

export default ExtendedUserProfilePage;