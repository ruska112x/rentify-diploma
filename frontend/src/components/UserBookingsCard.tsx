import { useEffect, useState } from 'react';
import authoredApi from '../api/authoredApi';
import {
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    Button,
} from '@mui/material';
import LoadingSpinner from './LoadingSpinner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Link } from 'react-router';
import BookingEditDialog from '../dialogs/BookingEditDialog';

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

interface EnrichedBooking {
    id: string;
    startDateTime: string;
    endDateTime: string;
    rentalListingId: string;
    rentalTitle: string;
    userId: string;
    userName: string;
}

interface BookingsCardProps {
    userId: string;
}

const BookingsCard: React.FC<BookingsCardProps> = ({ userId }) => {
    const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
    const [loading, setLoading] = useState(true);

    const initializeBookings = async () => {
        setLoading(true);
        try {
            const bookingsResponse = await authoredApi.get(`/users/${userId}/bookings`);
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
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initializeBookings();
    }, [userId]);

    const [isEditDialogOpen, setEditDialogOpen] = useState(false);

    const handleOpenEditDialog = () => {
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
    };

    const handleDelete = async (bookingId: string) => {
        try {
            await authoredApi.delete(`/bookings/${bookingId}`);
            setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingId));
        } catch (error) {
            console.error('Error deleting booking:', error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <Box sx={{ mt: 1 }}>
            <Typography variant="h5">Bookings</Typography>
            {bookings.length === 0 ? (
                <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
                    No bookings found.
                </Typography>
            ) : (
                <List>
                    {bookings.map((booking) => (
                        <Paper key={booking.id} elevation={2} sx={{ mb: 2, p: 2 }}>
                            <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Link to={`/rentalListings/${booking.rentalListingId}`} style={{ textDecoration: 'none' }}>
                                    <Typography variant="h6">{booking.rentalTitle}</Typography>
                                </Link>
                                <Box display="flex" flexDirection="column">
                                    <Typography component="span" variant="body2">
                                        Start: {dayjs.unix(parseInt(booking.startDateTime)).format('DD MMMM, YYYY, HH:mm')}
                                    </Typography>
                                    <Typography component="span" variant="body2">
                                        End: {dayjs.unix(parseInt(booking.endDateTime)).format('DD MMMM, YYYY, HH:mm')}
                                    </Typography>
                                </Box>
                            </ListItem>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleOpenEditDialog()}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => handleDelete(booking.id)}
                            >
                                Delete
                            </Button>
                            <BookingEditDialog
                                isOpen={isEditDialogOpen}
                                booking={booking}
                                handleClose={handleCloseEditDialog}
                                onBookingSuccess={initializeBookings}
                            />
                        </Paper>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default BookingsCard;