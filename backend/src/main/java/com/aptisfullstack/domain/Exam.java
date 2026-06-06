package com.aptisfullstack.domain;

import static com.aptisfullstack.domain.Enums.*;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder @Entity
public class Exam {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false) private String title;
  @Enumerated(EnumType.STRING) @Column(nullable = false, columnDefinition = "varchar(32)") private ExamType type;
  private Integer duration;
  private String transcript;
  private String audioUrl;
  @Column(length = 4000) private String prompt;
  private Instant createdAt;
  @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("id asc")
  @Builder.Default
  private List<Question> questions = new ArrayList<>();
  @PrePersist void prePersist() { createdAt = Instant.now(); }
}
