package com.umassdining.controller;

import com.umassdining.dto.UserPreferenceDTO;
import com.umassdining.service.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserPreferenceController {

    private final UserPreferenceService userPreferenceService;

    /**
     * GET /api/preferences
     * Get current user's preferences
     */
    @GetMapping
    public ResponseEntity<UserPreferenceDTO> getPreferences(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String userId = userDetails.getUsername();
        return userPreferenceService.getPreferences(userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/preferences
     * Create or update user preferences
     */
    @PostMapping
    public ResponseEntity<UserPreferenceDTO> savePreferences(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserPreferenceDTO preferenceDTO) {
        
        String userId = userDetails.getUsername();
        UserPreferenceDTO saved = userPreferenceService.savePreferences(userId, preferenceDTO);
        return ResponseEntity.ok(saved);
    }

    /**
     * DELETE /api/preferences
     * Delete user preferences
     */
    @DeleteMapping
    public ResponseEntity<Void> deletePreferences(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String userId = userDetails.getUsername();
        userPreferenceService.deletePreferences(userId);
        return ResponseEntity.noContent().build();
    }
}
