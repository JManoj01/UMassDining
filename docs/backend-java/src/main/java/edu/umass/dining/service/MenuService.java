package edu.umass.dining.service;

import edu.umass.dining.dto.MenuItemDTO;
import edu.umass.dining.model.DiningHall;
import edu.umass.dining.model.MenuItem;
import edu.umass.dining.repository.DiningHallRepository;
import edu.umass.dining.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuService {
    private final MenuItemRepository menuItemRepository;
    private final DiningHallRepository diningHallRepository;

    @Cacheable(value = "menus", key = "#date + '-' + #hallId")
    public List<MenuItemDTO> getMenus(String date, Long hallId) {
        List<MenuItem> items;
        if (hallId != null) {
            Optional<DiningHall> hall = diningHallRepository.findById(hallId);
            if (hall.isEmpty()) return List.of();
            items = menuItemRepository.findByDateAndDiningHall(date, hall.get());
        } else {
            items = menuItemRepository.findByDate(date);
        }
        return items.stream().map(this::toDTO).collect(Collectors.toList());
    }

    private MenuItemDTO toDTO(MenuItem item) {
        return MenuItemDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .date(item.getDate())
                .mealType(item.getMealType())
                .diningHallId(item.getDiningHall().getId())
                .vegetarian(item.isVegetarian())
                .vegan(item.isVegan())
                .glutenFree(item.isGlutenFree())
                .dairyFree(item.isDairyFree())
                .containsNuts(item.isContainsNuts())
                .containsSoy(item.isContainsSoy())
                .containsShellfish(item.isContainsShellfish())
                .containsEggs(item.isContainsEggs())
                .containsWheat(item.isContainsWheat())
                .containsDairy(item.isContainsDairy())
                .calories(item.getCalories())
                .protein(item.getProtein())
                .carbs(item.getCarbs())
                .fat(item.getFat())
                .build();
    }
}
