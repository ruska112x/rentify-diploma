package org.karabalin.rentify.model.domain

import org.karabalin.rentify.model.dto.ImageData

data class User(
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String,
    val roleName: String,
    val imageData: ImageData,
)
