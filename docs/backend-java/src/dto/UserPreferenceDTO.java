package com.umassdining.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferenceDTO {
    private List<String> dietaryPreferences;
    private List<String> dislikedIngredients;
    private List<String> favoriteHalls;
}
