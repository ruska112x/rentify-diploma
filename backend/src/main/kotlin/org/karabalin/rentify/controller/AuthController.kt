package org.karabalin.rentify.controller

import org.karabalin.rentify.model.dto.AuthResponse
import org.karabalin.rentify.model.dto.LoginRequest
import org.karabalin.rentify.model.dto.RefreshTokenRequest
import org.karabalin.rentify.model.dto.RegisterRequest
import org.karabalin.rentify.repository.RoleRepository
import org.karabalin.rentify.service.AuthService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
    private val roleRepository: RoleRepository
) {
    @PostMapping("/register")
    fun register(@RequestBody request: RegisterRequest): AuthResponse {
        return authService.register(request)
    }

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): AuthResponse {
        return authService.login(request)
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