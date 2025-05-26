package org.karabalin.rentify.model.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "rental_listing_tariffs")
class RentalListingTariffEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) val id: Long = 0,
    @Column(nullable = true) var perHour: String,
    @Column(nullable = false) var perDay: String?,
    @Column(nullable = false) var perWeek: String?,
    @Column(nullable = true) var additionalInfo: String?,
)
