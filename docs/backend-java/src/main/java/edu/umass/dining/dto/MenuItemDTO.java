package edu.umass.dining.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItemDTO {
    private Long id;
    private String name;
    private String date;
    private String mealType;
    private Long diningHallId;
    private boolean vegetarian;
    private boolean vegan;
    private boolean glutenFree;
    private boolean dairyFree;
    private boolean containsNuts;
    private boolean containsSoy;
    private boolean containsShellfish;
    private boolean containsEggs;
    private boolean containsWheat;
    private boolean containsDairy;
    private int calories;
    private int protein;
    private int carbs;
    private int fat;
}
