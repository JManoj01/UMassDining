package com.umassdining.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @ElementCollection
    @CollectionTable(name = "user_dietary_preferences", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "preference")
    private List<String> dietaryPreferences;

    @ElementCollection
    @CollectionTable(name = "user_disliked_ingredients", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "ingredient")
    private List<String> dislikedIngredients;

    @ElementCollection
    @CollectionTable(name = "user_favorite_halls", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "hall_id")
    private List<String> favoriteHalls;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
