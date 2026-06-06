package com.aptisfullstack.repository;

import com.aptisfullstack.domain.PracticeQuestion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PracticeQuestionRepository extends JpaRepository<PracticeQuestion, Long> {
  List<PracticeQuestion> findByExamId(Long examId);
}
