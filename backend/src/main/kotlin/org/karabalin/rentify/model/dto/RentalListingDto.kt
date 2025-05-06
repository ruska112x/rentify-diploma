package org.karabalin.rentify.model.dto

data class AddRentalListingRequest(
    val userId: String,
    val title: String,
    val description: String,
    val address: String,
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
    val title: String,
    val description: String,
    val address: String,
    val tariffDescription: String,
    val autoRenew: Boolean,
)
