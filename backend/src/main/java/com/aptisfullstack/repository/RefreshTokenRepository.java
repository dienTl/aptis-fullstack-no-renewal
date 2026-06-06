package com.aptisfullstack.repository;

import com.aptisfullstack.domain.RefreshToken;
import com.aptisfullstack.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
  Optional<RefreshToken> findByToken(String token);
  void deleteByUser(User user);
}
