package org.karabalin.rentify.model.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import org.hibernate.validator.constraints.Length

data class RegisterRequest(
    @field:Email(message = "Email must be in format 'example@mail.org'")
    val email: String,
    @field:NotBlank
    @field:Length(min = 8, max = 255, message = "Password must be at least 8 characters long")
    val password: String,
    @field:NotBlank
    @field:Length(min = 1, max = 255, message = "FirstName must be at least 1 characters long")
    val firstName: String,
    @field:NotBlank
    @field:Length(min = 1, max = 255, message = "LastName must be at least 1 characters long")
    val lastName: String,
    @field:NotBlank
    @field:Pattern(
        regexp = "^\\+?[1-9]\\d{1,14}$",
        message = "Phone number must follow the international format",
    )
    val phone: String,
)

data class LoginRequest(
    @field:Email(message = "Email must be in format 'example@mail.org'")
    val email: String,
    @field:NotBlank
    @field:Length(min = 8, max = 255, message = "Password must be at least 8 characters long")
    val password: String,
)

data class AuthResponse(
    val accessToken: String,
)
