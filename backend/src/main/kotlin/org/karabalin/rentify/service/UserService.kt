package org.karabalin.rentify.service

import org.karabalin.rentify.model.domain.User
import org.karabalin.rentify.repository.UserRepository
import org.springframework.stereotype.Service
import java.util.Optional

@Service
class UserService(
    private val userRepository: UserRepository
) {
    fun findUserByEmail(email: String): Optional<User> {
        val userEntity = userRepository.findByEmail(email)
        return if (userEntity != null) {
            Optional.of(User(userEntity.email, userEntity.role.name))
        } else {
            Optional.empty()
        }
    }
}