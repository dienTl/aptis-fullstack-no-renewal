package com.aptisfullstack.repository;

import com.aptisfullstack.domain.ExamResult;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.*;

public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
  List<ExamResult> findByUserIdOrderBySubmittedAtDesc(Long userId);
  void deleteByExamId(Long examId);
  long countBySubmittedAtBetween(Instant from, Instant to);
  @Query("select r.user.fullName, count(r) from ExamResult r group by r.user.id, r.user.fullName order by count(r) desc")
  List<Object[]> topLearners();
}
