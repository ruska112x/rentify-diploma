package org.karabalin.rentify.model.dto

import jakarta.validation.constraints.NotBlank
import org.hibernate.validator.constraints.Length

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
    @field:NotBlank
    @field:Length(
        min = 1,
        max = 255,
        message = "Address must be at least 1 characters long",
    )
    val address: String,
    @field:NotBlank
    @field:Length(
        min = 1,
        max = 255,
        message = "Tariff must be at least 1 characters long",
    )
    val tariffDescription: String,
    val autoRenew: Boolean,
)

data class GetExtendedRentalListingResponse(
    val id: String,
    val title: String,
    val description: String,
    val address: String,
    val tariffDescription: String,
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
    val tariffDescription: String,
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
    @field:NotBlank
    @field:Length(
        min = 1,
        max = 255,
        message = "Address must be at least 1 characters long",
    )
    val address: String,
    @field:NotBlank
    @field:Length(
        min = 1,
        max = 255,
        message = "Tariff must be at least 1 characters long",
    )
    val tariffDescription: String,
    val autoRenew: Boolean,
)
