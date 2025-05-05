package org.karabalin.rentify.model.entity

import jakarta.persistence.Entity
import jakarta.persistence.Table
import jakarta.persistence.Column
import jakarta.persistence.Id
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import java.util.UUID
import java.time.Instant
import jakarta.persistence.ManyToOne
import jakarta.persistence.JoinColumn

@Entity
@Table(name = "bookings")
class BookingEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false)
    var startDateTime: Instant,

    @Column(nullable = false)
    var endDateTime: Instant,

    @Column(nullable = false, updatable = false)
    var createdAtTime: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAtTime: Instant = Instant.now(),

    @ManyToOne
    @JoinColumn(name = "rentalLisitng_id", nullable = false)
    val rentalListingEntity: RentalListingEntity,

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    val userEntity: UserEntity
)
