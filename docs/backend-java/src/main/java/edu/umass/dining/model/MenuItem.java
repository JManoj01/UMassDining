package edu.umass.dining.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "menu_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dining_hall_id", nullable = false)
    private DiningHall diningHall;

    @Column(nullable = false)
    private String mealType;

    @Column(nullable = false)
    private boolean vegetarian;

    @Column(nullable = false)
    private boolean vegan;

    @Column(nullable = false)
    private boolean glutenFree;

    @Column(nullable = false)
    private boolean dairyFree;

    @Column(nullable = false)
    private boolean containsNuts;

    @Column(nullable = false)
    private boolean containsSoy;

    @Column(nullable = false)
    private boolean containsShellfish;

    @Column(nullable = false)
    private boolean containsEggs;

    @Column(nullable = false)
    private boolean containsWheat;

    @Column(nullable = false)
    private boolean containsDairy;

    @Column(nullable = false)
    private int calories;

    @Column(nullable = false)
    private int protein;

    @Column(nullable = false)
    private int carbs;

    @Column(nullable = false)
    private int fat;
}
