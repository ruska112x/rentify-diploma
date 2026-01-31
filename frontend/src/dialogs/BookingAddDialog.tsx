import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    CircularProgress,
} from "@mui/material";
import { useState, useCallback, useEffect } from "react";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import authoredApi from "../api/authoredApi";
import { AxiosError } from "axios";
import { parseUnixTimestamp } from "../shared/timeUtils";
import { shouldDisableDate, shouldDisableTime, BookingTimeSlot } from "../shared/bookingValidation";
import { getErrorMessage } from "../shared/axiosErrorHandler";

dayjs.extend(utc);

interface BookingDialogProps {
    isOpen: boolean;
    rentalListingId: string;
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
    slotUnavailable: string;
    server: string;
}

interface Booking extends BookingTimeSlot {
    id: string;
    rentalListingId: string;
    userId: string;
}

const BookingAddDialog: React.FC<BookingDialogProps> = ({
    isOpen,
    rentalListingId,
    handleClose,
    onBookingSuccess,
}) => {
    const [formData, setFormData] = useState<FormData>({
        startDate: null,
        startTime: null,
        endDate: null,
        endTime: null,
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        dateRange: "",
        slotUnavailable: "",
        server: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [existingBookings, setExistingBookings] = useState<Booking[]>([]);

    useEffect(() => {
        if (!isOpen) {
            setExistingBookings([]);
            return;
        }

        const fetchBookings = async () => {
            try {

                const response = await authoredApi.get(`/rentalListings/${rentalListingId}/bookings`);
                const bookings: Booking[] = response.data;

                setExistingBookings(bookings);
            } catch (error) {
                const axiosError = error as AxiosError;
                console.error("Error fetching bookings:", axiosError.message, axiosError.response?.data);
                setFormErrors((prev) => ({
                    ...prev,
                    server: "Failed to load existing bookings. Please try again.",
                }));
            }
        };

        fetchBookings();
    }, [isOpen, rentalListingId]);

    const handleDisableDate = useCallback((date: Dayjs) => {
        return shouldDisableDate(date, existingBookings);
    }, [existingBookings]);

    const handleDisableTime = useCallback((time: Dayjs, selectedDate: Dayjs | null) => {
        return shouldDisableTime(time, selectedDate, existingBookings, true);
    }, [existingBookings]);

    const validateForm = useCallback(() => {
        const errors: FormErrors = {
            startDate: formData.startDate ? "" : "Дата начала аренды обязательна",
            startTime: formData.startTime ? "" : "Время начала аренды обязательно",
            endDate: formData.endDate ? "" : "Дата окончания аренды обязательна",
            endTime: formData.endTime ? "" : "Время окончания аренды обязательно",
            dateRange: "",
            slotUnavailable: "",
            server: "",
        };

        if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
            const startDateTime = formData.startDate
                .set("hour", formData.startTime.hour())
                .set("minute", formData.startTime.minute())
                .set("second", 0);
            const endDateTime = formData.endDate
                .set("hour", formData.endTime.hour())
                .set("minute", formData.endTime.minute())
                .set("second", 0);


            if (!startDateTime.isBefore(endDateTime)) {
                errors.dateRange = "Время окончания аренды должно быть позже времени начала";
            }


            const hasOverlap = existingBookings.some((booking) => {
                const bookingStart = parseUnixTimestamp(booking.startDateTime);
                const bookingEnd = parseUnixTimestamp(booking.endDateTime);
                const overlap = startDateTime.isBefore(bookingEnd) && endDateTime.isAfter(bookingStart);

                return overlap;
            });

            if (hasOverlap) {
                errors.slotUnavailable = "Это время уже занято";
            }
        }

        setFormErrors(errors);
        return Object.values(errors).every((error) => !error);
    }, [formData, existingBookings]);

    const handleDateChange = (field: keyof FormData) => (value: Dayjs | null) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: value ? "" : `${field} требуется` }));
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        setFormErrors((prev) => ({ ...prev, server: "" }));

        try {
            const startDateTime = formData.startDate!
                .set("hour", formData.startTime!.hour())
                .set("minute", formData.startTime!.minute())
                .set("second", 0)
                .utc()
                .format();
            const endDateTime = formData.endDate!
                .set("hour", formData.endTime!.hour())
                .set("minute", formData.endTime!.minute())
                .set("second", 0)
                .utc()
                .format();

            const request = {
                rentalListingId,
                startDateTime,
                endDateTime,
            };


            await authoredApi.post("/bookings", request);

            onBookingSuccess();
            handleClose();
            setFormData({
                startDate: null,
                startTime: null,
                endDate: null,
                endTime: null,
            });
        } catch (error) {
            console.error("Error creating booking:", error);
            const errorMessage = getErrorMessage(error, "Бронирование");
            setFormErrors((prev) => ({ ...prev, server: errorMessage }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Создание аренды</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
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
                        {formErrors.slotUnavailable && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {formErrors.slotUnavailable}
                            </Alert>
                        )}
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <DatePicker
                                label="Дата начала"
                                value={formData.startDate}
                                onChange={handleDateChange("startDate")}
                                minDate={dayjs()}
                                shouldDisableDate={handleDisableDate}
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
                                label="Время начала"
                                value={formData.startTime}
                                onChange={handleDateChange("startTime")}
                                ampm={false}
                                minutesStep={10}
                                timeSteps={{ minutes: 10 }}
                                shouldDisableTime={(time) => handleDisableTime(time, formData.startDate)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true,
                                        error: !!formErrors.startTime,
                                        helperText: formErrors.startTime,
                                    },
                                }}
                            />
                        </Box>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <DatePicker
                                label="Дата окончания"
                                value={formData.endDate}
                                onChange={handleDateChange("endDate")}
                                minDate={formData.startDate || dayjs()}
                                shouldDisableDate={handleDisableDate}
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
                                label="Время окончания"
                                value={formData.endTime}
                                onChange={handleDateChange("endTime")}
                                ampm={false}
                                minutesStep={10}
                                timeSteps={{ minutes: 10 }}
                                shouldDisableTime={(time) => handleDisableTime(time, formData.endDate)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true,
                                        error: !!formErrors.endTime,
                                        helperText: formErrors.endTime,
                                    },
                                }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={isLoading}>
                        Отменить
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} /> : "Забронировать"}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};

export default BookingAddDialog;