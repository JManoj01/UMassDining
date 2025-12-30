package com.umassdining.repository;

import com.umassdining.model.DiningHall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiningHallRepository extends JpaRepository<DiningHall, String> {

    // Find by short name
    Optional<DiningHall> findByShortName(String shortName);

    // Find dining halls with specific features
    List<DiningHall> findByFeaturesContaining(String feature);

    // Find by location
    List<DiningHall> findByLocationContainingIgnoreCase(String location);
}
