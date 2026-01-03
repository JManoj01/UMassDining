package edu.umass.dining.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private boolean vegetarian;

    @Column(nullable = false)
    private boolean vegan;

    @Column(nullable = false)
    private boolean glutenFree;

    @Column(nullable = false)
    private boolean dairyFree;

    @Column(nullable = false)
    private String favoriteDiningHalls; // Comma-separated IDs

    @Column(nullable = false)
    private String dislikedIngredients; // Comma-separated
}
