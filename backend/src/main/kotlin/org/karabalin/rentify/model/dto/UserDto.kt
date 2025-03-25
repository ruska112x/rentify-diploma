package org.karabalin.rentify.model.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import org.hibernate.validator.constraints.Length

data class GetUserResponse(
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String,
    val roleName: String
)

data class UpdateUserRequest(
    @field:NotBlank
    @field:Length(min = 1, max = 255, message = "FirstName must be at least 1 characters long")
    val firstName: String,

    @field:NotBlank
    @field:Length(min = 1, max = 255, message = "LastName must be at least 1 characters long")
    val lastName: String,

    @field:NotBlank
    @field:Pattern(
        regexp = "^\\+?[1-9]\\d{1,14}$",
        message = "Phone number must follow the international format"
    )
    val phone: String
)
