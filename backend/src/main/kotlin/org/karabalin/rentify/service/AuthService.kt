package org.karabalin.rentify.service

import jakarta.annotation.PostConstruct
import org.karabalin.rentify.model.domain.AuthTokens
import org.karabalin.rentify.model.dto.LoginRequest
import org.karabalin.rentify.model.dto.RegisterRequest
import org.karabalin.rentify.model.entity.RoleEntity
import org.karabalin.rentify.model.entity.UserEntity
import org.karabalin.rentify.repository.RoleRepository
import org.karabalin.rentify.repository.UserRepository
import org.karabalin.rentify.util.JwtUtil
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.Instant

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
    private val jwtUtil: JwtUtil,
    private val authenticationManager: AuthenticationManager,
    private val passwordEncoder: PasswordEncoder
) {
    @PostConstruct
    fun initRoles() {
        listOf("ROLE_USER", "ROLE_ADMIN", "ROLE_MODERATOR").forEach { roleName ->
            if (roleRepository.findByName(roleName) == null) {
                roleRepository.save(RoleEntity(name = roleName))
            }
        }
    }

    fun register(request: RegisterRequest, photoLink: String): AuthTokens {
        val userRole = roleRepository.findByName("ROLE_USER") ?: throw IllegalStateException("ROLE_USER not found")

        val userEntity = UserEntity(
            email = request.email,
            password = passwordEncoder.encode(request.password),
            firstName = request.firstName,
            lastName = request.lastName,
            phone = request.phone,
            photoLink = photoLink,
            lastLoginTime = Instant.now(),
            roleEntity = userRole
        )
        val savedUser = userRepository.save(userEntity)

        val accessToken = jwtUtil.generateAccessToken(userEntity.email)
        val refreshToken = jwtUtil.generateRefreshToken(userEntity.email)

        return AuthTokens(accessToken, refreshToken, savedUser.id.toString())
    }

    fun login(request: LoginRequest): AuthTokens {
        val userOptional = userRepository.findByEmail(request.email)

        val user = userOptional.orElseThrow {
            throw UsernameNotFoundException("User with this email and password not found")
        }

        user.lastLoginTime = Instant.now()

        authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(request.email, request.password)
        )

        val accessToken = jwtUtil.generateAccessToken(user.email)
        val refreshToken = jwtUtil.generateRefreshToken(user.email)

        val savedUser = userRepository.save(user)

        return AuthTokens(accessToken, refreshToken, savedUser.id.toString())
    }

    fun refreshToken(refreshToken: String): AuthTokens {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw IllegalArgumentException("Invalid refresh token")
        }

        val email = jwtUtil.getEmailFromToken(refreshToken) ?: throw IllegalArgumentException("Invalid token")
        val userOptional = userRepository.findByEmail(email)
        val user = userOptional.orElseThrow {
            throw UsernameNotFoundException("User with this email and password not found")
        }
        val accessToken = jwtUtil.generateAccessToken(email)
        return AuthTokens(accessToken, refreshToken, user.id.toString())
    }
}