package org.karabalin.rentify.repository

import org.karabalin.rentify.model.entity.RentalListingEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface RentalListingRepository : JpaRepository<RentalListingEntity, UUID> {
    fun findByUserEntityEmail(
        userEntityEmail: String,
    ): List<RentalListingEntity>

    fun findAllByUserEntityId(userEntityId: UUID): List<RentalListingEntity>

    @Query(
        nativeQuery = true,
        value = """
            SELECT rl.* FROM rental_listings rl
            LEFT JOIN rental_listing_statuses rls ON rl.status_id = rls.id
            WHERE rl.user_id = :userEntityId AND rls.name = 'ACTIVE'
            ORDER BY rl.created_at_time
        """,
    )
    fun findAllActiveByUserEntityId(
        @Param("userEntityId") userEntityId: UUID,
    ): List<RentalListingEntity>

    @Query(
        nativeQuery = true,
        value = """
            SELECT rl.* FROM rental_listings rl
            LEFT JOIN rental_listing_statuses rls ON rl.status_id = rls.id
            WHERE rl.user_id = :userEntityId AND rls.name = 'ARCHIVED'
            ORDER BY rl.created_at_time
        """,
    )
    fun findAllArchivedByUserEntityId(
        @Param("userEntityId") userEntityId: UUID,
    ): List<RentalListingEntity>

    @Query(
        nativeQuery = true,
        value = """
            SELECT rl.* FROM rental_listings rl
            LEFT JOIN rental_listing_statuses rls ON rl.status_id = rls.id
            WHERE rls.name = 'ACTIVE'
            ORDER BY rl.created_at_time
            LIMIT 10
        """,
    )
    fun findAllByOrderByCreatedAtTimeDesc(): List<RentalListingEntity>
}
