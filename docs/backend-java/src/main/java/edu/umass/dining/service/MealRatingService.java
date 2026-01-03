package edu.umass.dining.service;

import edu.umass.dining.dto.MealRatingDTO;
import edu.umass.dining.model.MealRating;
import edu.umass.dining.model.MenuItem;
import edu.umass.dining.model.User;
import edu.umass.dining.repository.MealRatingRepository;
import edu.umass.dining.repository.MenuItemRepository;
import edu.umass.dining.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MealRatingService {
    private final MealRatingRepository mealRatingRepository;
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;

    public void rateMeal(String email, MealRatingDTO dto) {
        User user = userRepository.findByEmail(email);
        MenuItem item = menuItemRepository.findById(dto.getMenuItemId()).orElse(null);
        if (user == null || item == null) return;
        MealRating rating = new MealRating();
        rating.setUser(user);
        rating.setMenuItem(item);
        rating.setRating(dto.getRating());
        mealRatingRepository.save(rating);
    }
}
