package org.karabalin.rentify.repository

import org.karabalin.rentify.model.entity.RoleEntity
import org.karabalin.rentify.model.entity.UserStatusEntity
import org.springframework.data.jpa.repository.JpaRepository

interface UserStatusRepository : JpaRepository<UserStatusEntity, Long> {
    fun findByName(name: String): UserStatusEntity?
}
