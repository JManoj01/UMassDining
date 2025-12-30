package com.umassdining.service;

import com.umassdining.model.*;
import com.umassdining.enums.MealType;
import com.umassdining.repository.*;
import com.umassdining.dto.RecommendationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final MenuItemRepository menuItemRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final MealRatingRepository mealRatingRepository;

    /**
     * Get personalized recommendations for a user
     */
    public List<RecommendationDTO> getRecommendations(String userId) {
        // Get user preferences
        Optional<UserPreference> prefsOpt = userPreferenceRepository.findByUserId(userId);
        
        // Get today's menu
        List<MenuItem> todaysMenu = menuItemRepository.findByMenuDate(LocalDate.now());
        
        if (todaysMenu.isEmpty()) {
            return Collections.emptyList();
        }

        // Get current meal type based on time
        MealType currentMealType = getCurrentMealType();
        
        // Filter by current meal type
        List<MenuItem> relevantItems = todaysMenu.stream()
            .filter(item -> item.getMealType() == currentMealType)
            .collect(Collectors.toList());

        if (prefsOpt.isEmpty()) {
            // No preferences, return popular items
            return getPopularItems(relevantItems);
        }

        UserPreference prefs = prefsOpt.get();
        
        // Score each menu item
        List<ScoredItem> scoredItems = relevantItems.stream()
            .map(item -> new ScoredItem(item, calculateScore(item, prefs, userId)))
            .sorted(Comparator.comparingDouble(ScoredItem::score).reversed())
            .limit(10)
            .collect(Collectors.toList());

        return scoredItems.stream()
            .map(si -> toRecommendationDTO(si.item(), si.score()))
            .collect(Collectors.toList());
    }

    /**
     * Calculate recommendation score for an item
     */
    private double calculateScore(MenuItem item, UserPreference prefs, String userId) {
        double score = 50.0; // Base score

        // Dietary preference matching (+20 points)
        if (prefs.getDietaryPreferences() != null && item.getTags() != null) {
            long matches = prefs.getDietaryPreferences().stream()
                .filter(pref -> item.getTags().stream()
                    .anyMatch(tag -> tag.toLowerCase().contains(pref.toLowerCase())))
                .count();
            score += matches * 10;
        }

        // Disliked ingredients (-30 points each)
        if (prefs.getDislikedIngredients() != null && item.getDescription() != null) {
            long dislikes = prefs.getDislikedIngredients().stream()
                .filter(ing -> item.getDescription().toLowerCase().contains(ing.toLowerCase()) ||
                              item.getName().toLowerCase().contains(ing.toLowerCase()))
                .count();
            score -= dislikes * 30;
        }

        // Favorite dining halls (+15 points)
        if (prefs.getFavoriteHalls() != null && 
            prefs.getFavoriteHalls().contains(item.getDiningHallId())) {
            score += 15;
        }

        // User's past ratings (+/- based on similar items)
        Double avgRating = getUserAverageRatingForCategory(userId, item.getCategory());
        if (avgRating != null) {
            score += (avgRating - 3) * 10; // Adjust based on how user rates this category
        }

        // Item's overall rating
        Double itemRating = mealRatingRepository.getAverageRatingForMenuItem(item.getId());
        if (itemRating != null) {
            score += itemRating * 5;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Get user's average rating for a category
     */
    private Double getUserAverageRatingForCategory(String userId, String category) {
        List<MealRating> userRatings = mealRatingRepository.findByUserId(userId);
        
        return userRatings.stream()
            .filter(r -> r.getMenuItem() != null && 
                        category.equals(r.getMenuItem().getCategory()))
            .mapToInt(MealRating::getRating)
            .average()
            .orElse(0);
    }

    /**
     * Get popular items when no preferences are set
     */
    private List<RecommendationDTO> getPopularItems(List<MenuItem> items) {
        return items.stream()
            .map(item -> {
                Double rating = mealRatingRepository.getAverageRatingForMenuItem(item.getId());
                long count = mealRatingRepository.countByMenuItemId(item.getId());
                double score = (rating != null ? rating * 10 : 50) + (count * 2);
                return toRecommendationDTO(item, score);
            })
            .sorted(Comparator.comparingDouble(RecommendationDTO::getScore).reversed())
            .limit(10)
            .collect(Collectors.toList());
    }

    /**
     * Determine current meal type based on time
     */
    private MealType getCurrentMealType() {
        LocalTime now = LocalTime.now();
        
        if (now.isBefore(LocalTime.of(10, 30))) {
            return MealType.BREAKFAST;
        } else if (now.isBefore(LocalTime.of(16, 30))) {
            return MealType.LUNCH;
        } else {
            return MealType.DINNER;
        }
    }

    /**
     * Convert to DTO
     */
    private RecommendationDTO toRecommendationDTO(MenuItem item, double score) {
        return RecommendationDTO.builder()
            .id(item.getId())
            .name(item.getName())
            .description(item.getDescription())
            .diningHallId(item.getDiningHallId())
            .diningHallName(item.getDiningHall() != null ? item.getDiningHall().getName() : null)
            .mealType(item.getMealType().name().toLowerCase())
            .category(item.getCategory())
            .calories(item.getCalories())
            .protein(item.getProtein())
            .tags(item.getTags())
            .score(score)
            .reason(generateRecommendationReason(score))
            .build();
    }

    /**
     * Generate human-readable recommendation reason
     */
    private String generateRecommendationReason(double score) {
        if (score >= 80) return "Highly recommended based on your preferences";
        if (score >= 60) return "Good match for your dietary preferences";
        if (score >= 40) return "Popular choice at this dining hall";
        return "Available option";
    }

    // Helper record for scoring
    private record ScoredItem(MenuItem item, double score) {}
}
