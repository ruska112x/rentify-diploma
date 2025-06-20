package org.karabalin.rentify.model.domain

import org.karabalin.rentify.model.dto.ImageData

data class RentalListingAddress(
    val district: String?,
    val locality: String,
    val street: String,
    val houseNumber: String,
    val additionalInfo: String?,
)

class RentalListingTariff(
    val perHour: String,
    val perDay: String?,
    val perWeek: String?,
    val additionalInfo: String?,
)

data class RentalListing(
    val id: String,
    val title: String,
    val description: String,
    val address: RentalListingAddress,
    val tariff: RentalListingTariff,
    val autoRenew: Boolean,
    val mainImageData: ImageData,
    val additionalImagesData: List<ImageData>,
    val userId: String,
    val status: String,
)
