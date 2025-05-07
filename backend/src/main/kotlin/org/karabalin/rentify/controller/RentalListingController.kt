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
    private val rentalListingService: RentalListingService,
) {
    @GetMapping("/rentalListings/{rentalListingId}")
    fun getRentalListingById(
        @PathVariable rentalListingId: String,
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
                rentalListing.mainImageData,
                rentalListing.additionalImagesData,
                rentalListing.userId,
            ),
        )
    }

    @GetMapping("/users/{userId}/rentalListings")
    fun getRentalListingsByUserId(
        @PathVariable userId: String,
    ): ResponseEntity<List<GetExtendedRentalListingResponse>> =
        ResponseEntity.ok(
            rentalListingService.findRentalListingsByUserEntityId(userId).map {
                GetExtendedRentalListingResponse(
                    it.id,
                    it.title,
                    it.description,
                    it.address,
                    it.tariffDescription,
                    it.autoRenew,
                    it.mainImageData,
                    it.additionalImagesData,
                    it.userId,
                )
            },
        )

    @PostMapping("/rentalListings/create")
    fun create(
        @Valid @RequestPart("data") addRentalListingRequest: AddRentalListingRequest,
        @RequestPart("mainImage") mainImage: MultipartFile,
        @RequestPart("additionalImages") additionalImages: List<MultipartFile>?,
    ) {
        rentalListingService.addRentalListing(addRentalListingRequest, mainImage, additionalImages)
    }

    @PatchMapping("/rentalListings/{rentalListingId}", consumes = ["multipart/form-data"])
    fun updateRentalListingById(
        @PathVariable rentalListingId: String,
        @RequestPart("data") updateRentalListingRequest: UpdateRentalListingRequest,
        @RequestPart(value = "mainImageFile", required = false) mainImageFile: MultipartFile?,
        @RequestPart(value = "deleteImageKeys", required = false) deleteImageKeys: List<String>?,
        @RequestPart(value = "newImageFiles", required = false) newImageFiles: List<MultipartFile>?,
    ) {
        rentalListingService.updateRentalListingById(
            rentalListingId,
            updateRentalListingRequest,
            mainImageFile,
            deleteImageKeys,
            newImageFiles,
        )
    }

    @DeleteMapping("/rentalListings/{rentalListingId}")
    fun deleteRentalListingById(
        @PathVariable rentalListingId: String,
    ) {
        rentalListingService.deleteById(rentalListingId)
    }
}

@RestController
@RequestMapping("/unauthorizedApi/v1")
class RentalListingUnauthorizedController(
    private val rentalListingService: RentalListingService,
) {
    @GetMapping("/rentalListings")
    fun getNewestRentalListings(): ResponseEntity<List<GetPartialRentalListingResponse>> =
        ResponseEntity.ok(
            rentalListingService.findNewestRentalListings().map {
                GetPartialRentalListingResponse(
                    it.id,
                    it.title,
                    it.description,
                    it.address,
                    it.tariffDescription,
                    it.mainImageData,
                    it.additionalImagesData,
                    it.userId,
                )
            },
        )

    @GetMapping("/rentalListings/{rentalListingId}")
    fun getRentalListingById(
        @PathVariable rentalListingId: String,
    ): ResponseEntity<GetPartialRentalListingResponse> {
        val rentalListing = rentalListingService.findRentalListingById(rentalListingId)
        return ResponseEntity.ok(
            GetPartialRentalListingResponse(
                rentalListing.id,
                rentalListing.title,
                rentalListing.description,
                rentalListing.address,
                rentalListing.tariffDescription,
                rentalListing.mainImageData,
                rentalListing.additionalImagesData,
                rentalListing.userId,
            ),
        )
    }

    @GetMapping("/users/{userId}/rentalListings")
    fun getRentalListingsByUserId(
        @PathVariable userId: String,
    ): ResponseEntity<List<GetPartialRentalListingResponse>> =
        ResponseEntity.ok(
            rentalListingService.findRentalListingsByUserEntityId(userId).map {
                GetPartialRentalListingResponse(
                    it.id,
                    it.title,
                    it.description,
                    it.address,
                    it.tariffDescription,
                    it.mainImageData,
                    it.additionalImagesData,
                    it.userId,
                )
            },
        )
}
