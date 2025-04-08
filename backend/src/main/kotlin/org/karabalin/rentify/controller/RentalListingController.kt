package org.karabalin.rentify.controller

import jakarta.validation.Valid
import org.karabalin.rentify.model.dto.AddRentalListingRequest
import org.karabalin.rentify.model.dto.OneRentalListing
import org.karabalin.rentify.service.RentalListingService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/rentalListing")
class RentalListingController (
    private val rentalListingService: RentalListingService
) {
    @PostMapping("/create")
    fun create(@Valid @RequestBody addRentalListingRequest: AddRentalListingRequest) {
        rentalListingService.addRentalListing(addRentalListingRequest)
    }

    @GetMapping("/{userId}")
    fun getRentalListingsByUserEmail(
        @PathVariable userId: String
    ): ResponseEntity<List<OneRentalListing>> {
        return ResponseEntity.ok(rentalListingService.findRentalListingsByUserEntityId(userId))
    }

    @GetMapping("/{rentalListingId}")
    fun getRentalListingById(
        @PathVariable rentalListingId: String
    ): ResponseEntity<OneRentalListing> {
        return ResponseEntity.ok(rentalListingService.findRentalListingById(rentalListingId))
    }
}
