package com.umassdining.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "menu_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "dining_hall_id")
    private String diningHallId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dining_hall_id", insertable = false, updatable = false)
    private DiningHall diningHall;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false)
    private MealType mealType;

    @Column(name = "menu_date", nullable = false)
    private LocalDate menuDate;

    private String category;

    private Integer calories;
    private Integer protein;
    private Integer carbs;
    private Integer fat;

    @ElementCollection
    @CollectionTable(name = "menu_item_tags", joinColumns = @JoinColumn(name = "menu_item_id"))
    @Column(name = "tag")
    private List<String> tags;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (menuDate == null) {
            menuDate = LocalDate.now();
        }
    }
}
