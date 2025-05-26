package org.karabalin.rentify.model.dto

import jakarta.validation.constraints.NotBlank
import org.hibernate.validator.constraints.Length

data class RentalListingAddressDto(
    val district: String?,
    val locality: String,
    val street: String,
    val houseNumber: String,
    val additionalInfo: String?,
)

class RentalListingTariffDto(
    val perHour: String,
    val perDay: String?,
    val perWeek: String?,
    val additionalInfo: String?,
)

data class AddRentalListingRequest(
    val userId: String,
    @field:NotBlank
    @field:Length(
        min = 1,
        max = 255,
        message = "Title must be at least 1 characters long",
    )
    val title: String,
    val description: String,
    val address: RentalListingAddressDto,
    val tariff: RentalListingTariffDto,
    val autoRenew: Boolean,
)

data class GetExtendedRentalListingResponse(
    val id: String,
    val title: String,
    val description: String,
    val address: RentalListingAddressDto,
    val tariff: RentalListingTariffDto,
    val autoRenew: Boolean,
    val mainImageData: ImageData,
    val additionalImagesData: List<ImageData>,
    val userId: String,
)

data class GetPartialRentalListingResponse(
    val id: String,
    val title: String,
    val description: String,
    val address: String,
    val tariff: String,
    val mainImageData: ImageData,
    val additionalImagesData: List<ImageData>,
    val userId: String,
)

data class UpdateRentalListingRequest(
    @field:NotBlank
    @field:Length(
        min = 1,
        max = 255,
        message = "Title must be at least 1 characters long",
    )
    val title: String,
    val description: String,
    val address: RentalListingAddressDto,
    val tariff: RentalListingTariffDto,
    val autoRenew: Boolean,
)
