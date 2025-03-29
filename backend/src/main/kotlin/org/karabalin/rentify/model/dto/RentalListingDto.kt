package org.karabalin.rentify.model.dto

data class AddRentalListingRequest(
    val userEmail: String,
    val title: String,
    val description: String,
    val address: String,
    val tariffDescription: String,
    val autoRenew: Boolean
)

data class OneRentalListing(
    val title: String,
    val description: String,
    val address: String,
    val tariffDescription: String,
    val autoRenew: Boolean
)
