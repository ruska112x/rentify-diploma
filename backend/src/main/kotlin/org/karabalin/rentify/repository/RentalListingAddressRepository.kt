package org.karabalin.rentify.repository

import org.karabalin.rentify.model.entity.RentalListingAddressEntity
import org.springframework.data.jpa.repository.JpaRepository

interface RentalListingAddressRepository : JpaRepository<RentalListingAddressEntity, Long>
