package org.karabalin.rentify.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import java.util.UUID

@Service
class S3Service(
    private val s3Client: S3Client,
    @Value("\${s3.bucketName}") private val bucketName: String,
) {
    fun uploadFile(file: MultipartFile): String {
        val key = "${UUID.randomUUID()}_${file.originalFilename}"

        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.contentType)
                .build(),
            RequestBody.fromInputStream(file.inputStream, file.size)
        )

        return "https://storage.yandexcloud.net/${bucketName}/$key"
    }
}