import { useEffect, useState } from "react";
import { PartialRentalListing, PartialUser } from "../shared/types";
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
} from "@mui/material";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import api from "../api/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ImageSquare from "../components/ImageSquare";

const PartialRentalListingPage: React.FC<{ rentalListingId: string | undefined }> = ({ rentalListingId }) => {
    const [listing, setListing] = useState<PartialRentalListing | null>(null);
    const [user, setUser] = useState<PartialUser>({
        firstName: "",
        lastName: "",
        imageData: {
            key: "",
            link: ""
        }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchRentalListing = async () => {
        if (!rentalListingId) {
            setError("Invalid rental listing ID");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/rentalListings/${rentalListingId}`);
            setListing(response.data);
            const userResponse = await api.get(`/users/${response.data.userId}`);
            setUser(userResponse.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching rental listing:", err);
            setError("Failed to load rental listing. Please try again.");
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
                    {error || "Rental listing not found"}
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
            <Paper elevation={2} sx={{ p: 3, display: "flex", flexDirection: "row", gap: 2 }}>
                <Box sx={{ flex: "2 1 600px", display: "flexDirection", flexDirection: "column", gap: "20px", }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {listing.title}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "row", gap: "10px", flexWrap: "wrap", mb: 2 }}>
                        <ImageSquare
                            imageUrl={listing.mainImageData?.link || ""}
                            showFullScreen={true}
                            size={400} // Increased size for better detail
                            altText={listing.title ? `Главное изображение для ${listing.title}` : "Главное изображение объявления"}
                            fallbackText="Изображение отсутствует"
                        />
                        {listing.additionalImagesData?.map((imageData, index) => (
                            <ImageSquare
                                key={`${listing.id}-additional-${index}`}
                                imageUrl={imageData?.link || ""}
                                showFullScreen={true}
                                size={180} // Smaller thumbnails
                                altText={`Дополнительное изображение ${index + 1}`}
                                fallbackText="Изображение отсутствует"
                            />
                        ))}
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <Typography variant="body1">
                            <strong>Описание:</strong> {listing.description || "Нет описания"}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Адрес:</strong> {listing.address}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Тариф:</strong> {listing.tariff || "Не указан"}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{
                    flex: "1 0 240px",
                    backgroundColor: "grey.50",
                    padding: "16px",
                    borderRadius: "12px",
                    width: { xs: "100%", sm: "300px" },
                    minWidth: "240px",
                }}>
                    <Typography variant="h5" gutterBottom>
                        <Link key={listing.userId} to={`/users/${listing.userId}`} style={{ textDecoration: "none" }}>
                            Владелец {user.firstName + " " + user.lastName}
                        </Link>
                    </Typography>
                    <Box sx={{ mt: 2, textAlign: "center" }}>
                        <ImageSquare imageUrl={user.imageData.link} altText="Фото пользователя" />
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default PartialRentalListingPage;
