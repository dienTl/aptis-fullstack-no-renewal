package com.aptisfullstack.service;

import com.aptisfullstack.domain.*;
import com.aptisfullstack.dto.Dto.*;
import java.util.List;

public final class Mapper {
  private Mapper() {}
  public static UserResponse user(User u) {
    return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getAvatar(), u.getStatus());
  }
  public static QuestionResponse question(Question q) {
    return new QuestionResponse(q.getId(), q.getContent(), q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD(), q.getOptionE(), q.getOptionF(), q.getAudioUrl(), q.getImageUrl(), q.getImageUrl2(), q.getScriptText(), q.getCorrectAnswer(), q.getExplanation(), q.getQuestionType());
  }
  public static QuestionResponse practiceQuestion(PracticeQuestion q) {
    return new QuestionResponse(q.getId(), q.getContent(), q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD(), q.getOptionE(), q.getOptionF(), q.getAudioUrl(), q.getImageUrl(), q.getImageUrl2(), q.getScriptText(), q.getCorrectAnswer(), q.getExplanation(), q.getQuestionType());
  }
  public static ExamResponse exam(Exam e) {
    List<QuestionResponse> questions = e.getQuestions() == null ? List.of() : e.getQuestions().stream().map(Mapper::question).toList();
    return new ExamResponse(e.getId(), e.getTitle(), e.getType(), e.getDuration(), e.getTranscript(), e.getAudioUrl(), e.getPrompt(), questions);
  }
  public static PracticeExamResponse practiceExam(PracticeExam e) {
    List<QuestionResponse> questions = e.getQuestions() == null ? List.of() : e.getQuestions().stream().map(Mapper::practiceQuestion).toList();
    return new PracticeExamResponse(e.getId(), e.getTitle(), e.getType(), e.getDuration(), e.getTranscript(), e.getAudioUrl(), e.getPrompt(), questions);
  }
  public static ExamResultResponse result(ExamResult r) {
    return new ExamResultResponse(r.getId(), r.getExam().getId(), r.getExam().getTitle(), r.getScore(), r.getCefrLevel(), r.getTotalCorrect(), r.getTotalQuestions(), r.getTimeSpentSeconds(), r.getAiFeedback(), r.getSubmittedAt());
  }
  public static ReviewResponse review(ExamReview r) {
    return new ReviewResponse(r.getId(), r.getTitle(), r.getContent(), r.getStatus(), r.getReviewDate(), r.getCreatedAt(), user(r.getUser()));
  }
}
