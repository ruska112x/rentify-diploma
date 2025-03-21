package org.karabalin.rentify.controller

import com.fasterxml.jackson.databind.ObjectMapper
import org.karabalin.rentify.model.domain.User
import org.karabalin.rentify.repository.UserRepository
import org.karabalin.rentify.service.UserService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import java.util.*

@RestController
@RequestMapping("/api")
class UserController(
    private val userService: UserService
) {
    @GetMapping("/{email}")
    fun getOne(@PathVariable email: String): User {
        val userOptional: Optional<User> = userService.findUserByEmail(email)
        return userOptional.orElseThrow {
            ResponseStatusException(HttpStatus.NOT_FOUND, "User with email `$email` not found")
        }
    }
}
