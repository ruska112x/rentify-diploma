package org.karabalin.rentify.model.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import org.hibernate.validator.constraints.Length

data class RegisterRequest(
    @field:Email(message = "Email must be in format 'example@mail.org'")
    val email: String,

    @field:NotBlank
    @field:Length(min = 8, max = 255, message = "Password must be at least 8 characters long")
    val password: String
)

data class LoginRequest(
    @field:Email(message = "Email must be in format 'example@mail.org'")
    val email: String,

    @field:NotBlank
    @field:Length(min = 8, max = 255, message = "Password must be at least 8 characters long")
    val password: String
)

data class AuthResponse(
    val accessToken: String,
    val refreshToken: String
)

data class RefreshTokenRequest(
    val refreshToken: String
)
