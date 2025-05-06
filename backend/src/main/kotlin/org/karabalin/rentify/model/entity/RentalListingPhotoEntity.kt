package org.karabalin.rentify.model.entity

import jakarta.persistence.*

@Entity
@Table(name = "rentalListingPhotos")
data class RentalListingPhotoEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(nullable = false)
    var fileKey: String,
    @ManyToOne
    @JoinColumn(name = "rentalListing_id", nullable = false)
    val rentalListingEntity: RentalListingEntity,
)
