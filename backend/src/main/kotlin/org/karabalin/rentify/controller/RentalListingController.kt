package org.karabalin.rentify.controller

import jakarta.validation.Valid
import org.karabalin.rentify.model.dto.AddRentalListingRequest
import org.karabalin.rentify.model.dto.GetExtendedRentalListingResponse
import org.karabalin.rentify.model.dto.GetPartialRentalListingResponse
import org.karabalin.rentify.model.dto.UpdateRentalListingRequest
import org.karabalin.rentify.service.RentalListingService
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
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
        val rentalListing =
            rentalListingService.findRentalListingById(rentalListingId)
        val getExtendedRentalListingResponse =
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
            )
        return ResponseEntity.ok(
            getExtendedRentalListingResponse,
        )
    }

    @GetMapping("/users/{userId}/activeRentalListings")
    fun getActiveRentalListingsByUserId(
        @PathVariable userId: String,
    ): ResponseEntity<List<GetExtendedRentalListingResponse>> =
        ResponseEntity.ok(
            rentalListingService
                .findActiveRentalListingsByUserEntityId(userId)
                .map {
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

    @GetMapping("/users/{userId}/archivedRentalListings")
    fun getArchivedRentalListingsByUserId(
        @PathVariable userId: String,
    ): ResponseEntity<List<GetExtendedRentalListingResponse>> =
        ResponseEntity.ok(
            rentalListingService
                .findArchivedRentalListingsByUserEntityId(
                    userId,
                ).map {
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

    @PostMapping(
        value = ["/rentalListings/create"],
        consumes = ["multipart/form-data"],
    )
    fun create(
        @Valid @RequestPart("data") addRentalListingRequest:
            AddRentalListingRequest,
        @RequestPart("mainImage") mainImage: MultipartFile,
        @RequestPart("additionalImages") additionalImages: List<MultipartFile>?,
    ) {
        rentalListingService.addRentalListing(
            addRentalListingRequest,
            mainImage,
            additionalImages,
        )
    }

    @PostMapping("/archiveRentalListings/{rentalId}")
    fun archive(
        @PathVariable rentalId: String,
    ) {
        rentalListingService.archiveRentalListingById(rentalId)
    }

    @PatchMapping(
        value = ["/rentalListings/{rentalListingId}"],
        consumes = ["multipart/form-data"],
    )
    fun updateRentalListingById(
        @PathVariable rentalListingId: String,
        @RequestPart("data") updateRentalListingRequest:
            UpdateRentalListingRequest,
        @RequestPart(
            value = "mainImageFile",
            required = false,
        ) mainImageFile: MultipartFile?,
        @RequestPart(
            value = "deleteImageKeys",
            required = false,
        ) deleteImageKeys: List<String>?,
        @RequestPart(
            value = "newImageFiles",
            required = false,
        ) newImageFiles: List<MultipartFile>?,
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

    @GetMapping("/searchRentalListings")
    fun search(
        @RequestParam("q") query: String,
        @RequestParam("page") page: Int,
        @RequestParam("size") size: Int,
    ): Page<GetPartialRentalListingResponse> {
        val pageable =
            PageRequest.of(page, size, Sort.by("createdAtTime").descending())
        return rentalListingService.searchRentalListings(query, pageable)
    }

    @GetMapping("/rentalListings/{rentalListingId}")
    fun getRentalListingById(
        @PathVariable rentalListingId: String,
    ): ResponseEntity<GetPartialRentalListingResponse> {
        val rentalListing =
            rentalListingService.findRentalListingById(rentalListingId)
        val getPartialRentalListingResponse =
            GetPartialRentalListingResponse(
                rentalListing.id,
                rentalListing.title,
                rentalListing.description,
                rentalListing.address,
                rentalListing.tariffDescription,
                rentalListing.mainImageData,
                rentalListing.additionalImagesData,
                rentalListing.userId,
            )
        return ResponseEntity.ok(
            getPartialRentalListingResponse,
        )
    }

    @GetMapping("/users/{userId}/activeRentalListings")
    fun getActiveRentalListingsByUserId(
        @PathVariable userId: String,
    ): ResponseEntity<List<GetPartialRentalListingResponse>> =
        ResponseEntity.ok(
            rentalListingService
                .findActiveRentalListingsByUserEntityId(userId)
                .map {
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

    @GetMapping("/users/{userId}/archivedRentalListings")
    fun getArchivedRentalListingsByUserId(
        @PathVariable userId: String,
    ): ResponseEntity<List<GetPartialRentalListingResponse>> =
        ResponseEntity.ok(
            rentalListingService
                .findArchivedRentalListingsByUserEntityId(userId)
                .map {
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
