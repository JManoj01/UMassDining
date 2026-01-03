package edu.umass.dining.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dining_halls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiningHall {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String specialty;
}
