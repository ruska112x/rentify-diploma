package org.karabalin.rentify.controller

import jakarta.validation.Valid
import org.karabalin.rentify.model.dto.AddRentalListingRequest
import org.karabalin.rentify.model.dto.GetExtendedRentalListingResponse
import org.karabalin.rentify.model.dto.GetPartialRentalListingResponse
import org.karabalin.rentify.model.dto.UpdateRentalListingRequest
import org.karabalin.rentify.service.RentalListingService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/authorizedApi/v1")
class RentalListingController(
    private val rentalListingService: RentalListingService
) {
    @GetMapping("/rentalListings/{rentalListingId}")
    fun getRentalListingById(
        @PathVariable rentalListingId: String
    ): ResponseEntity<GetExtendedRentalListingResponse> {
        val rentalListing = rentalListingService.findRentalListingById(rentalListingId)
        return ResponseEntity.ok(
            GetExtendedRentalListingResponse(
                rentalListing.id,
                rentalListing.title,
                rentalListing.description,
                rentalListing.address,
                rentalListing.tariffDescription,
                rentalListing.autoRenew,
                rentalListing.mainPhotoLink,
                rentalListing.additionalPhotoLinks,
                rentalListing.userId
            )
        )
    }

    @GetMapping("/users/{userId}/rentalListings")
    fun getRentalListingsByUserId(
        @PathVariable userId: String
    ): ResponseEntity<List<GetExtendedRentalListingResponse>> {
        return ResponseEntity.ok(rentalListingService.findRentalListingsByUserEntityId(userId).map {
            GetExtendedRentalListingResponse(
                it.id,
                it.title,
                it.description,
                it.address,
                it.tariffDescription,
                it.autoRenew,
                it.mainPhotoLink,
                it.additionalPhotoLinks,
                it.userId
            )
        })
    }

    @PostMapping("/rentalListings/create")
    fun create(
        @Valid @RequestPart("data") addRentalListingRequest: AddRentalListingRequest,
        @RequestPart("mainImage") mainImage: MultipartFile,
        @RequestPart("additionalImages") additionalImages: List<MultipartFile>?
    ) {
        rentalListingService.addRentalListing(addRentalListingRequest, mainImage, additionalImages)
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
    fun getNewestRentalListings(): ResponseEntity<List<GetPartialRentalListingResponse>> {
        return ResponseEntity.ok(rentalListingService.findNewestRentalListings().map {
            GetPartialRentalListingResponse(
                it.id,
                it.title,
                it.description,
                it.address,
                it.tariffDescription,
                it.mainPhotoLink,
                it.additionalPhotoLinks,
                it.userId
            )
        })
    }

    @GetMapping("/rentalListings/{rentalListingId}")
    fun getRentalListingById(
        @PathVariable rentalListingId: String
    ): ResponseEntity<GetPartialRentalListingResponse> {
        val rentalListing = rentalListingService.findRentalListingById(rentalListingId)
        return ResponseEntity.ok(
            GetPartialRentalListingResponse(
                rentalListing.id,
                rentalListing.title,
                rentalListing.description,
                rentalListing.address,
                rentalListing.tariffDescription,
                rentalListing.mainPhotoLink,
                rentalListing.additionalPhotoLinks,
                rentalListing.userId
            )
        )
    }

    @GetMapping("/users/{userId}/rentalListings")
    fun getRentalListingsByUserId(
        @PathVariable userId: String
    ): ResponseEntity<List<GetPartialRentalListingResponse>> {
        return ResponseEntity.ok(rentalListingService.findRentalListingsByUserEntityId(userId).map {
            GetPartialRentalListingResponse(
                it.id,
                it.title,
                it.description,
                it.address,
                it.tariffDescription,
                it.mainPhotoLink,
                it.additionalPhotoLinks,
                it.userId
            )
        })
    }
}
