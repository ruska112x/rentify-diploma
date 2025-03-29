package org.karabalin.rentify.model.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.*

@Entity
@Table(name = "rentalListing")
class RentalListingEntity (
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(nullable = false)
    val title: String,

    @Column(nullable = false)
    val description: String,

    @Column(nullable = false)
    val address: String,

    @Column(nullable = false)
    val tariffDescription: String,

    @Column(nullable = false)
    val autoRenew: Boolean,

    @Column(nullable = false, updatable = false)
    var createdAtTime: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAtTime: Instant = Instant.now(),

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    val userEntity: UserEntity
) {
    @PreUpdate
    fun onUpdate() {
        updatedAtTime = Instant.now()
    }
}
