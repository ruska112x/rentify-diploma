package org.karabalin.rentify.model.mapper

import org.karabalin.rentify.model.domain.RentalListing
import org.karabalin.rentify.model.domain.RentalListingAddress
import org.karabalin.rentify.model.domain.RentalListingTariff
import org.karabalin.rentify.model.dto.GetExtendedRentalListingResponse
import org.karabalin.rentify.model.dto.GetPartialRentalListingResponse
import org.karabalin.rentify.model.dto.ImageData
import org.karabalin.rentify.model.dto.RentalListingAddressDto
import org.karabalin.rentify.model.dto.RentalListingTariffDto
import org.karabalin.rentify.model.entity.RentalListingAddressEntity
import org.karabalin.rentify.model.entity.RentalListingEntity
import org.karabalin.rentify.model.entity.RentalListingTariffEntity
import org.karabalin.rentify.repository.RentalListingPhotoRepository
import org.karabalin.rentify.repository.S3Repository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class RentalListingMapper(
    private val s3Repository: S3Repository,
    private val rentalListingPhotoRepository: RentalListingPhotoRepository,
) {
    fun entityToDomain(entity: RentalListingEntity): RentalListing =
        RentalListing(
            entity.id.toString(),
            entity.title,
            entity.description,
            addressEntityToDomain(entity.rentalListingAddressEntity),
            tariffEntityToDomain(entity.rentalListingTariffEntity),
            entity.autoRenew,
            imageKeyToImageData(entity.mainPhotoKey),
            getAdditionalImagesByRentalListingEntityId(entity.id!!),
            entity.userEntity.id.toString(),
            entity.rentalListingStatusEntity.name,
        )

    fun domainToPartialDto(domain: RentalListing): GetPartialRentalListingResponse =
        GetPartialRentalListingResponse(
            domain.id,
            domain.title,
            domain.description,
            domain.address.locality,
            domain.tariff.perHour,
            domain.mainImageData,
            domain.additionalImagesData,
            domain.userId,
        )

    fun domainToExtendedDto(domain: RentalListing): GetExtendedRentalListingResponse =
        GetExtendedRentalListingResponse(
            domain.id,
            domain.title,
            domain.description,
            addressDomainToDto(domain.address),
            tariffDomainToDto(domain.tariff),
            domain.autoRenew,
            domain.mainImageData,
            domain.additionalImagesData,
            domain.userId,
            domain.status,
        )

    fun addressEntityToDomain(entity: RentalListingAddressEntity): RentalListingAddress =
        RentalListingAddress(
            entity.district,
            entity.locality,
            entity.street,
            entity.houseNumber,
            entity.additionalInfo,
        )

    fun addressDomainToDto(domain: RentalListingAddress): RentalListingAddressDto =
        RentalListingAddressDto(
            domain.district,
            domain.locality,
            domain.street,
            domain.houseNumber,
            domain.additionalInfo,
        )

    fun tariffEntityToDomain(entity: RentalListingTariffEntity): RentalListingTariff =
        RentalListingTariff(
            entity.perHour,
            entity.perDay,
            entity.perWeek,
            entity.additionalInfo,
        )

    fun tariffDomainToDto(domain: RentalListingTariff): RentalListingTariffDto =
        RentalListingTariffDto(
            domain.perHour,
            domain.perDay,
            domain.perWeek,
            domain.additionalInfo,
        )

    fun imageKeyToImageData(imageKey: String): ImageData =
        ImageData(
            imageKey,
            s3Repository.generatePresignedLink(imageKey),
        )

    fun getAdditionalImagesByRentalListingEntityId(id: UUID): List<ImageData> =
        rentalListingPhotoRepository
            .findAllByRentalListingEntityId(
                id,
            ).map { photo ->
                ImageData(
                    photo.fileKey,
                    s3Repository.generatePresignedLink(
                        photo.fileKey,
                    ),
                )
            }
}
