package edu.umass.dining.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealRatingDTO {
    private Long menuItemId;
    private int rating;
}
