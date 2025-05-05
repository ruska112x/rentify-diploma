package org.karabalin.rentify.model.dto

import java.time.Instant

data class AddBookingRequest(
    val rentalListingId: String,
    val startDateTime: Instant,
    val endDateTime: Instant
)

data class GetBookingResponse(
    val id: String,
    val startDateTime: Instant,
    val endDateTime: Instant,
    val rentalListingId: String,
    val userId: String
)

data class UpdateBookingRequest(
    val startDateTime: Instant,
    val endDateTime: Instant
)
