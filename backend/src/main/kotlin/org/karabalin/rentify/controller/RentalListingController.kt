package org.karabalin.rentify.controller

import jakarta.validation.Valid
import org.karabalin.rentify.model.dto.AddRentalListingRequest
import org.karabalin.rentify.model.dto.OneRentalListing
import org.karabalin.rentify.model.dto.UpdateRentalListingRequest
import org.karabalin.rentify.service.RentalListingService
import org.karabalin.rentify.service.S3Service
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/authorizedApi/v1")
class RentalListingController(
    private val rentalListingService: RentalListingService, private val s3Service: S3Service
) {
    @PostMapping("/rentalListings/create")
    fun create(
        @Valid @RequestPart("data") addRentalListingRequest: AddRentalListingRequest,
        @RequestPart("mainImage") mainImage: MultipartFile,
        @RequestPart("additionalImages") additionalImages: List<MultipartFile>?
    ) {
        rentalListingService.addRentalListing(addRentalListingRequest, mainImage, additionalImages)
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

    @PatchMapping("/rentalListings/{rentalListingId}")
    fun updateRentalListingById(
        @PathVariable rentalListingId: String,
        @RequestPart("data") updateRentalListingRequest: UpdateRentalListingRequest,
        @RequestPart("mainImage") mainImage: MultipartFile?,
        @RequestPart("additionalImages") additionalImages: List<MultipartFile>?
    ) {
        rentalListingService.updateRentalListingById(
            rentalListingId, updateRentalListingRequest, mainImage, additionalImages
        )
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
    fun getNewestRentalListings(): ResponseEntity<List<OneRentalListing>> {
        return ResponseEntity.ok(rentalListingService.findNewestRentalListings())
    }
}
