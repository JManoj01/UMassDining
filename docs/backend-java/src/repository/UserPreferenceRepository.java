package com.umassdining.repository;

import com.umassdining.model.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, String> {

    // Find preferences by user ID
    Optional<UserPreference> findByUserId(String userId);

    // Check if user has preferences
    boolean existsByUserId(String userId);

    // Delete preferences for a user
    void deleteByUserId(String userId);
}
