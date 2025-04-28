package org.karabalin.rentify.controller

import jakarta.validation.Valid
import org.karabalin.rentify.model.dto.GetUserResponse
import org.karabalin.rentify.model.dto.UpdateUserRequest
import org.karabalin.rentify.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.*

@RestController
@RequestMapping("/authorizedApi/v1/user")
class UserController(
    private val userService: UserService
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
}
