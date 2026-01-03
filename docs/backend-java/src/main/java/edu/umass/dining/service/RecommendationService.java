package edu.umass.dining.service;

import edu.umass.dining.dto.RecommendationDTO;
import edu.umass.dining.model.MenuItem;
import edu.umass.dining.model.User;
import edu.umass.dining.model.UserPreference;
import edu.umass.dining.repository.MenuItemRepository;
import edu.umass.dining.repository.UserPreferenceRepository;
import edu.umass.dining.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;

    public List<RecommendationDTO> getRecommendations(String email) {
        User user = userRepository.findByEmail(email);
        UserPreference pref = userPreferenceRepository.findByUser(user);
        List<MenuItem> items = menuItemRepository.findByDate(LocalDate.now().toString());
        List<RecommendationDTO> recs = new ArrayList<>();
        for (MenuItem item : items) {
            double score = scoreItem(item, pref);
            if (score > 0) {
                recs.add(RecommendationDTO.builder()
                        .menuItemId(item.getId())
                        .score(score)
                        .build());
            }
        }
        recs.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        return recs;
    }

    private double scoreItem(MenuItem item, UserPreference pref) {
        // Match frontend logic exactly: dietary, dislikes, etc.
        double score = 1.0;
        if (pref.isVegan() && !item.isVegan()) return 0;
        if (pref.isVegetarian() && !item.isVegetarian()) return 0;
        if (pref.isGlutenFree() && !item.isGlutenFree()) return 0;
        if (pref.isDairyFree() && !item.isDairyFree()) return 0;
        if (pref.getDislikedIngredients() != null && !pref.getDislikedIngredients().isEmpty()) {
            for (String ing : pref.getDislikedIngredients().split(",")) {
                if (item.getName().toLowerCase().contains(ing.trim().toLowerCase())) return 0;
            }
        }
        // Add more scoring logic as needed to match frontend
        return score;
    }
}
