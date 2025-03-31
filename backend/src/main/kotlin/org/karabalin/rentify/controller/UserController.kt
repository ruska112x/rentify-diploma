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
@RequestMapping("/api/user")
class UserController(
    private val userService: UserService
) {
    @GetMapping("/{email}")
    fun getOne(@PathVariable email: String): ResponseEntity<GetUserResponse> {
        val userOptional: Optional<GetUserResponse> = userService.findUserByEmail(email)
        val user = userOptional.orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "User with email `$email` not found")
        }
        return ResponseEntity.ok(user)
    }

    @PatchMapping("/{email}")
    fun updateUser(
        @PathVariable email: String,
        @Valid @RequestBody updateUserRequest: UpdateUserRequest
    ): ResponseEntity<String> {
        userService.updateUserByEmail(email, updateUserRequest)
        return ResponseEntity.ok("")
    }
}
