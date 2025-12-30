package com.umassdining.repository;

import com.umassdining.model.MealRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MealRatingRepository extends JpaRepository<MealRating, String> {

    // Find all ratings by user
    List<MealRating> findByUserId(String userId);

    // Find rating by user and menu item
    Optional<MealRating> findByUserIdAndMenuItemId(String userId, String menuItemId);

    // Get average rating for a menu item
    @Query("SELECT AVG(r.rating) FROM MealRating r WHERE r.menuItemId = :menuItemId")
    Double getAverageRatingForMenuItem(@Param("menuItemId") String menuItemId);

    // Get all ratings for a menu item
    List<MealRating> findByMenuItemId(String menuItemId);

    // Get user's top-rated items
    @Query("SELECT r FROM MealRating r WHERE r.userId = :userId ORDER BY r.rating DESC")
    List<MealRating> findTopRatedByUser(@Param("userId") String userId);

    // Get count of ratings for a menu item
    long countByMenuItemId(String menuItemId);
}
