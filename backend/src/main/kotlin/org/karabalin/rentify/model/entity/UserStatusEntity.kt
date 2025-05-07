package org.karabalin.rentify.model.entity

import jakarta.persistence.*

@Entity
@Table(name = "userStatuses")
class UserStatusEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column(unique = true, nullable = false)
    val name: String,
)
