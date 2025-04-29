package org.karabalin.rentify.controller

import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import jakarta.validation.Valid
import org.karabalin.rentify.model.dto.AuthResponse
import org.karabalin.rentify.model.dto.LoginRequest
import org.karabalin.rentify.model.dto.RegisterRequest
import org.karabalin.rentify.service.AuthService
import org.karabalin.rentify.service.RefreshTokenService
import org.karabalin.rentify.service.S3Service
import org.karabalin.rentify.service.UserService
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/unauthorizedApi/v1/auth")
class AuthController(
    private val authService: AuthService,
    private val userService: UserService,
    private val refreshTokenService: RefreshTokenService,
    private val s3Service: S3Service,
    @Value("\${jwt.refreshTokenValidity}")
    private val refreshTokenValidity: Long
) {
    @PostMapping("/register")
    fun register(
        @Valid @RequestPart("data") request: RegisterRequest,
        response: HttpServletResponse,
        @RequestPart(value = "profilePicture", required = false) profilePicture: MultipartFile?
    ): ResponseEntity<AuthResponse> {
        val user = userService.findUserByEmail(request.email)
        if (user.isPresent) {
            throw ResponseStatusException(HttpStatus.CONFLICT, "User with this email already exists!")
        } else {
            var photoLink: String? = null
            if (profilePicture != null) {
                photoLink = s3Service.uploadFile(profilePicture)
            }
            val authTokens = authService.register(request, photoLink)
            refreshTokenService.create(authTokens.refreshToken)
            val cookie = Cookie("refreshToken", authTokens.refreshToken).apply {
                isHttpOnly = true
                secure = false
                path = "/"
                maxAge = refreshTokenValidity.toInt()
                setAttribute("SameSite", "Lax")
            }
            response.addCookie(cookie)
            return ResponseEntity.ok(AuthResponse(authTokens.accessToken, authTokens.userId))
        }
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest, response: HttpServletResponse): ResponseEntity<AuthResponse> {
        try {
            val authTokens = authService.login(request)
            refreshTokenService.create(authTokens.refreshToken)
            val cookie = Cookie("refreshToken", authTokens.refreshToken).apply {
                isHttpOnly = true
                secure = false
                path = "/"
                maxAge = refreshTokenValidity.toInt()
                setAttribute("SameSite", "Lax")
            }
            response.addCookie(cookie)
            return ResponseEntity.ok(AuthResponse(authTokens.accessToken, authTokens.userId))
        } catch (e: UsernameNotFoundException) {
            throw ResponseStatusException(HttpStatus.NOT_FOUND, e.message)
        }
    }

    @PostMapping("/refresh")
    fun refresh(request: HttpServletRequest, response: HttpServletResponse): ResponseEntity<AuthResponse> {
        val refreshToken = request.cookies?.find { it.name == "refreshToken" }?.value
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token not found")
        if (refreshTokenService.isAvailable(refreshToken)) {
            val authTokens = authService.refreshToken(refreshToken)
            val cookie = Cookie("refreshToken", authTokens.refreshToken).apply {
                isHttpOnly = true
                secure = false
                path = "/"
                maxAge = refreshTokenValidity.toInt()
                setAttribute("SameSite", "Lax")
            }
            response.addCookie(cookie)
            return ResponseEntity.ok(AuthResponse(authTokens.accessToken, authTokens.userId))
        } else {
            val cookie = Cookie("refreshToken", "").apply {
                isHttpOnly = true
                secure = false
                path = "/"
                maxAge = 0
                setAttribute("SameSite", "Lax")
            }
            response.addCookie(cookie)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        }
    }

    @PostMapping("/logout")
    fun logout(request: HttpServletRequest, response: HttpServletResponse): ResponseEntity<String> {
        val refreshToken = request.cookies?.find { it.name == "refreshToken" }?.value
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token not found")
        refreshTokenService.delete(refreshToken)
        val cookie = Cookie("refreshToken", "").apply {
            isHttpOnly = true
            secure = false
            path = "/"
            maxAge = 0
            setAttribute("SameSite", "Lax")
        }
        response.addCookie(cookie)
        return ResponseEntity.ok("")
    }
}