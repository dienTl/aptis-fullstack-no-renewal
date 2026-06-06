package com.aptisfullstack.repository;

import com.aptisfullstack.domain.ExamReview;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamReviewRepository extends JpaRepository<ExamReview, Long> {
  List<ExamReview> findAllByOrderByReviewDateDescCreatedAtDesc();
  List<ExamReview> findByReviewDateOrderByCreatedAtDesc(LocalDate reviewDate);
}
