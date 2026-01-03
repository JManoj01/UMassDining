package edu.umass.dining.repository;

import edu.umass.dining.model.MealRating;
import edu.umass.dining.model.User;
import edu.umass.dining.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MealRatingRepository extends JpaRepository<MealRating, Long> {
    List<MealRating> findByUser(User user);
    List<MealRating> findByMenuItem(MenuItem menuItem);
}
