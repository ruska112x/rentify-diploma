package org.karabalin.rentify.model.domain

data class User(
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String,
    val roleName: String,
    val photoLink: String
)
