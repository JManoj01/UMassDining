package edu.umass.dining.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferenceDTO {
    private boolean vegetarian;
    private boolean vegan;
    private boolean glutenFree;
    private boolean dairyFree;
    private String favoriteDiningHalls; // Comma-separated IDs
    private String dislikedIngredients; // Comma-separated
}
