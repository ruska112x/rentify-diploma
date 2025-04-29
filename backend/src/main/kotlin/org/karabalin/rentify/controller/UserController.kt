package org.karabalin.rentify.controller

import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.karabalin.rentify.model.dto.GetUserResponse
import org.karabalin.rentify.model.dto.UpdateUserRequest
import org.karabalin.rentify.service.RefreshTokenService
import org.karabalin.rentify.service.UserService
import org.karabalin.rentify.util.JwtUtil
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.*

@RestController
@RequestMapping("/authorizedApi/v1/user")
class UserController(
    private val refreshTokenService: RefreshTokenService,
    private val userService: UserService,
    private val jwtUtil: JwtUtil
) {
    @GetMapping("/{userId}")
    fun getOne(@PathVariable userId: String): ResponseEntity<GetUserResponse> {
        val userOptional: Optional<GetUserResponse> = userService.findById(userId)
        val user = userOptional.orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "User with email `$userId` not found")
        }
        return ResponseEntity.ok(user)
    }

    @PatchMapping("/{userId}")
    fun updateUser(
        @PathVariable userId: String,
        @Valid @RequestBody updateUserRequest: UpdateUserRequest
    ): ResponseEntity<String> {
        userService.update(userId, updateUserRequest)
        return ResponseEntity.ok("")
    }

    @DeleteMapping
    fun deleteUser(request: HttpServletRequest) {
        val refreshToken = request.cookies?.find { it.name == "refreshToken" }?.value
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token not found")
        val userEmail = jwtUtil.getEmailFromToken(refreshToken)
        if (userEmail != null) {
            userService.deleteUserByEmail(userEmail)
            refreshTokenService.delete(refreshToken)
        }
    }
}
