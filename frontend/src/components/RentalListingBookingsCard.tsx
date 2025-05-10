import { useEffect, useState } from "react";
import authoredApi from "../api/authoredApi";
import {
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    Button,
} from "@mui/material";
import LoadingSpinner from "./LoadingSpinner";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Link } from "react-router";
import BookingEditDialog from "../dialogs/BookingEditDialog";

dayjs.extend(utc);

interface GetBookingResponse {
    id: string;
    startDateTime: string;
    endDateTime: string;
    rentalListingId: string;
    userId: string;
}

interface GetExtendedRentalListingResponse {
    id: string;
    title: string;
    description: string;
    address: string;
    tariffDescription: string;
    autoRenew: boolean;
    mainImageData: ImageData;
    additionalImagesData: ImageData[];
    userId: string;
}

interface GetExtendedUserResponse {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    roleName: string;
    imageData: ImageData;
}

interface ImageData {
    key: string | null;
    link: string;
}

export interface EnrichedBooking {
    id: string;
    startDateTime: string;
    endDateTime: string;
    rentalListingId: string;
    rentalTitle: string;
    userId: string;
    userName: string;
}

interface BookingsCardProps {
    rentalListingId: string;
}

const RentalListingBookingsCard: React.FC<BookingsCardProps> = ({ rentalListingId }) => {
    const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    const initializeBookings = async () => {
        setLoading(true);
        try {
            const bookingsResponse = await authoredApi.get(`/rentalListings/${rentalListingId}/bookings`);
            const bookingData: GetBookingResponse[] = bookingsResponse.data;

            const enrichedBookings: EnrichedBooking[] = await Promise.all(
                bookingData.map(async (booking) => {
                    const rentalResponse = await authoredApi.get(`/rentalListings/${booking.rentalListingId}`);
                    const rental: GetExtendedRentalListingResponse = rentalResponse.data;

                    const userResponse = await authoredApi.get(`/users/${booking.userId}`);
                    const user: GetExtendedUserResponse = userResponse.data;

                    return {
                        id: booking.id,
                        startDateTime: booking.startDateTime,
                        endDateTime: booking.endDateTime,
                        rentalListingId: booking.rentalListingId,
                        rentalTitle: rental.title,
                        userId: booking.userId,
                        userName: `${user.firstName} ${user.lastName}`,
                    };
                })
            );

            setBookings(enrichedBookings);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeBookings();
    }, [rentalListingId]);

    const handleOpenEditDialog = (bookingId: string) => {
        setSelectedBookingId(bookingId);
    };

    const handleCloseEditDialog = () => {
        setSelectedBookingId(null);
    };

    const handleDelete = async (bookingId: string) => {
        try {
            await authoredApi.delete(`/bookings/${bookingId}`);
            setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingId));
        } catch (error) {
            console.error("Error deleting booking:", error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId) || null;

    return (
        <Box sx={{ mt: 1 }}>
            <Typography variant="h5">Аренды</Typography>
            {bookings.length === 0 ? (
                <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                    Аренд не найдено
                </Typography>
            ) : (
                <List>
                    {bookings.map((booking) => (
                        <Paper key={booking.id} elevation={2} sx={{ mb: 2, p: 2 }}>
                            <ListItem sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                <Box display="flex" flexDirection="column">
                                    <Typography component="span" variant="body2" sx={{ mt: 1 }}>
                                        Арендовано: {
                                            <Link to={`/users/${booking.userId}`} style={{ textDecoration: "none" }}>
                                                {booking.userName}
                                            </Link>
                                        }
                                    </Typography>
                                    <Typography component="span" variant="body2">
                                        С: {dayjs.unix(parseInt(booking.startDateTime)).format("DD MMMM, YYYY, HH:mm")}
                                    </Typography>
                                    <Typography component="span" variant="body2">
                                        По: {dayjs.unix(parseInt(booking.endDateTime)).format("DD MMMM, YYYY, HH:mm")}
                                    </Typography>
                                </Box>
                            </ListItem>
                            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={() => handleOpenEditDialog(booking.id)}
                                >
                                    Редактировать
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    onClick={() => handleDelete(booking.id)}
                                >
                                    Удалить
                                </Button>
                            </Box>
                        </Paper>
                    ))}
                </List>
            )}
            {selectedBooking && (
                <BookingEditDialog
                    isOpen={!!selectedBookingId}
                    booking={selectedBooking}
                    bookings={bookings}
                    handleClose={handleCloseEditDialog}
                    onBookingSuccess={initializeBookings}
                />
            )}
        </Box>
    );
};

export default RentalListingBookingsCard;