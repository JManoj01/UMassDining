package com.umassdining.service;

import com.umassdining.dto.UserPreferenceDTO;
import com.umassdining.model.UserPreference;
import com.umassdining.repository.UserPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserPreferenceService {

    private final UserPreferenceRepository userPreferenceRepository;

    public Optional<UserPreferenceDTO> getPreferences(UUID userId) {
        return userPreferenceRepository.findByUserId(userId)
            .map(this::toDTO);
    }

    @Transactional
    public UserPreferenceDTO savePreferences(UUID userId, UserPreferenceDTO dto) {
        UserPreference preference = userPreferenceRepository.findByUserId(userId)
            .orElse(new UserPreference());

        preference.setUserId(userId);
        preference.setDietaryPreferences(dto.getDietaryPreferences());
        preference.setDislikedIngredients(dto.getDislikedIngredients());
        preference.setFavoriteHalls(dto.getFavoriteHalls());

        UserPreference saved = userPreferenceRepository.save(preference);
        return toDTO(saved);
    }

    private UserPreferenceDTO toDTO(UserPreference pref) {
        return UserPreferenceDTO.builder()
            .userId(pref.getUserId().toString())
            .dietaryPreferences(pref.getDietaryPreferences())
            .dislikedIngredients(pref.getDislikedIngredients())
            .favoriteHalls(pref.getFavoriteHalls())
            .build();
    }
}
