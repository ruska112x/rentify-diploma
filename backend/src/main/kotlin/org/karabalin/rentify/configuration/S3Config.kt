package org.karabalin.rentify.configuration

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.http.apache.ApacheHttpClient
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import java.net.URI

@Configuration
class S3Config(
    @Value("\${s3.accessKey}") private val accessKey: String,
    @Value("\${s3.secretKey}") private val secretKey: String,
    @Value("\${s3.region}") private val region: String,
    @Value("\${s3.endpoint}") private val endpoint: String,
) {
    private val awsRegion = Region.of(region)

    private val awsBasicCredentials =
        AwsBasicCredentials.create(
            accessKey,
            secretKey,
        )

    @Bean
    fun s3Client(): S3Client =
        S3Client
            .builder()
            .region(awsRegion)
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    awsBasicCredentials,
                ),
            ).endpointOverride(URI.create(endpoint))
            .httpClientBuilder(ApacheHttpClient.builder())
            .build()

    @Bean
    fun s3Presigner(): S3Presigner =
        S3Presigner
            .builder()
            .region(awsRegion)
            .credentialsProvider(
                StaticCredentialsProvider.create(
                    awsBasicCredentials,
                ),
            ).endpointOverride(URI.create(endpoint))
            .build()
}
