package com.aptisfullstack.repository;

import com.aptisfullstack.domain.Exam;
import com.aptisfullstack.domain.Enums.ExamType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRepository extends JpaRepository<Exam, Long> {
  List<Exam> findByType(ExamType type);
}
