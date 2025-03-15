package org.karabalin.rentify.model.domain

data class AuthTokens (
    val accessToken: String,
    val refreshToken: String
)
