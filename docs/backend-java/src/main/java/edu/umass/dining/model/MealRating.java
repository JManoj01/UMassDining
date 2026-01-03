package edu.umass.dining.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "meal_ratings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealRating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false)
    private int rating;
}
