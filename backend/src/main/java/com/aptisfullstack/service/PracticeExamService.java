package com.aptisfullstack.service;

import static com.aptisfullstack.domain.Enums.*;
import com.aptisfullstack.domain.*;
import com.aptisfullstack.dto.Dto.*;
import com.aptisfullstack.exception.ApiException;
import com.aptisfullstack.repository.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class PracticeExamService {
  private final PracticeExamRepository exams;
  private final PracticeQuestionRepository questions;
  private final UserService users;
  private static final String GENERATED_SPEAKING_PREFIX = "Speaking Practice - ";

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

  @Transactional
  public PracticeExamResponse generateSpeaking() {
    users.requireActiveSubscription();
    List<PracticeQuestion> part1 = pickQuestions(questions.findReusableSpeakingQuestions(ExamType.SPEAKING, "SPEAKING_Q1_LIST", GENERATED_SPEAKING_PREFIX), 13, "Speaking Part 1");
    List<PracticeQuestion> part2 = pickQuestions(questions.findReusableSpeakingQuestions(ExamType.SPEAKING, "SPEAKING_IMAGE_LIST", GENERATED_SPEAKING_PREFIX), 1, "Speaking Part 2");
    List<PracticeQuestion> part3 = pickQuestions(questions.findReusableSpeakingQuestions(ExamType.SPEAKING, "SPEAKING_COMPARE_LIST", GENERATED_SPEAKING_PREFIX), 1, "Speaking Part 3");
    List<PracticeQuestion> part4 = pickQuestions(questions.findReusableSpeakingQuestions(ExamType.SPEAKING, QuestionType.SPEAKING_PART4_LIST, GENERATED_SPEAKING_PREFIX), 1, "Speaking Part 4");

    PracticeExam exam = exams.save(PracticeExam.builder()
        .title(GENERATED_SPEAKING_PREFIX + Instant.now())
        .type(ExamType.SPEAKING)
        .duration(12)
        .prompt("Auto-generated Speaking practice: 13 Part 1 questions, 1 Part 2 question, 1 Part 3 question, 1 Part 4 question.")
        .build());
    List<PracticeQuestion> cloned = new ArrayList<>();
    part1.forEach((source) -> cloned.add(copyQuestion(source, exam, false)));
    part2.forEach((source) -> cloned.add(copyQuestion(source, exam)));
    part3.forEach((source) -> cloned.add(copyQuestion(source, exam)));
    part4.forEach((source) -> cloned.add(copyQuestion(source, exam)));
    exam.getQuestions().addAll(questions.saveAll(cloned));
    return Mapper.practiceExam(exam);
  }

  private List<PracticeQuestion> pickQuestions(List<PracticeQuestion> pool, int count, String label) {
    if (pool.size() < count) throw ApiException.bad(label + " needs " + count + " question(s), but only has " + pool.size() + ".");
    List<PracticeQuestion> shuffled = new ArrayList<>(pool);
    Collections.shuffle(shuffled);
    return shuffled.subList(0, count);
  }

  private PracticeQuestion copyQuestion(PracticeQuestion source, PracticeExam exam, boolean firstPromptOnly) {
    String content = firstPromptOnly ? firstLine(source.getContent()) : source.getContent();
    return PracticeQuestion.builder()
        .exam(exam)
        .content(content)
        .optionA(source.getOptionA())
        .optionB(firstPromptOnly ? "" : source.getOptionB())
        .optionC(firstPromptOnly ? "" : source.getOptionC())
        .optionD(source.getOptionD())
        .optionE(source.getOptionE())
        .optionF(source.getOptionF())
        .audioUrl(source.getAudioUrl())
        .imageUrl(source.getImageUrl())
        .imageUrl2(source.getImageUrl2())
        .scriptText(source.getScriptText())
        .correctAnswer(source.getCorrectAnswer())
        .explanation(source.getExplanation())
        .questionType(source.getQuestionType())
        .build();
  }

  private PracticeQuestion copyQuestion(PracticeQuestion source, PracticeExam exam) {
    return copyQuestion(source, exam, false);
  }

  private String firstLine(String value) {
    if (value == null) return "";
    return value.lines().map(String::trim).filter((line) -> !line.isBlank()).findFirst().orElse("");
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
