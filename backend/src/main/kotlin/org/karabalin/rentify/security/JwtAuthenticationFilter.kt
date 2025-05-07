package org.karabalin.rentify.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.karabalin.rentify.repository.UserRepository
import org.karabalin.rentify.util.JwtUtil
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtUtil: JwtUtil,
    private val userDetailsService: UserDetailsService,
    private val userRepository: UserRepository,
) : OncePerRequestFilter() {
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain,
    ) {
        val authHeader = request.getHeader("Authorization")

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            val token = authHeader.substring(7)
            if (jwtUtil.validateToken(token)) {
                val userId = jwtUtil.getUserIdFromToken(token)
                if (userId != null) {
                    try {
                        val userDetails =
                            userDetailsService.loadUserByUsername(userId)
                        val authentication =
                            UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.authorities,
                            )
                        authentication.details =
                            WebAuthenticationDetailsSource().buildDetails(
                                request,
                            )
                        SecurityContextHolder.getContext().authentication =
                            authentication
                    } catch (e: UsernameNotFoundException) {
                        response.status = HttpStatus.NOT_FOUND.value()
                        response.writer.write("""{"error": "${e.message}"}""")
                    }
                }
            }
        }

        filterChain.doFilter(request, response)
    }
}
