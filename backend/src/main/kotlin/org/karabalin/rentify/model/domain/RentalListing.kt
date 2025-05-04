package org.karabalin.rentify.model.domain

data class RentalListing(
    val id: String,
    val title: String,
    val description: String,
    val address: String,
    val tariffDescription: String,
    val autoRenew: Boolean,
    val mainPhotoLink: String,
    val additionalPhotoLinks: List<String>,
    val userId: String
)
