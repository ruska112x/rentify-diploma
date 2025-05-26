package org.karabalin.rentify.model.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "rental_listing_addresses")
class RentalListingAddressEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) val id: Long = 0,
    @Column(nullable = true) val district: String?,
    @Column(nullable = false) val locality: String,
    @Column(nullable = false) val street: String,
    @Column(nullable = false) val houseNumber: String,
    @Column(nullable = true) val additionalInfo: String?,
)
