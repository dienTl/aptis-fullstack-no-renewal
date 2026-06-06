package com.aptisfullstack.domain;

import static com.aptisfullstack.domain.Enums.*;
import jakarta.persistence.*;
import java.time.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @Entity
public class ExamReview {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(optional = false) private User user;
  @Column(nullable = false, length = 160) private String title;
  @Column(nullable = false, length = 4000) private String content;
  @Enumerated(EnumType.STRING) private ReviewStatus status;
  private LocalDate reviewDate;
  private Instant createdAt;

  @PrePersist void prePersist() {
    createdAt = Instant.now();
    if (reviewDate == null) reviewDate = LocalDate.now();
    if (status == null) status = ReviewStatus.APPROVED;
  }
}
