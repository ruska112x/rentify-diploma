package org.karabalin.rentify.service

import org.karabalin.rentify.model.domain.User
import org.karabalin.rentify.repository.UserRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class UserService(
    private val userRepository: UserRepository
) {
    fun findUserByEmail(email: String): Optional<User> {
        val userEntity = userRepository.findByEmail(email)
        var user: Optional<User> = Optional.empty()
        userEntity.ifPresent {
            user = Optional.of(User(it.email, it.firstName, it.lastName, it.phone, it.roleEntity.name))
        }
        return user
    }
}