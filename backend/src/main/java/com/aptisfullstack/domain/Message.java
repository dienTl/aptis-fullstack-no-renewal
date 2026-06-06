package com.aptisfullstack.domain;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @Entity
public class Message {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(optional = false) private User sender;
  @ManyToOne(optional = false) private User receiver;
  @Column(nullable = false, length = 4000) private String content;
  private Instant createdAt;
  @PrePersist void prePersist() { createdAt = Instant.now(); }
}
