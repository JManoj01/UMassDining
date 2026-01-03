package edu.umass.dining.service;

import edu.umass.dining.dto.UserPreferenceDTO;
import edu.umass.dining.model.User;
import edu.umass.dining.model.UserPreference;
import edu.umass.dining.repository.UserPreferenceRepository;
import edu.umass.dining.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserPreferenceService {
    private final UserPreferenceRepository userPreferenceRepository;
    private final UserRepository userRepository;

    public UserPreferenceDTO getPreferences(String email) {
        User user = userRepository.findByEmail(email);
        UserPreference pref = userPreferenceRepository.findByUser(user);
        if (pref == null) return null;
        return toDTO(pref);
    }

    public void savePreferences(String email, UserPreferenceDTO dto) {
        User user = userRepository.findByEmail(email);
        UserPreference pref = userPreferenceRepository.findByUser(user);
        if (pref == null) {
            pref = UserPreference.builder()
                    .user(user)
                    .vegetarian(dto.isVegetarian())
                    .vegan(dto.isVegan())
                    .glutenFree(dto.isGlutenFree())
                    .dairyFree(dto.isDairyFree())
                    .favoriteDiningHalls(dto.getFavoriteDiningHalls())
                    .dislikedIngredients(dto.getDislikedIngredients())
                    .build();
        } else {
            pref.setVegetarian(dto.isVegetarian());
            pref.setVegan(dto.isVegan());
            pref.setGlutenFree(dto.isGlutenFree());
            pref.setDairyFree(dto.isDairyFree());
            pref.setFavoriteDiningHalls(dto.getFavoriteDiningHalls());
            pref.setDislikedIngredients(dto.getDislikedIngredients());
        }
        userPreferenceRepository.save(pref);
    }

    private UserPreferenceDTO toDTO(UserPreference pref) {
        return UserPreferenceDTO.builder()
                .vegetarian(pref.isVegetarian())
                .vegan(pref.isVegan())
                .glutenFree(pref.isGlutenFree())
                .dairyFree(pref.isDairyFree())
                .favoriteDiningHalls(pref.getFavoriteDiningHalls())
                .dislikedIngredients(pref.getDislikedIngredients())
                .build();
    }
}
