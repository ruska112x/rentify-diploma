package org.karabalin.rentify.repository

import org.karabalin.rentify.model.entity.RentalListingTariffEntity
import org.springframework.data.jpa.repository.JpaRepository

interface RentalListingTariffRepository : JpaRepository<RentalListingTariffEntity, Long>
