package org.karabalin.rentify.repository

import org.karabalin.rentify.model.entity.RentalListingPhotoEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface RentalListingPhotoRepository : JpaRepository<RentalListingPhotoEntity, Long> {
    fun findAllByRentalListingEntityId(id: UUID): List<RentalListingPhotoEntity>
}
