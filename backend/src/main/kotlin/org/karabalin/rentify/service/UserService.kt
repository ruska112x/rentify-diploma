package org.karabalin.rentify.service

import org.karabalin.rentify.model.domain.User
import org.karabalin.rentify.model.dto.UpdateUserRequest
import org.karabalin.rentify.repository.S3Repository
import org.karabalin.rentify.repository.UserRepository
import org.karabalin.rentify.repository.UserStatusRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.util.*

@Service
class UserService(
    private val userRepository: UserRepository,
    private val userStatusRepository: UserStatusRepository,
    private val s3Repository: S3Repository
) {
    fun findUserByEmail(userEmail: String): Optional<User> {
        val userEntity = userRepository.findByEmail(userEmail)
        var user: Optional<User> = Optional.empty()
        userEntity.ifPresent {
            var photoLink = ""
            if (it.photoLink != null && it.photoLink != "") {
                photoLink = s3Repository.generatePresignedLink(it.photoLink!!)
            }

            user = Optional.of(
                User(
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

    fun findById(userId: String): Optional<User> {
        val userEntity = userRepository.findById(UUID.fromString(userId))
        var user: Optional<User> = Optional.empty()
        userEntity.ifPresent {
            var photoLink = ""
            if (it.photoLink != null && it.photoLink != "") {
                photoLink = s3Repository.generatePresignedLink(it.photoLink!!)
            }
            user = Optional.of(
                User(
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

    fun update(userId: String, updateUserRequest: UpdateUserRequest, profilePicture: MultipartFile?) {
        val userOptional = userRepository.findById(UUID.fromString(userId))
        val user = userOptional.orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "User with email `$userId` not found")
        }
        user.firstName = updateUserRequest.firstName
        user.lastName = updateUserRequest.lastName
        user.phone = updateUserRequest.phone
        var photoKey: String? = null
        if (user.photoLink != null) {
            s3Repository.deleteFile(user.photoLink!!)
        }
        user.photoLink = photoKey
        userRepository.save(user)
    }

    fun deleteById(userId: String) {
        val userOptional = userRepository.findById(UUID.fromString(userId))
        userOptional.ifPresent {
            val userStatus = userStatusRepository.findByName("DELETED")
                ?: throw IllegalStateException("User Status DELETED not found")
            it.userStatusEntity = userStatus
            userRepository.save(it)
        }
    }
}