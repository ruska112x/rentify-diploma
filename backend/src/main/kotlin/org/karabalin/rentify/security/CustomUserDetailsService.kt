package org.karabalin.rentify.security

import org.karabalin.rentify.repository.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class CustomUserDetailsService(
    private val userRepository: UserRepository
) : UserDetailsService {
    override fun loadUserByUsername(email: String): UserDetails {
        val userOptional = userRepository.findByEmail(email)

        val user = userOptional.orElseThrow {
            throw UsernameNotFoundException("User not found")
        }

        val authorities = listOf(SimpleGrantedAuthority(user.roleEntity.getAuthority()))

        return User(user.email, user.password, authorities)
    }
}