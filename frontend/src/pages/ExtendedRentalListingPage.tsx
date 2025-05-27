import { useEffect, useState } from "react";
import { ExtendedRentalListing, ExtendedUser, RentalListingAddress, RentalListingTariff } from "../shared/types";
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router";
import LoadingSpinner from "../components/LoadingSpinner";
import ImageSquare from "../components/ImageSquare";
import authoredApi from "../api/authoredApi";
import BookingAddDialog from "../dialogs/BookingAddDialog";
import { parseJwtPayload } from "../shared/jwtDecode";
import { useSelector } from "react-redux";
import { RootState } from "../state/store";

interface ExtendedRentalListingPageProps {
    rentalListingId: string | undefined;
}

const ExtendedRentalListingPage: React.FC<ExtendedRentalListingPageProps> = ({ rentalListingId }) => {
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
            link: "",
        },
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

    const handleBookingSuccess = () => {
    };

    const isNotMyRentalListing = () => {
        if (!accessToken || !listing) return false;
        const userId = parseJwtPayload(accessToken)?.sub;
        return userId && listing.userId !== userId;
    };

    const fetchRentalListing = async () => {
        if (!rentalListingId) {
            setError("Неверный идентификатор объявления");
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
            console.error("Ошибка при загрузки объявления:", err);
            setError("Не удалось загрузить объявление. Попробуйте снова.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRentalListing();
    }, [rentalListingId]);
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
        return <LoadingSpinner />;
    }

    if (error || !listing) {
        return (
            <Container sx={{ mt: 5 }}>
                <Typography variant="h6" color="error">
                    {error || "Объявление не найдено"}
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate("/rentals")} // Assuming /rentals is the listings route
                    sx={{ mt: 2 }}
                >
                    Вернуться к списку
                </Button>
            </Container>
        );
    }

    return (
        <Container sx={{ mt: 5, mb: 5 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "row", gap: "20px", flexWrap: "wrap" }}>
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
                                <strong>Адрес:</strong> {formatAddress(listing.address)}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Тариф:</strong> {formatTariff(listing.tariff) || "Не указан"}
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            flex: "1 0 240px",
                            backgroundColor: "grey.50",
                            padding: "16px",
                            borderRadius: "12px",
                            width: { xs: "100%", sm: "300px" },
                            minWidth: "240px",
                        }}
                    >
                        <Typography variant="h6" component="h2" gutterBottom>
                            <RouterLink
                                to={"/users/" + listing.userId}
                                style={{ textDecoration: "none" }}
                            >
                                Владелец: {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}`.trim() : "Не указан"}
                            </RouterLink>
                        </Typography>
                        <Box sx={{ mt: 2, textAlign: "center" }}>
                            <ImageSquare
                                imageUrl={user.imageData?.link || ""}
                                size={120}
                                altText={user.firstName || user.lastName ? `Фото ${user.firstName || user.lastName}` : "Фото пользователя"}
                                fallbackText="Нет фото"
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            <strong>Email:</strong> {user.email || "Не указан"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            <strong>Телефон:</strong> {user.phone || "Не указан"}
                        </Typography>
                    </Box>
                </Box>
                {isNotMyRentalListing() && listing.status !== "ARCHIVED" && (
                    <Box sx={{ mt: "10px", p: "2" }}>
                        < Button variant="contained"
                            color="primary"
                            onClick={() => handleOpenBookingDialog()}
                            sx={{ padding: "8px 16px" }}
                        >
                            Забронировать
                        </Button>
                    </Box>
                )
                }
            </Paper >
            <BookingAddDialog
                isOpen={isBookingDialogOpen}
                rentalListingId={rentalListingId!}
                handleClose={() => handleCloseBookingDialog()}
                onBookingSuccess={handleBookingSuccess}
            />
        </Container >
    );
};

export default ExtendedRentalListingPage;