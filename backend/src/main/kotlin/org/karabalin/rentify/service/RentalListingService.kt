package org.karabalin.rentify.service

import org.karabalin.rentify.model.domain.RentalListing
import org.karabalin.rentify.model.dto.AddRentalListingRequest
import org.karabalin.rentify.model.dto.ImageData
import org.karabalin.rentify.model.dto.UpdateRentalListingRequest
import org.karabalin.rentify.model.entity.RentalListingEntity
import org.karabalin.rentify.model.entity.RentalListingPhotoEntity
import org.karabalin.rentify.repository.RentalListingPhotoRepository
import org.karabalin.rentify.repository.RentalListingRepository
import org.karabalin.rentify.repository.S3Repository
import org.karabalin.rentify.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.util.*

@Service
class RentalListingService(
    private val userRepository: UserRepository,
    private val rentalListingRepository: RentalListingRepository,
    private val rentalListingPhotoRepository: RentalListingPhotoRepository,
    private val s3Repository: S3Repository,
) {
    private val allowedFileTypes = setOf("image/png", "image/jpeg")
    private val maxFileSize = 5 * 1024 * 1024

    @Transactional
    fun addRentalListing(
        addRentalListingRequest: AddRentalListingRequest,
        mainImage: MultipartFile,
        additionalImages: List<MultipartFile>?,
    ) {
        val userOptional = userRepository.findById(UUID.fromString(addRentalListingRequest.userId))
        val user =
            userOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "User with id `${addRentalListingRequest.userId}` not found",
                )
            }
        val mainPhotoKey = s3Repository.uploadFile(mainImage)
        val additionalPhotoKeys = mutableListOf<String>()
        if (additionalImages != null) {
            for (image in additionalImages) {
                val link = s3Repository.uploadFile(image)
                additionalPhotoKeys.add(link)
            }
        }
        val rentalListing =
            RentalListingEntity(
                title = addRentalListingRequest.title,
                description = addRentalListingRequest.description,
                address = addRentalListingRequest.address,
                tariffDescription = addRentalListingRequest.tariffDescription,
                autoRenew = addRentalListingRequest.autoRenew,
                mainPhotoKey = mainPhotoKey,
                userEntity = user,
            )
        rentalListingRepository.save(
            rentalListing,
        )
        rentalListingPhotoRepository.saveAll(
            additionalPhotoKeys.map {
                RentalListingPhotoEntity(
                    fileKey = it,
                    rentalListingEntity = rentalListing,
                )
            },
        )
    }

    fun findRentalListingsByUserEntityId(userId: String): List<RentalListing> =
        rentalListingRepository
            .findAllByUserEntityId(UUID.fromString(userId))
            .sortedBy { it.createdAtTime }
            .map {
                RentalListing(
                    it.id.toString(),
                    it.title,
                    it.description,
                    it.address,
                    it.tariffDescription,
                    it.autoRenew,
                    ImageData(
                        it.mainPhotoKey,
                        s3Repository.generatePresignedLink(it.mainPhotoKey),
                    ),
                    rentalListingPhotoRepository.findAllByRentalListingEntityId(it.id!!).map { photo ->
                        ImageData(
                            photo.fileKey,
                            s3Repository.generatePresignedLink(photo.fileKey),
                        )
                    },
                    it.userEntity.id.toString(),
                )
            }

    fun findRentalListingById(rentalListingId: String): RentalListing {
        val rentalListingOptional = rentalListingRepository.findById(UUID.fromString(rentalListingId))
        val rentalListing =
            rentalListingOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "RentalListing with id `$rentalListingId` not found",
                )
            }
        return RentalListing(
            rentalListing.id.toString(),
            rentalListing.title,
            rentalListing.description,
            rentalListing.address,
            rentalListing.tariffDescription,
            rentalListing.autoRenew,
            ImageData(
                rentalListing.mainPhotoKey,
                s3Repository.generatePresignedLink(rentalListing.mainPhotoKey),
            ),
            rentalListingPhotoRepository.findAllByRentalListingEntityId(rentalListing.id!!).map { photo ->
                ImageData(
                    photo.fileKey,
                    s3Repository.generatePresignedLink(photo.fileKey),
                )
            },
            rentalListing.userEntity.id.toString(),
        )
    }

    fun findNewestRentalListings(): List<RentalListing> =
        rentalListingRepository.findAllByOrderByCreatedAtTimeDesc().map {
            RentalListing(
                it.id.toString(),
                it.title,
                it.description,
                it.address,
                it.tariffDescription,
                it.autoRenew,
                ImageData(
                    it.mainPhotoKey,
                    s3Repository.generatePresignedLink(it.mainPhotoKey),
                ),
                rentalListingPhotoRepository.findAllByRentalListingEntityId(it.id!!).map { photo ->
                    ImageData(
                        photo.fileKey,
                        s3Repository.generatePresignedLink(photo.fileKey),
                    )
                },
                it.userEntity.id.toString(),
            )
        }

    @Transactional
    fun updateRentalListingById(
        rentalListingId: String,
        request: UpdateRentalListingRequest,
        mainImageFile: MultipartFile?,
        deleteImageKeys: List<String>?,
        newImageFiles: List<MultipartFile>?,
    ) {
        val rentalListing =
            rentalListingRepository
                .findById(UUID.fromString(rentalListingId))
                .orElseThrow {
                    ResponseStatusException(HttpStatus.NOT_FOUND, "RentalListing with id `$rentalListingId` not found")
                }

        with(rentalListing) {
            title = request.title
            description = request.description
            address = request.address
            tariffDescription = request.tariffDescription
            autoRenew = request.autoRenew
        }

        if (mainImageFile != null) {
            validateImage(mainImageFile)
            s3Repository.deleteFile(rentalListing.mainPhotoKey)
            rentalListing.mainPhotoKey = s3Repository.uploadFile(mainImageFile)
        }

        val existingPhotos =
            rentalListingPhotoRepository
                .findAllByRentalListingEntityId(rentalListing.id!!)
                .associateBy { it.fileKey }
                .toMutableMap()

        deleteImageKeys?.forEach { key ->
            existingPhotos[key]?.let {
                s3Repository.deleteFile(key)
                rentalListingPhotoRepository.delete(it)
                existingPhotos.remove(key)
            }
        }

        newImageFiles?.forEach { file ->
            validateImage(file)
            val newKey = s3Repository.uploadFile(file)
            val photoEntity =
                RentalListingPhotoEntity(
                    fileKey = newKey,
                    rentalListingEntity = rentalListing,
                )
            rentalListingPhotoRepository.save(photoEntity)
        }

        rentalListingRepository.save(rentalListing)
    }

    private fun validateImage(file: MultipartFile) {
        if (file.size > maxFileSize) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Image size exceeds 5MB")
        }
        if (file.contentType !in allowedFileTypes) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Image must be PNG or JPEG")
        }
    }

    @Transactional
    fun deleteById(rentalListingId: String) {
        val rentalListingOptional = rentalListingRepository.findById(UUID.fromString(rentalListingId))
        if (rentalListingOptional.isPresent) {
            val rentalListingPhotoEntityList =
                rentalListingPhotoRepository.findAllByRentalListingEntityId(UUID.fromString(rentalListingId))
            for (photo in rentalListingPhotoEntityList) {
                s3Repository.deleteFile(photo.fileKey)
            }
            rentalListingPhotoRepository.deleteAllById(rentalListingPhotoEntityList.map { it.id })

            rentalListingRepository.deleteById(UUID.fromString(rentalListingId))

            s3Repository.deleteFile(rentalListingOptional.get().mainPhotoKey)
        }
    }
}
