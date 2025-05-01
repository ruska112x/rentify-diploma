package org.karabalin.rentify.model.dto

data class AddRentalListingRequest(
    val userId: String,
    val title: String,
    val description: String,
    val address: String,
    val tariffDescription: String,
    val autoRenew: Boolean
)

data class OneRentalListing(
    val id: String,
    val title: String,
    val description: String,
    val address: String,
    val tariffDescription: String,
    val autoRenew: Boolean
)

data class UpdateRentalListingRequest(
    val title: String,
    val description: String,
    val address: String,
    val tariffDescription: String,
    val autoRenew: Boolean
)
