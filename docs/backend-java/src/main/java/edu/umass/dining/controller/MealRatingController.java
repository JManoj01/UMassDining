package edu.umass.dining.controller;

import edu.umass.dining.dto.MealRatingDTO;
import edu.umass.dining.service.MealRatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class MealRatingController {
    private final MealRatingService mealRatingService;

    @PostMapping
    public void rateMeal(@RequestParam String email, @RequestBody MealRatingDTO dto) {
        mealRatingService.rateMeal(email, dto);
    }
}
