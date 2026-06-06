package com.aptisfullstack.domain;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @Entity
public class RefreshToken {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(optional = false) private User user;
  @Column(nullable = false, unique = true, length = 700) private String token;
  @Column(nullable = false) private Instant expiresAt;
}
