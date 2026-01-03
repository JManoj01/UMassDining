package edu.umass.dining.repository;

import edu.umass.dining.model.UserPreference;
import edu.umass.dining.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {
    UserPreference findByUser(User user);
}
