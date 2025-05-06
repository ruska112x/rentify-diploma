package org.karabalin.rentify.model.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.*

@Entity
@Table(name = "rentalListings")
class RentalListingEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,
    @Column(nullable = false)
    var title: String,
    @Column(nullable = false)
    var description: String,
    @Column(nullable = false)
    var address: String,
    @Column(nullable = false)
    var tariffDescription: String,
    @Column(nullable = false)
    var autoRenew: Boolean,
    @Column(nullable = false)
    var mainPhotoKey: String,
    @Column(nullable = false, updatable = false)
    var createdAtTime: Instant = Instant.now(),
    @Column(nullable = false)
    var updatedAtTime: Instant = Instant.now(),
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    val userEntity: UserEntity,
) {
    @PreUpdate
    fun onUpdate() {
        updatedAtTime = Instant.now()
    }
}
