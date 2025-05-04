package org.karabalin.rentify.model.domain

import org.karabalin.rentify.model.dto.ImageData

data class RentalListing(
    val id: String,
    val title: String,
    val description: String,
    val address: String,
    val tariffDescription: String,
    val autoRenew: Boolean,
    val mainImageData: ImageData,
    val additionalImagesData: List<ImageData>,
    val userId: String
)
