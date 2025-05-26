package org.karabalin.rentify.configuration

import org.karabalin.rentify.model.entity.RentalListingEntity
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Component

@Component
class RentalListingSpecification {
    fun searchSpecification(searchQuery: String): Specification<RentalListingEntity> =
        Specification { root, _, cb ->
            if (searchQuery.isBlank()) {
                cb.conjunction()
            } else {
                val searchPattern = "%${searchQuery.lowercase()}%"
                cb.or(
                    cb.like(cb.lower(root.get("title")), searchPattern),
                    cb.like(cb.lower(root.get("description")), searchPattern),
                    cb.like(cb.lower(root.get("address")), searchPattern),
                )
            }
        }
}
