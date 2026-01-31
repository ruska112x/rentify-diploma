import { RentalListingAddress, RentalListingTariff } from "./types";

export const formatAddress = (address: RentalListingAddress): string => {
    const parts = [
        address.locality,
        address.street,
        address.houseNumber,
        address.district ? `(${address.district})` : null,
        address.additionalInfo,
    ].filter(Boolean);
    return parts.join(", ");
};

export const formatTariff = (tariff: RentalListingTariff): string => {
    const parts = [
        tariff.perHour ? `За час: ${tariff.perHour}` : null,
        tariff.perDay ? `За день: ${tariff.perDay}` : null,
        tariff.perWeek ? `За неделю: ${tariff.perWeek}` : null,
        tariff.additionalInfo ? `Доп. инфо: ${tariff.additionalInfo}` : null,
    ].filter(Boolean);
    return parts.join("; ");
};
