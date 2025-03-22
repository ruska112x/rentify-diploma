package org.karabalin.rentify.model.entity

import jakarta.persistence.*
import java.time.Instant
import java.util.*

@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    val id: UUID? = null,

    @Column(unique = true, nullable = false)
    val email: String,

    @Column(nullable = false)
    val password: String,

    @Column(nullable = false)
    var firstName: String,

    @Column(nullable = false)
    var lastName: String,

    @Column(nullable = false)
    var phone: String,

    @Column(nullable = false)
    var lastLoginTime: Instant,

    @Column(nullable = false, updatable = false)
    var createdAtTime: Instant = Instant.now(),

    @Column(nullable = false)
    var updatedAtTime: Instant = Instant.now(),

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    val role: Role
) {
    @PreUpdate
    fun onUpdate() {
        updatedAtTime = Instant.now()
    }
}
