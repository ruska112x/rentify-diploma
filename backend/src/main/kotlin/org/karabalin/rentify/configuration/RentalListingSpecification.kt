package org.karabalin.rentify.configuration

import jakarta.persistence.criteria.Predicate
import org.karabalin.rentify.model.entity.RentalListingEntity
import org.karabalin.rentify.model.entity.RentalListingStatusEntity
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Component

@Component
class RentalListingSpecification {
    fun searchSpecification(searchQuery: String): Specification<RentalListingEntity> =
        Specification { root, _, cb ->
            val predicates = mutableListOf<Predicate>()

            predicates.add(
                cb.equal(root.get<RentalListingStatusEntity>("rentalListingStatusEntity").get<String>("name"), "ACTIVE")
            )

            if (searchQuery.isNotBlank()) {
                val searchPattern = "%${searchQuery.lowercase()}%"
                predicates.add(
                    cb.or(
                        cb.like(cb.lower(root.get("title")), searchPattern),
                        cb.like(cb.lower(root.get("description")), searchPattern)
                    )
                )
            }

            cb.and(*predicates.toTypedArray())
        }
}
