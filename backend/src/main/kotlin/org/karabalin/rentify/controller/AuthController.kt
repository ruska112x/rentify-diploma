package org.karabalin.rentify.controller

import jakarta.validation.Valid
import org.karabalin.rentify.model.dto.AuthResponse
import org.karabalin.rentify.model.dto.LoginRequest
import org.karabalin.rentify.model.dto.RefreshTokenRequest
import org.karabalin.rentify.model.dto.RegisterRequest
import org.karabalin.rentify.repository.RoleRepository
import org.karabalin.rentify.service.AuthService
import org.karabalin.rentify.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.net.URI

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
    private val userService: UserService,
    private val roleRepository: RoleRepository
) {
    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<AuthResponse> {
        val user = userService.findUserByEmail(request.email)
        if (user.isPresent) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "User with this email already exists!")
        } else {
            return ResponseEntity.created(URI.create("")).body(authService.register(request))
        }
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): AuthResponse {
        try {
            return authService.login(request)
        } catch (e: UsernameNotFoundException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, e.message)
        }
    }

    @PostMapping("/refresh")
    fun refresh(@RequestBody request: RefreshTokenRequest): AuthResponse {
        return authService.refreshToken(request)
    }

    @GetMapping("/roles")
    fun getAllRoles(): List<String> {
        return roleRepository.findAll().map { it.name }
    }
}