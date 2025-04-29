package org.karabalin.rentify.service

import org.karabalin.rentify.model.dto.GetUserResponse
import org.karabalin.rentify.model.dto.UpdateUserRequest
import org.karabalin.rentify.repository.UserRepository
import org.karabalin.rentify.repository.UserStatusRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.util.*

@Service
class UserService(
    private val userRepository: UserRepository,
    private val userStatusRepository: UserStatusRepository,
    private val s3Service: S3Service
) {
    fun findUserByEmail(userEmail: String): Optional<GetUserResponse> {
        val userEntity = userRepository.findByEmail(userEmail)
        var user: Optional<GetUserResponse> = Optional.empty()
        userEntity.ifPresent {
            var photoLink = ""
            if (it.photoLink != null && it.photoLink != "") {
                photoLink = s3Service.generatePresignedLink(it.photoLink!!)
            }

            user = Optional.of(
                GetUserResponse(
                    it.email,
                    it.firstName,
                    it.lastName,
                    it.phone,
                    it.roleEntity.name,
                    photoLink
                )
            )
        }
        return user
    }

    fun findById(userId: String): Optional<GetUserResponse> {
        val userEntity = userRepository.findById(UUID.fromString(userId))
        var user: Optional<GetUserResponse> = Optional.empty()
        userEntity.ifPresent {
            var photoLink = ""
            if (it.photoLink != null && it.photoLink != "") {
                photoLink = s3Service.generatePresignedLink(it.photoLink!!)
            }
            user = Optional.of(
                GetUserResponse(
                    it.email,
                    it.firstName,
                    it.lastName,
                    it.phone,
                    it.roleEntity.name,
                    photoLink
                )
            )
        }
        return user
    }

    fun update(userId: String, updateUserRequest: UpdateUserRequest) {
        val userOptional = userRepository.findById(UUID.fromString(userId))
        val user = userOptional.orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "User with email `$userId` not found")
        }
        user.firstName = updateUserRequest.firstName
        user.lastName = updateUserRequest.lastName
        user.phone = updateUserRequest.phone
        userRepository.save(user)
    }

    fun deleteUserByEmail(userEmail: String) {
        val userOptional = userRepository.findByEmail(userEmail)
        userOptional.ifPresent {
            val userStatus = userStatusRepository.findByName("DELETED")
                ?: throw IllegalStateException("User Status DELETED not found")
            it.userStatusEntity = userStatus
            userRepository.save(it)
        }
    }
}