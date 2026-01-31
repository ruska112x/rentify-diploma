import dayjs, { Dayjs } from "dayjs";

export const parseUnixTimestamp = (timestamp: string): Dayjs => {
    const num = parseInt(timestamp);
    if (isNaN(num)) {
        console.error(`Invalid timestamp: ${timestamp}`);
        return dayjs(0);
    }
    const seconds = num >= 1e12 ? num / 1000 : num;
    return dayjs.unix(seconds);
};
