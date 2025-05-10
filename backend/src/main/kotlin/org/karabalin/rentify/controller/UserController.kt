package org.karabalin.rentify.controller

import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.karabalin.rentify.model.domain.User
import org.karabalin.rentify.model.dto.GetExtendedUserResponse
import org.karabalin.rentify.model.dto.GetPartialUserResponse
import org.karabalin.rentify.model.dto.UpdateUserRequest
import org.karabalin.rentify.service.RefreshTokenService
import org.karabalin.rentify.service.UserService
import org.karabalin.rentify.util.JwtUtil
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.util.Optional

@RestController
@RequestMapping("/authorizedApi/v1/users")
class UserController(
    private val refreshTokenService: RefreshTokenService,
    private val userService: UserService,
    private val jwtUtil: JwtUtil,
) {
    @GetMapping("/{userId}")
    fun getOne(
        @PathVariable userId: String,
    ): ResponseEntity<GetExtendedUserResponse> {
        val userOptional: Optional<User> = userService.findById(userId)
        val user =
            userOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "User with id `$userId` not found",
                )
            }
        val getExtendedUserResponse =
            GetExtendedUserResponse(
                user.email,
                user.firstName,
                user.lastName,
                user.phone,
                user.roleName,
                user.imageData,
            )
        return ResponseEntity.ok(
            getExtendedUserResponse,
        )
    }

    @PatchMapping("/{userId}")
    fun updateUser(
        @PathVariable userId: String,
        @Valid @RequestPart("data") updateUserRequest: UpdateUserRequest,
        @RequestPart(
            value = "mainImageAction",
            required = false,
        ) mainImageAction: String?,
        @RequestPart(
            value = "mainImageFile",
            required = false,
        ) mainImageFile: MultipartFile?,
    ): ResponseEntity<String> {
        userService.update(
            userId,
            updateUserRequest,
            mainImageAction,
            mainImageFile,
        )
        return ResponseEntity.ok("")
    }

    @DeleteMapping
    fun deleteUser(request: HttpServletRequest) {
        val authHeader = request.getHeader("Authorization")
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            val accessToken = authHeader.substring(7)
            val userId = jwtUtil.getUserIdFromToken(accessToken)
            if (userId != null) {
                userService.deleteById(userId)
                refreshTokenService.delete(accessToken)
            }
        } else {
            throw ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Access token not found",
            )
        }
    }
}

@RestController
@RequestMapping("/unauthorizedApi/v1/users")
class UserUnauthorizedController(
    private val userService: UserService,
) {
    @GetMapping("/{userId}")
    fun getOne(
        @PathVariable userId: String,
    ): ResponseEntity<GetPartialUserResponse> {
        val userOptional: Optional<User> = userService.findById(userId)
        val user =
            userOptional.orElseThrow {
                ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "User with email `$userId` not found",
                )
            }
        val getPartialUserResponse =
            GetPartialUserResponse(
                user.firstName,
                user.lastName,
                user.imageData,
            )
        return ResponseEntity.ok(
            getPartialUserResponse,
        )
    }
}
