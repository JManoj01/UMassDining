package edu.umass.dining.repository;

import edu.umass.dining.model.MenuItem;
import edu.umass.dining.model.DiningHall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByDateAndDiningHall(String date, DiningHall diningHall);
    List<MenuItem> findByDate(String date);
}
