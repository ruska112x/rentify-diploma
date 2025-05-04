package org.karabalin.rentify.service

import org.karabalin.rentify.model.domain.RentalListing
import org.karabalin.rentify.model.dto.AddRentalListingRequest
import org.karabalin.rentify.model.dto.ImageAction
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
    private val s3Repository: S3Repository
) {
    @Transactional
    fun addRentalListing(
        addRentalListingRequest: AddRentalListingRequest,
        mainImage: MultipartFile,
        additionalImages: List<MultipartFile>?
    ) {
        val userOptional = userRepository.findById(UUID.fromString(addRentalListingRequest.userId))
        val user = userOptional.orElseThrow {
            ResponseStatusException(
                HttpStatus.NOT_FOUND, "User with id `${addRentalListingRequest.userId}` not found"
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
        val rentalListing = RentalListingEntity(
            title = addRentalListingRequest.title,
            description = addRentalListingRequest.description,
            address = addRentalListingRequest.address,
            tariffDescription = addRentalListingRequest.tariffDescription,
            autoRenew = addRentalListingRequest.autoRenew,
            mainPhotoKey = mainPhotoKey,
            userEntity = user
        )
        rentalListingRepository.save(
            rentalListing
        )
        rentalListingPhotoRepository.saveAll(
            additionalPhotoKeys.map {
                RentalListingPhotoEntity(
                    fileKey = it, rentalListingEntity = rentalListing
                )
            })
    }

    fun findRentalListingsByUserEntityId(userId: String): List<RentalListing> {
        return rentalListingRepository.findAllByUserEntityId(UUID.fromString(userId)).sortedBy { it.createdAtTime }
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
                        s3Repository.generatePresignedLink(it.mainPhotoKey)
                    ),
                    rentalListingPhotoRepository.findAllByRentalListingEntityId(it.id!!).map { photo ->
                        ImageData(
                            photo.fileKey,
                            s3Repository.generatePresignedLink(photo.fileKey)
                        )
                    },
                    it.userEntity.id.toString()
                )
            }
    }

    fun findRentalListingById(rentalListingId: String): RentalListing {
        val rentalListingOptional = rentalListingRepository.findById(UUID.fromString(rentalListingId))
        val rentalListing = rentalListingOptional.orElseThrow {
            ResponseStatusException(
                HttpStatus.NOT_FOUND, "RentalListing with id `${rentalListingId}` not found"
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
                s3Repository.generatePresignedLink(rentalListing.mainPhotoKey)
            ),
            rentalListingPhotoRepository.findAllByRentalListingEntityId(rentalListing.id!!).map { photo ->
                ImageData(
                    photo.fileKey,
                    s3Repository.generatePresignedLink(photo.fileKey)
                )
            },
            rentalListing.userEntity.id.toString()
        )
    }

    fun findNewestRentalListings(): List<RentalListing> {
        return rentalListingRepository.findAllByOrderByCreatedAtTimeDesc().map {
            RentalListing(
                it.id.toString(),
                it.title,
                it.description,
                it.address,
                it.tariffDescription,
                it.autoRenew,
                ImageData(
                    it.mainPhotoKey,
                    s3Repository.generatePresignedLink(it.mainPhotoKey)
                ),
                rentalListingPhotoRepository.findAllByRentalListingEntityId(it.id!!).map { photo ->
                    ImageData(
                        photo.fileKey,
                        s3Repository.generatePresignedLink(photo.fileKey)
                    )
                },
                it.userEntity.id.toString()
            )
        }
    }

    @Transactional
    fun updateRentalListingById(
        rentalListingId: String,
        updateRentalListingRequest: UpdateRentalListingRequest,
        mainImageAction: String?,
        mainImageFile: MultipartFile?,
        additionalImageActions: List<ImageAction>?,
        additionalImageFiles: List<MultipartFile>?
    ) {
        val rentalListingOptional = rentalListingRepository.findById(UUID.fromString(rentalListingId))
        val rentalListing = rentalListingOptional.orElseThrow {
            ResponseStatusException(
                HttpStatus.NOT_FOUND, "RentalListing with id `${rentalListingId}` not found"
            )
        }
        rentalListing.title = updateRentalListingRequest.title
        rentalListing.description = updateRentalListingRequest.description
        rentalListing.address = updateRentalListingRequest.address
        rentalListing.tariffDescription = updateRentalListingRequest.tariffDescription
        rentalListing.autoRenew = updateRentalListingRequest.autoRenew

        if (mainImageAction != null) {
            if (mainImageAction == "change") {
                s3Repository.deleteFile(rentalListing.mainPhotoKey)
                val mainPhotoKey = s3Repository.uploadFile(mainImageFile!!)
                rentalListing.mainPhotoKey = mainPhotoKey
            }
        }

        val rentalListingPhotoEntityList =
            rentalListingPhotoRepository.findAllByRentalListingEntityId(rentalListing.id!!).toMutableList()

        if (additionalImageActions != null && !additionalImageActions.isEmpty()) {
            for (imageAction in additionalImageActions) {
                if (imageAction.action == "delete") {
                    s3Repository.deleteFile(imageAction.key)
                    val rentalListingPhotoEntity =
                        rentalListingPhotoEntityList.find { it.fileKey == imageAction.key }
                    rentalListingPhotoRepository.delete(rentalListingPhotoEntity!!)
                }
            }
            if (additionalImageFiles != null && !additionalImageFiles.isEmpty()) {
                for (imageAction in additionalImageActions) {
                    if (imageAction.action == "add") {
                        val newFile = additionalImageFiles.find { it.originalFilename == imageAction.newFileName }
                        val newFileKey = s3Repository.uploadFile(newFile!!)
                        val rentalListingPhotoEntity =
                            RentalListingPhotoEntity(fileKey = newFileKey, rentalListingEntity = rentalListing)
                        rentalListingPhotoRepository.save(rentalListingPhotoEntity)
                    }
                }
            }
        }

        rentalListingRepository.save(rentalListing)
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
