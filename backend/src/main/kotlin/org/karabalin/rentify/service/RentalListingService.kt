package org.karabalin.rentify.service

import org.karabalin.rentify.model.dto.AddRentalListingRequest
import org.karabalin.rentify.model.dto.OneRentalListing
import org.karabalin.rentify.model.dto.UpdateRentalListingRequest
import org.karabalin.rentify.model.entity.RentalListingEntity
import org.karabalin.rentify.model.entity.RentalListingPhotoEntity
import org.karabalin.rentify.repository.RentalListingPhotoRepository
import org.karabalin.rentify.repository.RentalListingRepository
import org.karabalin.rentify.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.server.ResponseStatusException
import java.util.*

@Service
class RentalListingService(
    private val userRepository: UserRepository,
    private val rentalListingRepository: RentalListingRepository,
    private val rentalListingPhotoRepository: RentalListingPhotoRepository,
    private val s3Service: S3Service,
) {
    @Transactional
    fun addRentalListing(
        addRentalListingRequest: AddRentalListingRequest, mainPhotoKey: String, additionalPhotoKeys: List<String>
    ) {
        val userOptional = userRepository.findById(UUID.fromString(addRentalListingRequest.userId))
        val user = userOptional.orElseThrow {
            ResponseStatusException(
                HttpStatus.NOT_FOUND, "User with id `${addRentalListingRequest.userId}` not found"
            )
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

    fun findRentalListingsByUserEntityId(userId: String): List<OneRentalListing> {
        return rentalListingRepository.findAllByUserEntityId(UUID.fromString(userId)).sortedBy { it.createdAtTime }
            .map {
                OneRentalListing(
                    it.id.toString(),
                    it.title,
                    it.description,
                    it.address,
                    it.tariffDescription,
                    it.autoRenew,
                    s3Service.generatePresignedLink(it.mainPhotoKey),
                    rentalListingPhotoRepository.findAllByRentalListingEntityId(it.id!!).map { photo ->
                        s3Service.generatePresignedLink(photo.fileKey)
                    })
            }
    }

    fun findRentalListingById(rentalListingId: String): OneRentalListing {
        val rentalListingOptional = rentalListingRepository.findById(UUID.fromString(rentalListingId))
        val rentalListing = rentalListingOptional.orElseThrow {
            ResponseStatusException(
                HttpStatus.NOT_FOUND, "RentalListing with id `${rentalListingId}` not found"
            )
        }
        return OneRentalListing(
            rentalListing.id.toString(),
            rentalListing.title,
            rentalListing.description,
            rentalListing.address,
            rentalListing.tariffDescription,
            rentalListing.autoRenew,
            s3Service.generatePresignedLink(rentalListing.mainPhotoKey),
            rentalListingPhotoRepository.findAllByRentalListingEntityId(rentalListing.id!!).map { photo ->
                s3Service.generatePresignedLink(photo.fileKey)
            })
    }

    fun findNewestRentalListings(): List<OneRentalListing> {
        return rentalListingRepository.findAllByOrderByCreatedAtTimeDesc().map {
            OneRentalListing(
                it.id.toString(),
                it.title,
                it.description,
                it.address,
                it.tariffDescription,
                it.autoRenew,
                s3Service.generatePresignedLink(it.mainPhotoKey),
                rentalListingPhotoRepository.findAllByRentalListingEntityId(it.id!!).map { photo ->
                    s3Service.generatePresignedLink(photo.fileKey)
                })
        }
    }

    fun updateRentalListingById(
        rentalListingId: String, updateRentalListingRequest: UpdateRentalListingRequest
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
        rentalListingRepository.save(rentalListing)
    }

    fun deleteById(rentalListingId: String) {
        rentalListingRepository.deleteById(UUID.fromString(rentalListingId))
    }
}
