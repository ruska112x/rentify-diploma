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
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
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

interface Booking {
    id: string;
    startDateTime: string;
    endDateTime: string;
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


    const parseUnixTimestamp = (timestamp: string): Dayjs => {
        const num = parseInt(timestamp);
        if (isNaN(num)) {
            console.error(`Invalid timestamp: ${timestamp}`);
            return dayjs(0);
        }
        const seconds = num >= 1e12 ? num / 1000 : num;
        return dayjs.unix(seconds);
    };


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


    const shouldDisableDate = (date: Dayjs) => {
        const dateStart = date.startOf("day");
        const dateEnd = date.endOf("day");


        const bookingsOnDate = existingBookings.filter((booking) => {
            const bookingStart = parseUnixTimestamp(booking.startDateTime);
            const bookingEnd = parseUnixTimestamp(booking.endDateTime);
            return dateStart.isBefore(bookingEnd) && dateEnd.isAfter(bookingStart);
        });

        if (bookingsOnDate.length === 0) {

            return false;
        }


        const sortedBookings = bookingsOnDate
            .map((booking) => ({
                start: parseUnixTimestamp(booking.startDateTime),
                end: parseUnixTimestamp(booking.endDateTime),
            }))
            .sort((a, b) => a.start.valueOf() - b.start.valueOf());


        const mergedBookings: { start: Dayjs; end: Dayjs }[] = [];
        let current = sortedBookings[0];
        for (let i = 1; i < sortedBookings.length; i++) {
            if (sortedBookings[i].start.isBefore(current.end) || sortedBookings[i].start.isSame(current.end)) {
                current.end = current.end.isBefore(sortedBookings[i].end) ? sortedBookings[i].end : current.end;
            } else {
                mergedBookings.push(current);
                current = sortedBookings[i];
            }
        }
        mergedBookings.push(current);


        const isFullyBooked = mergedBookings.some((booking) => {
            const coversDay = booking.start.isSameOrBefore(dateStart) && booking.end.isSameOrAfter(dateEnd);

            return coversDay;
        });

        if (!isFullyBooked) {

        }

        return isFullyBooked;
    };


    const shouldDisableTime = (time: Dayjs, selectedDate: Dayjs | null) => {
        if (!selectedDate) return false;

        const minutes = time.minute();

        const selectedDateTime = selectedDate
            .set("hour", time.hour())
            .set("minute", minutes)
            .set("second", 0);

        if (selectedDateTime.isBefore(dayjs())) {
            return true;
        }

        const isDisabled = existingBookings.some((booking) => {
            const bookingStart = parseUnixTimestamp(booking.startDateTime);
            const bookingEnd = parseUnixTimestamp(booking.endDateTime);


            if (!selectedDate.isSame(bookingStart, "day") && !selectedDate.isSame(bookingEnd, "day")) {
                return false;
            }


            const isDisabled = selectedDateTime.isSameOrAfter(bookingStart) && selectedDateTime.isSameOrBefore(bookingEnd);

            return isDisabled;
        });

        return isDisabled;
    };

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
            const axiosError = error as AxiosError;
            let errorMessage = "Не удается создать аренду. Пожалуйста, попробуйте еще раз.";
            if (axiosError.response) {
                if (axiosError.response.status === 401) {
                    errorMessage = "Unauthorized: Please log in again.";
                } else if (axiosError.response.status === 404) {
                    errorMessage = "User or rental listing not found.";
                } else if (axiosError.response.status === 400) {
                    errorMessage = "Invalid booking details. Please check your inputs.";
                }
            }
            console.error("Error creating booking:", axiosError.message, axiosError.response?.data);
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
                                shouldDisableDate={shouldDisableDate}
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
                                shouldDisableTime={(time) => shouldDisableTime(time, formData.startDate)}
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
                                shouldDisableDate={shouldDisableDate}
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
                                shouldDisableTime={(time) => shouldDisableTime(time, formData.endDate)}
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
                        {isLoading ? <CircularProgress size={24} /> : "Book"}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};

export default BookingAddDialog;