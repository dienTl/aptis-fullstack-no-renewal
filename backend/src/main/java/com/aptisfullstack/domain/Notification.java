package com.aptisfullstack.domain;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @Entity
public class Notification {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String title;
  @Column(nullable = false, length = 4000) private String content;
  @Column(nullable = false) private String targetRole;
  private Instant createdAt;
  @PrePersist void prePersist() {
    createdAt = Instant.now();
    if (targetRole == null || targetRole.isBlank()) targetRole = "ALL";
  }
}
