package org.karabalin.rentify.model.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "rental_listing_photos")
data class RentalListingPhotoEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(nullable = false)
    var fileKey: String,
    @ManyToOne
    @JoinColumn(name = "rental_listing_id", nullable = false)
    val rentalListingEntity: RentalListingEntity,
)
