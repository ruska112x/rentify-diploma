package org.karabalin.rentify.repository

import org.karabalin.rentify.model.entity.UserEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.*

interface UserRepository : JpaRepository<UserEntity, Long> {
    fun findByEmail(email: String): Optional<UserEntity>
}
