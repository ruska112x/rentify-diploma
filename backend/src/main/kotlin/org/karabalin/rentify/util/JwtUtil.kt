package org.karabalin.rentify.util

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtUtil(
    @Value("\${jwt.secret}") private val secret: String,
    @Value("\${jwt.accessTokenValidity}") private val accessTokenValidity: Long,
    @Value("\${jwt.refreshTokenValidity}") private val refreshTokenValidity: Long,
) {
    private val secretKey: SecretKey = Keys.hmacShaKeyFor(secret.toByteArray(Charsets.UTF_8))

    fun generateAccessToken(userId: String): String =
        Jwts
            .builder()
            .subject(userId)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + (accessTokenValidity * 1000)))
            .signWith(secretKey)
            .compact()

    fun generateRefreshToken(userId: String): String =
        Jwts
            .builder()
            .subject(userId)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + (refreshTokenValidity * 1000)))
            .signWith(secretKey)
            .compact()

    fun validateToken(token: String): Boolean {
        try {
            Jwts
                .parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
            return true
        } catch (e: Exception) {
            return false
        }
    }

    fun getUserIdFromToken(token: String): String? =
        Jwts
            .parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .payload.subject
}
