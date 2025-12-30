package com.umassdining.service;

import com.umassdining.model.MenuItem;
import com.umassdining.enums.MealType;
import com.umassdining.repository.MenuItemRepository;
import com.umassdining.dto.MenuItemDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    /**
     * Get all menu items for today
     */
    public List<MenuItemDTO> getTodaysMenu() {
        return menuItemRepository.findByMenuDate(LocalDate.now())
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get menu items with filters
     */
    public List<MenuItemDTO> getMenuItems(LocalDate date, String diningHallId, MealType mealType) {
        List<MenuItem> items;

        if (diningHallId != null && mealType != null) {
            items = menuItemRepository.findByMenuDateAndDiningHallIdAndMealType(date, diningHallId, mealType);
        } else if (diningHallId != null) {
            items = menuItemRepository.findByMenuDateAndDiningHallId(date, diningHallId);
        } else if (mealType != null) {
            items = menuItemRepository.findByMenuDateAndMealType(date, mealType);
        } else {
            items = menuItemRepository.findByMenuDate(date);
        }

        return items.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Search menu items by name
     */
    public List<MenuItemDTO> searchMenu(String query) {
        return menuItemRepository.searchByName(LocalDate.now(), query)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get menu items matching dietary preferences
     */
    public List<MenuItemDTO> getFilteredMenu(List<String> dietaryTags, List<String> excludeTags) {
        LocalDate today = LocalDate.now();
        List<MenuItem> items;

        if (excludeTags != null && !excludeTags.isEmpty()) {
            items = menuItemRepository.findByMenuDateExcludingTags(today, excludeTags);
        } else if (dietaryTags != null && !dietaryTags.isEmpty()) {
            items = menuItemRepository.findByMenuDateAndTagsIn(today, dietaryTags);
        } else {
            items = menuItemRepository.findByMenuDate(today);
        }

        return items.stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Save menu items from scraping
     */
    @Transactional
    public void saveMenuItems(List<MenuItem> items) {
        menuItemRepository.saveAll(items);
    }

    /**
     * Check if menu exists for a date
     */
    public boolean menuExistsForDate(LocalDate date) {
        return menuItemRepository.existsByMenuDate(date);
    }

    /**
     * Clean up old menus
     */
    @Transactional
    public void deleteOldMenus(int daysToKeep) {
        LocalDate cutoffDate = LocalDate.now().minusDays(daysToKeep);
        menuItemRepository.deleteByMenuDateBefore(cutoffDate);
    }

    /**
     * Convert entity to DTO
     */
    private MenuItemDTO toDTO(MenuItem item) {
        return MenuItemDTO.builder()
            .id(item.getId())
            .name(item.getName())
            .description(item.getDescription())
            .diningHallId(item.getDiningHallId())
            .diningHallName(item.getDiningHall() != null ? item.getDiningHall().getName() : null)
            .mealType(item.getMealType().name().toLowerCase())
            .menuDate(item.getMenuDate())
            .category(item.getCategory())
            .calories(item.getCalories())
            .protein(item.getProtein())
            .carbs(item.getCarbs())
            .fat(item.getFat())
            .tags(item.getTags())
            .build();
    }
}
