package com.aptisfullstack.repository;

import com.aptisfullstack.domain.PracticeExam;
import com.aptisfullstack.domain.Enums.ExamType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PracticeExamRepository extends JpaRepository<PracticeExam, Long> {
  List<PracticeExam> findByType(ExamType type);
}
