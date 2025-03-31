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

@Service
class RentalListingService(
    private val userRepository: UserRepository,
    private val rentalListingRepository: RentalListingRepository
) {
    @Transactional
    fun addRentalListing(addRentalListingRequest: AddRentalListingRequest) {
        val userOptional = userRepository.findByEmail(addRentalListingRequest.userEmail)
        val user = userOptional.orElseThrow {
            ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "User with email `${addRentalListingRequest.userEmail}` not found"
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

    fun findRentalListingsByUserEntityEmail(email: String): List<OneRentalListing> {
        return rentalListingRepository.findByUserEntityEmail(email).map {
            OneRentalListing(it.title, it.description, it.address, it.tariffDescription, it.autoRenew)
        }
    }
}
