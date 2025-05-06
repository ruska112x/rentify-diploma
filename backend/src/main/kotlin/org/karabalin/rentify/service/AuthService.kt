package org.karabalin.rentify.service

import jakarta.annotation.PostConstruct
import org.karabalin.rentify.model.domain.AuthTokens
import org.karabalin.rentify.model.dto.LoginRequest
import org.karabalin.rentify.model.dto.RegisterRequest
import org.karabalin.rentify.model.entity.RoleEntity
import org.karabalin.rentify.model.entity.UserEntity
import org.karabalin.rentify.model.entity.UserStatusEntity
import org.karabalin.rentify.repository.RoleRepository
import org.karabalin.rentify.repository.S3Repository
import org.karabalin.rentify.repository.UserRepository
import org.karabalin.rentify.repository.UserStatusRepository
import org.karabalin.rentify.util.JwtUtil
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.time.Instant
import java.util.*

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
    private val userStatusRepository: UserStatusRepository,
    private val s3Repository: S3Repository,
    private val jwtUtil: JwtUtil,
    private val authenticationManager: AuthenticationManager,
    private val passwordEncoder: PasswordEncoder,
) {
    @PostConstruct
    fun postConstruct() {
        listOf("ROLE_USER", "ROLE_ADMIN", "ROLE_MODERATOR").forEach { roleName ->
            if (roleRepository.findByName(roleName) == null) {
                roleRepository.save(RoleEntity(name = roleName))
            }
        }
        listOf("ACTIVE", "DELETED").forEach { userStatusName ->
            if (userStatusRepository.findByName(userStatusName) == null) {
                userStatusRepository.save(UserStatusEntity(name = userStatusName))
            }
        }
    }

    fun register(
        request: RegisterRequest,
        profilePicture: MultipartFile?,
    ): AuthTokens {
        val userRole = roleRepository.findByName("ROLE_USER") ?: throw IllegalStateException("ROLE_USER not found")
        val userStatus =
            userStatusRepository.findByName("ACTIVE") ?: throw IllegalStateException("User Status ACTIVE not found")

        var photoKey: String? = null
        if (profilePicture != null) {
            photoKey = s3Repository.uploadFile(profilePicture)
        }

        val userEntity =
            UserEntity(
                email = request.email,
                password = passwordEncoder.encode(request.password),
                firstName = request.firstName,
                lastName = request.lastName,
                phone = request.phone,
                photoKey = photoKey,
                lastLoginTime = Instant.now(),
                roleEntity = userRole,
                userStatusEntity = userStatus,
            )
        val savedUser = userRepository.save(userEntity)

        val accessToken = jwtUtil.generateAccessToken(savedUser.id.toString())
        val refreshToken = jwtUtil.generateRefreshToken(savedUser.id.toString())

        return AuthTokens(accessToken, refreshToken)
    }

    fun login(request: LoginRequest): AuthTokens {
        val userOptional = userRepository.findByEmail(request.email)

        val user =
            userOptional.orElseThrow {
                throw UsernameNotFoundException("User with this email and password not found")
            }

        if (user.userStatusEntity.name != "ACTIVE") {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, "User with this email deleted")
        }

        user.lastLoginTime = Instant.now()

        authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(user.id, request.password),
        )

        val accessToken = jwtUtil.generateAccessToken(user.id.toString())
        val refreshToken = jwtUtil.generateRefreshToken(user.id.toString())

        return AuthTokens(accessToken, refreshToken)
    }

    fun refreshToken(refreshToken: String): AuthTokens {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw IllegalArgumentException("Invalid refresh token")
        }

        val userId = jwtUtil.getUserIdFromToken(refreshToken)
        val userOptional = userRepository.findById(UUID.fromString(userId))
        val user =
            userOptional.orElseThrow {
                throw UsernameNotFoundException("User with this email and password not found")
            }
        val accessToken = jwtUtil.generateAccessToken(userId!!)
        return AuthTokens(accessToken, refreshToken)
    }
}
