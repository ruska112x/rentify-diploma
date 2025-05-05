import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    CircularProgress,
} from '@mui/material';
import { useState, useCallback } from 'react';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import authoredApi from '../api/authoredApi';
import { AxiosError } from 'axios';
import { EnrichedBooking } from '../components/RentalListingBookingsCard';

dayjs.extend(utc);

interface BookingDialogProps {
    isOpen: boolean;
    booking: EnrichedBooking;
    handleClose: () => void;
    onBookingSuccess: () => void;
}

interface FormData {
    startDate: Dayjs | null;
    startTime: Dayjs | null;
    endDate: Dayjs | null;
    endTime: Dayjs | null;
}

interface FormErrors {
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    dateRange: string;
    server: string;
}

const BookingEditDialog: React.FC<BookingDialogProps> = ({
    isOpen,
    booking,
    handleClose,
    onBookingSuccess,
}) => {
    const [formData, setFormData] = useState<FormData>({
        startDate: dayjs.unix(parseInt(booking.startDateTime)),
        startTime: dayjs.unix(parseInt(booking.startDateTime)),
        endDate: dayjs.unix(parseInt(booking.endDateTime)),
        endTime: dayjs.unix(parseInt(booking.endDateTime)),
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        dateRange: '',
        server: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const validateForm = useCallback(() => {
        const errors: FormErrors = {
            startDate: formData.startDate ? '' : 'Start date is required',
            startTime: formData.startTime ? '' : 'Start time is required',
            endDate: formData.endDate ? '' : 'End date is required',
            endTime: formData.endTime ? '' : 'End time is required',
            dateRange: '',
            server: '',
        };

        if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
            const startDateTime = formData.startDate
                .set('hour', formData.startTime.hour())
                .set('minute', formData.startTime.minute())
                .set('second', 0);
            const endDateTime = formData.endDate
                .set('hour', formData.endTime.hour())
                .set('minute', formData.endTime.minute())
                .set('second', 0);

            if (!startDateTime.isBefore(endDateTime)) {
                errors.dateRange = 'Start date and time must be before end date and time';
            }
        }

        setFormErrors(errors);
        return Object.values(errors).every((error) => !error);
    }, [formData]);

    const handleDateChange = (field: keyof FormData) => (value: Dayjs | null) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: value ? '' : `${field} is required` }));
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setFormErrors((prev) => ({ ...prev, server: '' }));

        try {
            const startDateTime = formData.startDate!
                .set('hour', formData.startTime!.hour())
                .set('minute', formData.startTime!.minute())
                .set('second', 0)
                .utc()
                .format();
            const endDateTime = formData.endDate!
                .set('hour', formData.endTime!.hour())
                .set('minute', formData.endTime!.minute())
                .set('second', 0)
                .utc()
                .format();

            const request = {
                startDateTime,
                endDateTime,
            };

            await authoredApi.put(`/bookings/${booking.id}`, request);

            onBookingSuccess();
            handleClose();
            setFormData({
                startDate: null,
                startTime: null,
                endDate: null,
                endTime: null,
            });
        } catch (error) {
            const axiosError = error as AxiosError;
            let errorMessage = 'Failed to create booking';
            if (axiosError.response) {
                if (axiosError.response.status === 401) {
                    errorMessage = 'Unauthorized: Please log in again.';
                } else if (axiosError.response.status === 404) {
                    errorMessage = 'User or rental listing not found.';
                } else if (axiosError.response.status === 400) {
                    errorMessage = 'Invalid booking details. Please check your inputs.';
                }
            }
            setFormErrors((prev) => ({ ...prev, server: errorMessage }));
            console.error('Error creating booking:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Booking</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {formErrors.server && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {formErrors.server}
                            </Alert>
                        )}
                        {formErrors.dateRange && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {formErrors.dateRange}
                            </Alert>
                        )}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <DatePicker
                                label="Start Date"
                                value={formData.startDate}
                                onChange={handleDateChange('startDate')}
                                minDate={dayjs()}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true,
                                        error: !!formErrors.startDate,
                                        helperText: formErrors.startDate,
                                    },
                                }}
                            />
                            <TimePicker
                                label="Start Time"
                                value={formData.startTime}
                                onChange={handleDateChange('startTime')}
                                ampm={false}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true,
                                        error: !!formErrors.startTime,
                                        helperText: formErrors.startTime,
                                    },
                                }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <DatePicker
                                label="End Date"
                                value={formData.endDate}
                                onChange={handleDateChange('endDate')}
                                minDate={formData.startDate || dayjs()}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true,
                                        error: !!formErrors.endDate,
                                        helperText: formErrors.endDate,
                                    },
                                }}
                            />
                            <TimePicker
                                label="End Time"
                                value={formData.endTime}
                                onChange={handleDateChange('endTime')}
                                ampm={false}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true,
                                        error: !!formErrors.endTime,
                                        helperText: formErrors.endTime,
                                    },
                                }} />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} /> : 'Book'}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};

export default BookingEditDialog;