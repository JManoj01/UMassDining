package edu.umass.dining.repository;

import edu.umass.dining.model.DiningHall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiningHallRepository extends JpaRepository<DiningHall, Long> {
    DiningHall findByName(String name);
}
