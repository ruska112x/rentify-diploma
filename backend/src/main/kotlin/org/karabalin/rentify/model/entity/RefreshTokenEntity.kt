package org.karabalin.rentify.model.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "refreshToken")
class RefreshTokenEntity(
    @Id
    @Column(unique = true, nullable = false)
    val token: String,
)
