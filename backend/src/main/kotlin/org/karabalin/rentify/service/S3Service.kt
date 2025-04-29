package org.karabalin.rentify.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.model.ObjectCannedACL
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest
import java.time.Duration
import java.util.*

@Service
class S3Service(
    private val s3Client: S3Client,
    private val s3Presigner: S3Presigner,
    @Value("\${s3.bucketName}") private val bucketName: String,
) {
    fun uploadFile(file: MultipartFile): String {
        val key = "${UUID.randomUUID()}_${file.originalFilename}"

        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .acl(ObjectCannedACL.PUBLIC_READ)
                .contentType(file.contentType)
                .build(),
            RequestBody.fromInputStream(file.inputStream, file.size)
        )

        return key
    }

    fun generatePresignedLink(keyName: String): String {
        s3Presigner.use { presigner ->
            val objectRequest: GetObjectRequest? = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(keyName)
                .build()
            val presignRequest: GetObjectPresignRequest? = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10)) // The URL will expire in 10 minutes.
                .getObjectRequest(objectRequest)
                .build()

            val presignedRequest = presigner.presignGetObject(presignRequest)

            return presignedRequest.url().toExternalForm()
        }
    }
}