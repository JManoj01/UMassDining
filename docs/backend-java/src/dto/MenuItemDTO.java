package com.umassdining.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemDTO {
    private String id;
    private String name;
    private String description;
    private String diningHallId;
    private String diningHallName;
    private String mealType;
    private LocalDate menuDate;
    private String category;
    private Integer calories;
    private Integer protein;
    private Integer carbs;
    private Integer fat;
    private List<String> tags;
}
