package edu.umass.dining.controller;

import edu.umass.dining.dto.RecommendationDTO;
import edu.umass.dining.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {
    private final RecommendationService recommendationService;

    @GetMapping
    public List<RecommendationDTO> getRecommendations(@RequestParam String email) {
        return recommendationService.getRecommendations(email);
    }
}
