package com.aptisfullstack.service;

import static com.aptisfullstack.domain.Enums.*;
import com.aptisfullstack.domain.*;
import com.aptisfullstack.dto.Dto.*;
import com.aptisfullstack.exception.ApiException;
import com.aptisfullstack.repository.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class PracticeExamService {
  private final PracticeExamRepository exams;
  private final PracticeQuestionRepository questions;
  private final UserService users;

  @Transactional(readOnly = true)
  public List<PracticeExamResponse> list(ExamType type) {
    users.requireActiveSubscription();
    List<PracticeExam> data = type == null ? exams.findAll() : exams.findByType(type);
    return data.stream().map(Mapper::practiceExam).toList();
  }

  @Transactional(readOnly = true)
  public PracticeExamResponse one(Long id) {
    users.requireActiveSubscription();
    return Mapper.practiceExam(exams.findById(id).orElseThrow(() -> ApiException.notFound("Practice exam not found")));
  }

  public PracticeExamResponse create(PracticeExamRequest r) {
    PracticeExam exam = PracticeExam.builder().title(r.title()).type(r.type()).duration(r.duration())
        .transcript(r.transcript()).audioUrl(r.audioUrl()).prompt(r.prompt()).build();
    return Mapper.practiceExam(exams.save(exam));
  }

  public PracticeExamResponse update(Long id, PracticeExamRequest r) {
    PracticeExam exam = exams.findById(id).orElseThrow(() -> ApiException.notFound("Practice exam not found"));
    exam.setTitle(r.title());
    exam.setType(r.type());
    exam.setDuration(r.duration());
    exam.setTranscript(r.transcript());
    exam.setAudioUrl(r.audioUrl());
    exam.setPrompt(r.prompt());
    return Mapper.practiceExam(exams.save(exam));
  }

  public void delete(Long id) {
    if (!exams.existsById(id)) throw ApiException.notFound("Practice exam not found");
    exams.deleteById(id);
  }

  public QuestionResponse addQuestion(Long examId, QuestionRequest r) {
    PracticeExam exam = exams.findById(examId).orElseThrow(() -> ApiException.notFound("Practice exam not found"));
    PracticeQuestion q = PracticeQuestion.builder().exam(exam).content(r.content()).optionA(r.optionA()).optionB(r.optionB())
        .optionC(r.optionC()).optionD(r.optionD()).optionE(r.optionE()).optionF(r.optionF())
        .audioUrl(r.audioUrl()).imageUrl(r.imageUrl()).imageUrl2(r.imageUrl2()).scriptText(r.scriptText()).correctAnswer(r.correctAnswer()).explanation(r.explanation())
        .questionType(r.questionType() == null ? QuestionType.MULTIPLE_CHOICE : r.questionType()).build();
    return Mapper.practiceQuestion(questions.save(q));
  }

  public QuestionResponse updateQuestion(Long questionId, QuestionRequest r) {
    PracticeQuestion q = questions.findById(questionId).orElseThrow(() -> ApiException.notFound("Practice question not found"));
    q.setContent(r.content());
    q.setOptionA(r.optionA());
    q.setOptionB(r.optionB());
    q.setOptionC(r.optionC());
    q.setOptionD(r.optionD());
    q.setOptionE(r.optionE());
    q.setOptionF(r.optionF());
    q.setAudioUrl(r.audioUrl());
    q.setImageUrl(r.imageUrl());
    q.setImageUrl2(r.imageUrl2());
    q.setScriptText(r.scriptText());
    q.setCorrectAnswer(r.correctAnswer());
    q.setExplanation(r.explanation());
    q.setQuestionType(r.questionType() == null ? QuestionType.MULTIPLE_CHOICE : r.questionType());
    return Mapper.practiceQuestion(questions.save(q));
  }

  public void deleteQuestion(Long questionId) {
    if (!questions.existsById(questionId)) throw ApiException.notFound("Practice question not found");
    questions.deleteById(questionId);
  }
}
