package com.umassdining.controller;

import com.umassdining.dto.RecommendationDTO;
import com.umassdining.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * GET /api/recommendations
     * Get personalized meal recommendations for the authenticated user
     * 
     * Returns top 10 recommended menu items based on:
     * - User's dietary preferences
     * - Disliked ingredients
     * - Favorite dining halls
     * - Past ratings
     * - Current meal time (breakfast/lunch/dinner)
     */
    @GetMapping
    public ResponseEntity<List<RecommendationDTO>> getRecommendations(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String userId = userDetails.getUsername(); // Or extract from JWT
        List<RecommendationDTO> recommendations = recommendationService.getRecommendations(userId);
        return ResponseEntity.ok(recommendations);
    }

    /**
     * GET /api/recommendations/guest
     * Get popular recommendations for non-authenticated users
     * Based on overall ratings and popularity
     */
    @GetMapping("/guest")
    public ResponseEntity<List<RecommendationDTO>> getGuestRecommendations() {
        List<RecommendationDTO> recommendations = recommendationService.getRecommendations(null);
        return ResponseEntity.ok(recommendations);
    }
}
