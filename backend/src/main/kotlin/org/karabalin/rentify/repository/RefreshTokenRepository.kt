package org.karabalin.rentify.repository

import org.karabalin.rentify.model.entity.RefreshTokenEntity
import org.springframework.data.jpa.repository.JpaRepository

interface RefreshTokenRepository : JpaRepository<RefreshTokenEntity, String>
