package org.karabalin.rentify.service

import org.karabalin.rentify.model.dto.AddRentalListingRequest
import org.karabalin.rentify.model.dto.OneRentalListing
import org.karabalin.rentify.model.entity.RentalListingEntity
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
    private val rentalListingRepository: RentalListingRepository
) {
    @Transactional
    fun addRentalListing(addRentalListingRequest: AddRentalListingRequest) {
        val userOptional = userRepository.findById(UUID.fromString(addRentalListingRequest.userId))
        val user = userOptional.orElseThrow {
            ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "User with id `${addRentalListingRequest.userId}` not found"
            )
        }
        rentalListingRepository.save(
            RentalListingEntity(
                title = addRentalListingRequest.title,
                description = addRentalListingRequest.description,
                address = addRentalListingRequest.address,
                tariffDescription = addRentalListingRequest.tariffDescription,
                autoRenew = addRentalListingRequest.autoRenew,
                userEntity = user
            )
        )
    }

    fun findRentalListingsByUserEntityId(userId: String): List<OneRentalListing> {
        return rentalListingRepository.findAllByUserEntityId(UUID.fromString(userId)).map {
            OneRentalListing(it.title, it.description, it.address, it.tariffDescription, it.autoRenew)
        }
    }

    fun findRentalListingById(rentalListingId: String): OneRentalListing {
        val rentalListingOptional = rentalListingRepository.findById(UUID.fromString(rentalListingId))
        val rentalListing = rentalListingOptional.orElseThrow {
            ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "RentalListing with id `${rentalListingId}` not found"
            )
        }
        return OneRentalListing(
            rentalListing.title,
            rentalListing.description,
            rentalListing.address,
            rentalListing.tariffDescription,
            rentalListing.autoRenew
        )
    }
}
