import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { parseUnixTimestamp } from "./timeUtils";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export interface BookingTimeSlot {
    startDateTime: string;
    endDateTime: string;
}

export const shouldDisableDate = (
    date: Dayjs,
    existingBookings: BookingTimeSlot[],
): boolean => {
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
        return booking.start.isSameOrBefore(dateStart) && booking.end.isSameOrAfter(dateEnd);
    });

    return isFullyBooked;
};

export const shouldDisableTime = (
    time: Dayjs,
    selectedDate: Dayjs | null,
    existingBookings: BookingTimeSlot[],
    checkPastTime: boolean = true,
): boolean => {
    if (!selectedDate) return false;

    const minutes = time.minute();
    const selectedDateTime = selectedDate
        .set("hour", time.hour())
        .set("minute", minutes)
        .set("second", 0);

    if (checkPastTime && selectedDateTime.isBefore(dayjs())) {
        return true;
    }

    const isDisabled = existingBookings.some((booking) => {
        const bookingStart = parseUnixTimestamp(booking.startDateTime);
        const bookingEnd = parseUnixTimestamp(booking.endDateTime);

        if (!selectedDate.isSame(bookingStart, "day") && !selectedDate.isSame(bookingEnd, "day")) {
            return false;
        }

        return selectedDateTime.isSameOrAfter(bookingStart) && selectedDateTime.isSameOrBefore(bookingEnd);
    });

    return isDisabled;
};
