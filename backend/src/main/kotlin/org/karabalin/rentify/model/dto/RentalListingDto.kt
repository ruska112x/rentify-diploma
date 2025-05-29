package org.karabalin.rentify.model.dto

import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.hibernate.validator.constraints.Length

data class RentalListingAddressDto(
    @field:Length(
        min = 1,
        max = 255,
        message = "District must be from 1 to 50 characters long",
    )
    val district: String?,
    @field:NotBlank
    @field:Length(
        min = 1,
        max = 50,
        message = "Locality must be from 1 to 50 characters long",
    )
    val locality: String,
    @field:NotBlank
    @field:Length(
        min = 1,
        max = 50,
        message = "Street must be from 1 to 50 characters long",
    )
    val street: String,
    @field:NotBlank
    @field:Length(
        min = 1,
        max = 50,
        message = "House number must be from 1 to 50 characters long",
    )
    val houseNumber: String,
    @field:Length(
        min = 1,
        max = 255,
        message = "Additional info must be at least 1 characters long",
    )
    val additionalInfo: String?,
)

class RentalListingTariffDto(
    @field:NotBlank
    @field:Length(
        min = 1,
        max = 50,
        message = "Per hour renting cost must be from 1 to 50 characters long",
    )
    val perHour: String,
    @field:Length(
        min = 1,
        max = 50,
        message = "Per day renting cost must be from 1 to 50 characters long",
    )
    val perDay: String?,
    @field:Length(
        min = 1,
        max = 50,
        message = "Per week renting cost must be from 1 to 50 characters long",
    )
    val perWeek: String?,
    @field:Length(
        min = 1,
        max = 255,
        message = "Additional info must be at least 1 characters long",
    )
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
    @field:Valid
    val address: RentalListingAddressDto,
    @field:Valid
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
    val status: String,
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
    @field:Valid
    val address: RentalListingAddressDto,
    @field:Valid
    val tariff: RentalListingTariffDto,
    val autoRenew: Boolean,
)
