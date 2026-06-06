package com.aptisfullstack.domain;

import static com.aptisfullstack.domain.Enums.*;
import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @Entity
public class Question {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @ManyToOne(optional = false) private Exam exam;
  @Enumerated(EnumType.STRING) @Column(columnDefinition = "varchar(32)") private QuestionType questionType;
  @Column(nullable = false, length = 4000) private String content;
  @Column(columnDefinition = "TEXT") private String optionA;
  @Column(columnDefinition = "TEXT") private String optionB;
  @Column(columnDefinition = "TEXT") private String optionC;
  @Column(columnDefinition = "TEXT") private String optionD;
  @Column(columnDefinition = "TEXT") private String optionE;
  @Column(columnDefinition = "TEXT") private String optionF;
  private String audioUrl;
  @Column(length = 1000) private String imageUrl;
  @Column(length = 1000) private String imageUrl2;
  @Column(length = 4000) private String scriptText;
  @Column(columnDefinition = "TEXT") private String correctAnswer;
  @Column(length = 4000) private String explanation;
}
