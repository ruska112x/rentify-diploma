package org.karabalin.rentify.repository

import org.karabalin.rentify.model.entity.BookingEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface BookingRepository : JpaRepository<BookingEntity, UUID> {
    fun findByRentalListingEntityIdOrderByStartDateTimeAsc(
        rentalListingId: UUID,
    ): List<BookingEntity>

    fun findByUserEntityIdOrderByStartDateTimeAsc(
        userId: UUID,
    ): List<BookingEntity>
}
