package org.karabalin.rentify.repository

import org.karabalin.rentify.model.entity.RentalListingEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface RentalListingRepository : JpaRepository<RentalListingEntity, UUID> {
    fun findByUserEntityEmail(userEntityEmail: String): List<RentalListingEntity>

    fun findAllByUserEntityId(userEntityId: UUID): List<RentalListingEntity>

    fun findAllByOrderByCreatedAtTimeDesc(): List<RentalListingEntity>
}
