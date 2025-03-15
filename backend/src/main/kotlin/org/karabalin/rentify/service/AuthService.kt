package org.karabalin.rentify.service

import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import jakarta.annotation.PostConstruct
import org.karabalin.rentify.model.domain.AuthTokens
import org.karabalin.rentify.model.dto.LoginRequest
import org.karabalin.rentify.model.dto.RegisterRequest
import org.karabalin.rentify.model.entity.Role
import org.karabalin.rentify.model.entity.User
import org.karabalin.rentify.repository.RoleRepository
import org.karabalin.rentify.repository.UserRepository
import org.karabalin.rentify.util.JwtUtil

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
                roleRepository.save(Role(name = roleName))
            }
        }
    }

    fun register(request: RegisterRequest): AuthTokens {
        val userRole = roleRepository.findByName("ROLE_USER")
            ?: throw IllegalStateException("ROLE_USER not found")

        val user = User(
            email = request.email,
            password = passwordEncoder.encode(request.password),
            role = userRole
        )
        userRepository.save(user)

        val accessToken = jwtUtil.generateAccessToken(user.email)
        val refreshToken = jwtUtil.generateRefreshToken(user.email)

        return AuthTokens(accessToken, refreshToken)
    }

    fun login(request: LoginRequest): AuthTokens {
        val user = userRepository.findByEmail(request.email)
            ?: throw UsernameNotFoundException("User with this email not found")

        authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(request.email, request.password)
        )

        val accessToken = jwtUtil.generateAccessToken(user.email)
        val refreshToken = jwtUtil.generateRefreshToken(user.email)

        return AuthTokens(accessToken, refreshToken)
    }

    fun refreshToken(refreshToken: String): AuthTokens {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw IllegalArgumentException("Invalid refresh token")
        }

        val email = jwtUtil.getEmailFromToken(refreshToken)
            ?: throw IllegalArgumentException("Invalid token")

        val accessToken = jwtUtil.generateAccessToken(email)
        return AuthTokens(accessToken, refreshToken)
    }
}