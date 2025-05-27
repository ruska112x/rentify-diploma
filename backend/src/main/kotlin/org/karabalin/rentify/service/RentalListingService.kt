package org.karabalin.rentify.service

import org.karabalin.rentify.configuration.RentalListingSpecification
import org.karabalin.rentify.model.domain.RentalListing
import org.karabalin.rentify.model.dto.AddRentalListingRequest
import org.karabalin.rentify.model.dto.GetPartialRentalListingResponse
import org.karabalin.rentify.model.dto.UpdateRentalListingRequest
import org.karabalin.rentify.model.entity.RentalListingAddressEntity
import org.karabalin.rentify.model.entity.RentalListingEntity
import org.karabalin.rentify.model.entity.RentalListingPhotoEntity
import org.karabalin.rentify.model.entity.RentalListingTariffEntity
import org.karabalin.rentify.model.mapper.RentalListingMapper
import org.karabalin.rentify.repository.BookingRepository
import org.karabalin.rentify.repository.RentalListingAddressRepository
import org.karabalin.rentify.repository.RentalListingPhotoRepository
import org.karabalin.rentify.repository.RentalListingRepository
import org.karabalin.rentify.repository.RentalListingStatusRepository
import org.karabalin.rentify.repository.RentalListingTariffRepository
import org.karabalin.rentify.repository.S3Repository
import org.karabalin.rentify.repository.UserRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class RentalListingService(
    private val userRepository: UserRepository,
    private val rentalListingRepository: RentalListingRepository,
    private val rentalListingPhotoRepository: RentalListingPhotoRepository,
    private val rentalListingStatusRepository: RentalListingStatusRepository,
    private val rentalListingSpecification: RentalListingSpecification,
    private val rentalListingAddressRepository: RentalListingAddressRepository,
    private val rentalListingTariffRepository: RentalListingTariffRepository,
    private val bookingRepository: BookingRepository,
    private val s3Repository: S3Repository,
    private val rentalListingMapper: RentalListingMapper,
) {
    private val allowedFileTypes = setOf("image/png", "image/jpeg")
    private val maxFileSize = 5 * 1024 * 1024

    @Transactional
    fun addRentalListing(
        addRentalListingRequest: AddRentalListingRequest,
        mainImage: MultipartFile,
        additionalImages: List<MultipartFile>?,
    ) {
        val userOptional =
            userRepository.findById(
                UUID.fromString(addRentalListingRequest.userId),
            )
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
        val rentalListingStatusOptional = rentalListingStatusRepository.findByName("ACTIVE")
        val rentalListingStatus =
            rentalListingStatusOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Rental Listing Status with name ACTIVE not found",
                )
            }

        val rentalListingAddressEntity =
            RentalListingAddressEntity(
                0,
                addRentalListingRequest.address.district,
                addRentalListingRequest.address.locality,
                addRentalListingRequest.address.street,
                addRentalListingRequest.address.houseNumber,
                addRentalListingRequest.address.additionalInfo,
            )

        rentalListingAddressRepository.save(rentalListingAddressEntity)

        val rentalListingTariffEntity =
            RentalListingTariffEntity(
                0,
                addRentalListingRequest.tariff.perHour,
                addRentalListingRequest.tariff.perDay,
                addRentalListingRequest.tariff.perWeek,
                addRentalListingRequest.tariff.additionalInfo,
            )

        rentalListingTariffRepository.save(rentalListingTariffEntity)

        val rentalListing =
            RentalListingEntity(
                title = addRentalListingRequest.title,
                description = addRentalListingRequest.description,
                rentalListingAddressEntity = rentalListingAddressEntity,
                rentalListingTariffEntity = rentalListingTariffEntity,
                autoRenew = addRentalListingRequest.autoRenew,
                mainPhotoKey = mainPhotoKey,
                userEntity = user,
                rentalListingStatusEntity = rentalListingStatus,
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

    fun searchRentalListings(
        searchQuery: String,
        pageable: Pageable,
    ): Page<GetPartialRentalListingResponse> =
        rentalListingRepository
            .findAll(
                rentalListingSpecification.searchSpecification(searchQuery),
                pageable,
            ).map {
                rentalListingMapper.domainToPartialDto(rentalListingMapper.entityToDomain(it))
            }

    fun findActiveRentalListingsByUserEntityId(userId: String): List<RentalListing> =
        rentalListingRepository.findAllActiveByUserEntityId(UUID.fromString(userId)).map {
            rentalListingMapper.entityToDomain(it)
        }

    fun findArchivedRentalListingsByUserEntityId(userId: String): List<RentalListing> =
        rentalListingRepository.findAllArchivedByUserEntityId(UUID.fromString(userId)).map {
            rentalListingMapper.entityToDomain(it)
        }

    @Transactional
    fun archiveRentalListingById(rentalListingId: String) {
        val rentalListingStatusOptional =
            rentalListingStatusRepository.findByName(
                "ARCHIVED",
            )
        val rentalListingStatus =
            rentalListingStatusOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Rental Listing Status with name ARCHIVED not found",
                )
            }

        val rentalListingEntityOptional =
            rentalListingRepository.findById(
                UUID.fromString(rentalListingId),
            )
        val rentalListingEntity =
            rentalListingEntityOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "RentalListing with id `$rentalListingId` not found",
                )
            }

        rentalListingEntity.rentalListingStatusEntity = rentalListingStatus
        rentalListingRepository.save(rentalListingEntity)
    }

    @Transactional
    fun archiveRentalListingsByUserEntityId(userEntityId: String) {
        val rentalListingStatusOptional =
            rentalListingStatusRepository.findByName(
                "ARCHIVED",
            )
        val rentalListingStatus =
            rentalListingStatusOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Rental Listing Status with name ARCHIVED not found",
                )
            }

        val rentalListings = rentalListingRepository.findAllActiveByUserEntityId(UUID.fromString(userEntityId))
        rentalListings.forEach {
            it.rentalListingStatusEntity = rentalListingStatus
        }
        rentalListingRepository.saveAll(rentalListings)
    }

    @Transactional
    fun unarchiveRentalListingById(rentalListingId: String) {
        val rentalListingStatusOptional =
            rentalListingStatusRepository.findByName(
                "ACTIVE",
            )
        val rentalListingStatus =
            rentalListingStatusOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Rental Listing Status with name ACTIVE not found",
                )
            }

        val rentalListingEntityOptional =
            rentalListingRepository.findById(
                UUID.fromString(rentalListingId),
            )
        val rentalListingEntity =
            rentalListingEntityOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "RentalListing with id `$rentalListingId` not found",
                )
            }

        rentalListingEntity.rentalListingStatusEntity = rentalListingStatus
        rentalListingRepository.save(rentalListingEntity)
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
        return rentalListingMapper.entityToDomain(rentalListing)
    }

    fun findNewestRentalListings(): List<RentalListing> =
        rentalListingRepository.findAllByOrderByCreatedAtTimeDesc().map {
            rentalListingMapper.entityToDomain(it)
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
            rentalListingRepository.findById(UUID.fromString(rentalListingId)).orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "RentalListing with id `$rentalListingId` not found",
                )
            }

        val rentalListingAddressOptional =
            rentalListingAddressRepository.findById(
                rentalListing.rentalListingAddressEntity.id,
            )

        val rentalListingAddressEntity =
            rentalListingAddressOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "RentalListing Address with id `${rentalListing.rentalListingAddressEntity.id}` not found",
                )
            }

        rentalListingAddressEntity.district = request.address.district
        rentalListingAddressEntity.locality = request.address.locality
        rentalListingAddressEntity.street = request.address.street
        rentalListingAddressEntity.houseNumber = request.address.houseNumber
        rentalListingAddressEntity.additionalInfo = request.address.additionalInfo

        rentalListingAddressRepository.save(rentalListingAddressEntity)

        val rentalListingTariffOptional =
            rentalListingTariffRepository.findById(
                rentalListing.rentalListingTariffEntity.id,
            )

        val rentalListingTariffEntity =
            rentalListingTariffOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "RentalListing Tariff with id `${rentalListing.rentalListingAddressEntity.id}` not found",
                )
            }

        rentalListingTariffEntity.perHour = request.tariff.perHour
        rentalListingTariffEntity.perDay = request.tariff.perDay
        rentalListingTariffEntity.perWeek = request.tariff.perWeek
        rentalListingTariffEntity.additionalInfo = request.tariff.additionalInfo

        rentalListingTariffRepository.save(rentalListingTariffEntity)

        with(rentalListing) {
            title = request.title
            description = request.description
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
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Image size exceeds 5MB",
            )
        }
        if (file.contentType !in allowedFileTypes) {
            throw ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Image must be PNG or JPEG",
            )
        }
    }

    @Transactional
    fun deleteById(rentalListingId: String) {
        val rentalListingOptional = rentalListingRepository.findById(UUID.fromString(rentalListingId))
        if (rentalListingOptional.isPresent) {
            val rentalListingPhotoEntityList =
                rentalListingPhotoRepository.findAllByRentalListingEntityId(
                    UUID.fromString(
                        rentalListingId,
                    ),
                )
            for (photo in rentalListingPhotoEntityList) {
                s3Repository.deleteFile(photo.fileKey)
            }
            rentalListingPhotoRepository.deleteAllById(
                rentalListingPhotoEntityList.map { it.id },
            )

            rentalListingRepository.deleteById(UUID.fromString(rentalListingId))

            s3Repository.deleteFile(rentalListingOptional.get().mainPhotoKey)
        }
    }
}
