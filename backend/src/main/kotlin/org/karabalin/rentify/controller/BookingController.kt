package org.karabalin.rentify.controller

import jakarta.servlet.http.HttpServletRequest
import org.karabalin.rentify.model.dto.AddBookingRequest
import org.karabalin.rentify.model.dto.GetBookingResponse
import org.karabalin.rentify.model.dto.UpdateBookingRequest
import org.karabalin.rentify.service.BookingService
import org.karabalin.rentify.util.JwtUtil
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/authorizedApi/v1")
class BookingController(
    private val bookingService: BookingService, private val jwtUtil: JwtUtil
) {
    @PostMapping("/bookings")
    fun createBooking(
        request: HttpServletRequest, @RequestBody addBookingRequest: AddBookingRequest
    ) {
        val authHeader = request.getHeader("Authorization")
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            val accessToken = authHeader.substring(7)
            val userId = jwtUtil.getUserIdFromToken(accessToken)
            if (userId != null) {
                bookingService.create(addBookingRequest, userId)
            } else {
                throw ResponseStatusException(HttpStatus.NOT_FOUND, "Access token doesn't contains userId")
            }
        } else {
            throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Access token not found")
        }
    }

    @GetMapping("/bookings/{bookingId}")
    fun getBookingById(@PathVariable bookingId: String): ResponseEntity<GetBookingResponse> {
        val getBookingResponse = bookingService.getBookingById(bookingId)
        return ResponseEntity.ok(getBookingResponse)
    }

    @GetMapping("/users/{userId}/bookings")
    fun getBookingsByUserId(@PathVariable userId: String): ResponseEntity<List<GetBookingResponse>> {
        val getBookingResponseList = bookingService.getBookingsByUserId(userId)
        return ResponseEntity.ok(getBookingResponseList)
    }

    @GetMapping("/rentalListings/{rentalListingId}/bookings")
    fun getBookingsByRentalListingId(@PathVariable rentalListingId: String): ResponseEntity<List<GetBookingResponse>> {
        val getBookingResponseList = bookingService.getBookingsByRentalListingId(rentalListingId)
        return ResponseEntity.ok(getBookingResponseList)
    }

    @PutMapping("/bookings/{bookingId}")
    fun updateBookingById(@PathVariable bookingId: String, @RequestBody updateBookingRequest: UpdateBookingRequest) {
        bookingService.updateBookingById(bookingId, updateBookingRequest)
    }

    @DeleteMapping("/bookings/{bookingId}")
    fun deleteBookingById(@PathVariable bookingId: String) {
        bookingService.deleteBookingById(bookingId)
    }
}