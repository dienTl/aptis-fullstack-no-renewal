package com.aptisfullstack.domain;

import static com.aptisfullstack.domain.Enums.*;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @Entity
public class Lesson {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String title;
  @Enumerated(EnumType.STRING) @Column(columnDefinition = "varchar(32)") private ExamType type;
  @Column(length = 10000) private String content;
  private Instant createdAt;
  @PrePersist void prePersist() { createdAt = Instant.now(); }
}
