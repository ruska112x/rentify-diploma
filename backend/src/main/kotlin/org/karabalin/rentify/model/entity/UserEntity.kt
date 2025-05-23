package org.karabalin.rentify.model.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.PreUpdate
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "users")
class UserEntity(
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
    @Column(nullable = true)
    var photoKey: String?,
    @Column(nullable = false)
    var lastLoginTime: Instant,
    @Column(nullable = false, updatable = false)
    var createdAtTime: Instant = Instant.now(),
    @Column(nullable = false)
    var updatedAtTime: Instant = Instant.now(),
    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    val roleEntity: RoleEntity,
    @ManyToOne
    @JoinColumn(name = "status_id", nullable = false)
    var userStatusEntity: UserStatusEntity,
) {
    @PreUpdate
    fun onUpdate() {
        updatedAtTime = Instant.now()
    }
}
