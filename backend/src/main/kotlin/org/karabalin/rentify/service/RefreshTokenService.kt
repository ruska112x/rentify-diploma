package org.karabalin.rentify.service

import org.karabalin.rentify.model.entity.RefreshTokenEntity
import org.karabalin.rentify.repository.RefreshTokenRepository
import org.springframework.stereotype.Service

@Service
class RefreshTokenService(
    private val refreshTokenRepository: RefreshTokenRepository,
) {
    fun create(token: String) {
        val refreshTokenEntity = RefreshTokenEntity(token = token)
        refreshTokenRepository.save(refreshTokenEntity)
    }

    fun isAvailable(token: String): Boolean = refreshTokenRepository.existsById(token)

    fun delete(token: String) {
        refreshTokenRepository.deleteById(token)
    }
}
