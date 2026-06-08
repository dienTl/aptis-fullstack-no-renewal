package com.aptisfullstack.repository;

import com.aptisfullstack.domain.Enums.ExamType;
import com.aptisfullstack.domain.Enums.QuestionType;
import com.aptisfullstack.domain.PracticeQuestion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PracticeQuestionRepository extends JpaRepository<PracticeQuestion, Long> {
  List<PracticeQuestion> findByExamId(Long examId);
  @Query("select q from PracticeQuestion q where q.exam.type = :type and q.optionF = :optionF and q.exam.title not like concat(:titlePrefix, '%')")
  List<PracticeQuestion> findReusableSpeakingQuestions(@Param("type") ExamType type, @Param("optionF") String optionF, @Param("titlePrefix") String titlePrefix);
  @Query("select q from PracticeQuestion q where q.exam.type = :type and q.questionType = :questionType and q.exam.title not like concat(:titlePrefix, '%')")
  List<PracticeQuestion> findReusableSpeakingQuestions(@Param("type") ExamType type, @Param("questionType") QuestionType questionType, @Param("titlePrefix") String titlePrefix);
}
