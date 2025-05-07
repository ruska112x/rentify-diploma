package org.karabalin.rentify.model.dto

data class ImageData(
    val key: String?,
    val link: String,
)

data class ImageUpdate(
    val key: String? = null,
    val action: String,
)
