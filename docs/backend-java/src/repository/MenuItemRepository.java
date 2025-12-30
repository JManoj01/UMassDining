package com.umassdining.repository;

import com.umassdining.model.MenuItem;
import com.umassdining.enums.MealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, String> {

    // Find all menu items for a specific date
    List<MenuItem> findByMenuDate(LocalDate date);

    // Find menu items by date and dining hall
    List<MenuItem> findByMenuDateAndDiningHallId(LocalDate date, String diningHallId);

    // Find menu items by date and meal type
    List<MenuItem> findByMenuDateAndMealType(LocalDate date, MealType mealType);

    // Find menu items by date, hall, and meal type
    List<MenuItem> findByMenuDateAndDiningHallIdAndMealType(
        LocalDate date, 
        String diningHallId, 
        MealType mealType
    );

    // Find menu items with specific tags
    @Query("SELECT m FROM MenuItem m JOIN m.tags t WHERE m.menuDate = :date AND t IN :tags")
    List<MenuItem> findByMenuDateAndTagsIn(
        @Param("date") LocalDate date, 
        @Param("tags") List<String> tags
    );

    // Find menu items excluding certain tags (for dietary restrictions)
    @Query("SELECT DISTINCT m FROM MenuItem m WHERE m.menuDate = :date " +
           "AND NOT EXISTS (SELECT t FROM m.tags t WHERE t IN :excludeTags)")
    List<MenuItem> findByMenuDateExcludingTags(
        @Param("date") LocalDate date, 
        @Param("excludeTags") List<String> excludeTags
    );

    // Search menu items by name
    @Query("SELECT m FROM MenuItem m WHERE m.menuDate = :date " +
           "AND LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<MenuItem> searchByName(
        @Param("date") LocalDate date, 
        @Param("search") String search
    );

    // Get distinct categories for a date
    @Query("SELECT DISTINCT m.category FROM MenuItem m WHERE m.menuDate = :date")
    List<String> findDistinctCategoriesByDate(@Param("date") LocalDate date);

    // Check if menu exists for a date
    boolean existsByMenuDate(LocalDate date);

    // Delete old menus (for cleanup)
    void deleteByMenuDateBefore(LocalDate date);
}
