package org.karabalin.rentify.repository

import org.karabalin.rentify.model.entity.BookingEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface BookingRepository : JpaRepository<BookingEntity, UUID> {
    fun getBookingsByRentalListingEntityId(rentalListingId: UUID): List<BookingEntity>
    fun getBookingsByUserEntityId(userId: UUID): List<BookingEntity>
}
