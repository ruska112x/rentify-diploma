package org.karabalin.rentify.controller

import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.karabalin.rentify.model.dto.AuthResponse
import org.karabalin.rentify.model.dto.LoginRequest
import org.karabalin.rentify.model.dto.RegisterRequest
import org.karabalin.rentify.repository.RoleRepository
import org.karabalin.rentify.service.AuthService
import org.karabalin.rentify.service.UserService
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
    private val userService: UserService,
    private val roleRepository: RoleRepository,
    @Value("\${jwt.refreshTokenValidity}")
    private val refreshTokenValidity: Long
) {
    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest, response: HttpServletResponse): ResponseEntity<AuthResponse> {
        val user = userService.findUserByEmail(request.email)
        if (user.isPresent) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "User with this email already exists!")
        } else {
            val authTokens = authService.register(request)
            val cookie = Cookie("refreshToken", authTokens.refreshToken).apply {
                isHttpOnly = true
                secure = false
                path = "/"
                maxAge = refreshTokenValidity.toInt()
                setAttribute("SameSite", "Lax")
            }
            response.addCookie(cookie)
            return ResponseEntity.ok(AuthResponse(authTokens.accessToken))
        }
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest, response: HttpServletResponse): ResponseEntity<AuthResponse> {
        try {
            val authTokens = authService.login(request)
            val cookie = Cookie("refreshToken", authTokens.refreshToken).apply {
                isHttpOnly = true
                secure = false
                path = "/"
                maxAge = refreshTokenValidity.toInt()
                setAttribute("SameSite", "Lax")
            }
            response.addCookie(cookie)
            return ResponseEntity.ok(AuthResponse(authTokens.accessToken))
        } catch (e: UsernameNotFoundException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, e.message)
        }
    }

    @PostMapping("/refresh")
    fun refresh(request: HttpServletRequest, response: HttpServletResponse): ResponseEntity<AuthResponse> {
        val refreshToken = request.cookies?.find { it.name == "refreshToken" }?.value
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token not found")
        val authTokens = authService.refreshToken(refreshToken)
        val cookie = Cookie("refreshToken", authTokens.refreshToken).apply {
            isHttpOnly = true
            secure = false
            path = "/"
            maxAge = refreshTokenValidity.toInt()
            setAttribute("SameSite", "Lax")
        }
        response.addCookie(cookie)
        return ResponseEntity.ok(AuthResponse(authTokens.accessToken))
    }

    @GetMapping("/roles")
    fun getAllRoles(): List<String> {
        return roleRepository.findAll().map { it.name }
    }
}