package com.aptisfullstack.security;

import com.aptisfullstack.domain.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.Date;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  @Value("${app.jwt.secret}") String secret;
  @Value("${app.jwt.access-minutes}") long accessMinutes;
  @Value("${app.jwt.refresh-days}") long refreshDays;

  private SecretKey key() { return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); }
  public String access(User user) { return token(user, Duration.ofMinutes(accessMinutes)); }
  public String refresh(User user) { return token(user, Duration.ofDays(refreshDays)); }

  private String token(User user, Duration ttl) {
    Instant now = Instant.now();
    return Jwts.builder()
        .id(UUID.randomUUID().toString())
        .subject(user.getEmail())
        .claim("uid", user.getId())
        .claim("role", user.getRole().name())
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plus(ttl)))
        .signWith(key())
        .compact();
  }

  public String subject(String token) {
    return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload().getSubject();
  }

  public boolean valid(String token) {
    try { subject(token); return true; } catch (Exception ignored) { return false; }
  }
}
