package org.karabalin.rentify.service

import jakarta.transaction.Transactional
import org.karabalin.rentify.model.dto.AddBookingRequest
import org.karabalin.rentify.model.dto.GetBookingResponse
import org.karabalin.rentify.model.dto.UpdateBookingRequest
import org.karabalin.rentify.model.entity.BookingEntity
import org.karabalin.rentify.repository.BookingRepository
import org.karabalin.rentify.repository.RentalListingRepository
import org.karabalin.rentify.repository.UserRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@Service
class BookingService(
    private val userRepository: UserRepository,
    private val rentalListingRepository: RentalListingRepository,
    private val bookingRepository: BookingRepository,
) {
    @Transactional
    fun create(
        addBookingRequest: AddBookingRequest,
        userId: String,
    ) {
        val userOptional = userRepository.findById(UUID.fromString(userId))
        val user =
            userOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "User with id `$userId` not found",
                )
            }
        val rentalListingOptional =
            rentalListingRepository.findById(
                UUID.fromString(addBookingRequest.rentalListingId),
            )
        val rentalListing =
            rentalListingOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "RentalListing with id `${addBookingRequest.rentalListingId}` not found",
                )
            }
        val bookingEntity =
            BookingEntity(
                startDateTime = addBookingRequest.startDateTime,
                endDateTime = addBookingRequest.endDateTime,
                rentalListingEntity = rentalListing,
                userEntity = user,
            )
        bookingRepository.save(bookingEntity)
    }

    fun getBookingById(bookingId: String): GetBookingResponse {
        val bookingOptional =
            bookingRepository.findById(UUID.fromString(bookingId))
        val booking =
            bookingOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Booking with id `$bookingId` not found",
                )
            }
        val getBookingResponse =
            GetBookingResponse(
                booking.id.toString(),
                booking.startDateTime,
                booking.endDateTime,
                booking.rentalListingEntity.id.toString(),
                booking.userEntity.id.toString(),
            )
        return getBookingResponse
    }

    fun getBookingsByUserId(userId: String): List<GetBookingResponse> {
        val bookingList =
            bookingRepository.getBookingsByUserEntityId(UUID.fromString(userId))
        val getBookingResponseList =
            bookingList.map {
                GetBookingResponse(
                    it.id.toString(),
                    it.startDateTime,
                    it.endDateTime,
                    it.rentalListingEntity.id.toString(),
                    it.userEntity.id.toString(),
                )
            }
        return getBookingResponseList
    }

    fun getBookingsByRentalListingId(
        rentalListingId: String,
    ): List<GetBookingResponse> {
        val bookingList =
            bookingRepository.getBookingsByRentalListingEntityId(
                UUID.fromString(rentalListingId),
            )
        val getBookingResponseList =
            bookingList.map {
                GetBookingResponse(
                    it.id.toString(),
                    it.startDateTime,
                    it.endDateTime,
                    it.rentalListingEntity.id.toString(),
                    it.userEntity.id.toString(),
                )
            }
        return getBookingResponseList
    }

    fun updateBookingById(
        bookingId: String,
        updateBookingRequest: UpdateBookingRequest,
    ) {
        val bookingOptional =
            bookingRepository.findById(UUID.fromString(bookingId))
        val booking =
            bookingOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Booking with id `$bookingId` not found",
                )
            }
        booking.startDateTime = updateBookingRequest.startDateTime
        booking.endDateTime = updateBookingRequest.endDateTime
        bookingRepository.save(booking)
    }

    fun deleteBookingById(bookingId: String) {
        val bookingOptional =
            bookingRepository.findById(UUID.fromString(bookingId))
        bookingOptional.ifPresent {
            bookingRepository.delete(it)
        }
    }
}
