package org.karabalin.rentify.repository

import org.karabalin.rentify.model.entity.RentalListingEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.util.UUID

interface RentalListingRepository : JpaRepository<RentalListingEntity, UUID> {
    fun findByUserEntityEmail(
        userEntityEmail: String,
    ): List<RentalListingEntity>

    fun findAllByUserEntityId(userEntityId: UUID): List<RentalListingEntity>

    @Query(
        nativeQuery = true,
        value = """SELECT * FROM rental_listings rl
            | ORDER BY rl.created_at_time
            | LIMIT 10
        """,
    )
    fun findAllByOrderByCreatedAtTimeDesc(): List<RentalListingEntity>
}
