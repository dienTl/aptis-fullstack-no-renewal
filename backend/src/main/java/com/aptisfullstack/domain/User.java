package com.aptisfullstack.domain;

import static com.aptisfullstack.domain.Enums.*;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "users", indexes = @Index(name = "idx_user_email", columnList = "email", unique = true))
public class User {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String fullName;
  @Column(nullable = false, unique = true) private String email;
  @Column(nullable = false) private String password;
  @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
  private String avatar;
  @Enumerated(EnumType.STRING) @Column(nullable = false) private UserStatus status;
  private Instant createdAt;

  @PrePersist void prePersist() {
    createdAt = Instant.now();
    if (role == null) role = Role.USER;
    if (status == null) status = UserStatus.ACTIVE;
  }
}
