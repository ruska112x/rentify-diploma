package org.karabalin.rentify.model.entity

import jakarta.persistence.*

@Entity
@Table(name = "users")
data class User (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false)
    val email: String,

    @Column(nullable = false)
    val password: String,

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false)
    val role: Role
)
