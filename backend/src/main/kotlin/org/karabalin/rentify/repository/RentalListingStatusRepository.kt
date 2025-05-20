package org.karabalin.rentify.repository

import org.karabalin.rentify.model.entity.RentalListingStatusEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface RentalListingStatusRepository :
    JpaRepository<RentalListingStatusEntity, Long> {
    fun findByName(name: String): Optional<RentalListingStatusEntity>
}
