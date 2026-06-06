package com.aptisfullstack.domain;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @Entity
public class ExamResult {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(optional = false) private User user;
  @ManyToOne(optional = false) private Exam exam;
  private double score;
  private String cefrLevel;
  private int totalCorrect;
  private int totalQuestions;
  private Integer timeSpentSeconds;
  @Column(length = 4000) private String aiFeedback;
  private Instant submittedAt;
  @PrePersist void prePersist() { submittedAt = Instant.now(); }
}
