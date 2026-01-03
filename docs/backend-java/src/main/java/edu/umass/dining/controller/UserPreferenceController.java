package edu.umass.dining.controller;

import edu.umass.dining.dto.UserPreferenceDTO;
import edu.umass.dining.service.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class UserPreferenceController {
    private final UserPreferenceService userPreferenceService;

    @GetMapping
    public UserPreferenceDTO getPreferences(@RequestParam String email) {
        return userPreferenceService.getPreferences(email);
    }

    @PostMapping
    public void savePreferences(@RequestParam String email, @RequestBody UserPreferenceDTO dto) {
        userPreferenceService.savePreferences(email, dto);
    }
}
