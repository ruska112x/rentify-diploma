package org.karabalin.rentify.model.entity

import jakarta.persistence.*

@Entity
@Table(name = "refreshToken")
class RefreshTokenEntity (
    @Id
    @Column(unique = true, nullable = false)
    val token: String
)
