package com.umassdining.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "dining_halls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiningHall {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "short_name", nullable = false)
    private String shortName;

    @Column(nullable = false)
    private String location;

    @Column(name = "breakfast_hours")
    private String breakfastHours;

    @Column(name = "lunch_hours")
    private String lunchHours;

    @Column(name = "dinner_hours")
    private String dinnerHours;

    @ElementCollection
    @CollectionTable(name = "dining_hall_features", joinColumns = @JoinColumn(name = "dining_hall_id"))
    @Column(name = "feature")
    private List<String> features;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "diningHall", cascade = CascadeType.ALL)
    private List<MenuItem> menuItems;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
