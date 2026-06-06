package com.aptisfullstack.domain;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @Entity
public class PasswordResetOtp {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String email;
  @Column(nullable = false) private String otp;
  @Column(nullable = false) private Instant expiresAt;
  private boolean used;
}
