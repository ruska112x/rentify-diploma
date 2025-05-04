package org.karabalin.rentify.model.dto

data class ImageData(
    val key: String?,
    val link: String
)

data class ImageAction(
    val key: String,
    val action: String,
    val newFileName: String?
)
