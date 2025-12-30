package com.umassdining.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationDTO {
    private String id;
    private String name;
    private String description;
    private String diningHallId;
    private String diningHallName;
    private String mealType;
    private String category;
    private Integer calories;
    private Integer protein;
    private List<String> tags;
    private Double score;
    private String reason;
}
