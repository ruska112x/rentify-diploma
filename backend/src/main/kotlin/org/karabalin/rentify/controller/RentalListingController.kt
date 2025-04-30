package org.karabalin.rentify.controller

import jakarta.validation.Valid
import org.karabalin.rentify.model.dto.AddRentalListingRequest
import org.karabalin.rentify.model.dto.OneRentalListing
import org.karabalin.rentify.service.RentalListingService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/authorizedApi/v1")
class RentalListingController (
    private val rentalListingService: RentalListingService
) {
    @PostMapping("/rentalListings/create")
    fun create(@Valid @RequestBody addRentalListingRequest: AddRentalListingRequest) {
        rentalListingService.addRentalListing(addRentalListingRequest)
    }

    @GetMapping("/user/{userId}/rentalListings")
    fun getRentalListingsByUserId(
        @PathVariable userId: String
    ): ResponseEntity<List<OneRentalListing>> {
        return ResponseEntity.ok(rentalListingService.findRentalListingsByUserEntityId(userId))
    }

    @GetMapping("/rentalListings/{rentalListingId}")
    fun getRentalListingById(
        @PathVariable rentalListingId: String
    ): ResponseEntity<OneRentalListing> {
        return ResponseEntity.ok(rentalListingService.findRentalListingById(rentalListingId))
    }

    @DeleteMapping("/rentalListings/{rentalListingId}")
    fun deleteRentalListingById(
        @PathVariable rentalListingId: String
    ) {
        rentalListingService.deleteById(rentalListingId)
    }
}

@RestController
@RequestMapping("/unauthorizedApi/v1")
class RentalListingUnauthorizedController(
    private val rentalListingService: RentalListingService
) {
    @GetMapping("/rentalListings")
    fun getNewestRentalListings(): ResponseEntity<List<OneRentalListing>>  {
        return ResponseEntity.ok(rentalListingService.findNewestRentalListings())
    }
}
