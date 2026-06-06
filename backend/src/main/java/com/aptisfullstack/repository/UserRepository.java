package com.aptisfullstack.repository;

import com.aptisfullstack.domain.User;
import com.aptisfullstack.domain.Enums.*;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
  boolean existsByEmail(String email);
  long countByCreatedAtBetween(Instant start, Instant end);
  long countByRole(Role role);
  long countByStatus(UserStatus status);
}
