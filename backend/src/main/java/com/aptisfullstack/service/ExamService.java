package com.aptisfullstack.service;

import static com.aptisfullstack.domain.Enums.*;
import com.aptisfullstack.domain.*;
import com.aptisfullstack.dto.Dto.*;
import com.aptisfullstack.exception.ApiException;
import com.aptisfullstack.repository.*;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service @RequiredArgsConstructor
public class ExamService {
  private final ExamRepository exams;
  private final QuestionRepository questions;
  private final ExamResultRepository results;
  private final UserService users;
  private final AiScoringService ai;

  @Transactional(readOnly = true)
  public List<ExamResponse> list(ExamType type) {
    users.requireActiveSubscription();
    List<Exam> data = type == null ? exams.findAll() : exams.findByType(type);
    return data.stream().map(Mapper::exam).toList();
  }

  @Transactional(readOnly = true)
  public ExamResponse one(Long id) {
    users.requireActiveSubscription();
    return Mapper.exam(exams.findById(id).orElseThrow(() -> ApiException.notFound("Exam not found")));
  }

  public ExamResponse create(ExamRequest r) {
    Exam exam = Exam.builder().title(r.title()).type(r.type()).duration(r.duration())
        .transcript(r.transcript()).audioUrl(r.audioUrl()).prompt(r.prompt()).build();
    return Mapper.exam(exams.save(exam));
  }

  public ExamResponse update(Long id, ExamRequest r) {
    Exam exam = exams.findById(id).orElseThrow(() -> ApiException.notFound("Exam not found"));
    exam.setTitle(r.title());
    exam.setType(r.type());
    exam.setDuration(r.duration());
    exam.setTranscript(r.transcript());
    exam.setAudioUrl(r.audioUrl());
    exam.setPrompt(r.prompt());
    return Mapper.exam(exams.save(exam));
  }

  @Transactional
  public void delete(Long id) {
    if (!exams.existsById(id)) throw ApiException.notFound("Exam not found");
    results.deleteByExamId(id);
    exams.deleteById(id);
  }

  public QuestionResponse addQuestion(Long examId, QuestionRequest r) {
    Exam exam = exams.findById(examId).orElseThrow(() -> ApiException.notFound("Exam not found"));
    Question q = Question.builder().exam(exam).content(r.content()).optionA(r.optionA()).optionB(r.optionB())
        .optionC(r.optionC()).optionD(r.optionD()).optionE(r.optionE()).optionF(r.optionF())
        .audioUrl(r.audioUrl()).imageUrl(r.imageUrl()).imageUrl2(r.imageUrl2()).scriptText(r.scriptText()).correctAnswer(r.correctAnswer()).explanation(r.explanation())
        .questionType(r.questionType() == null ? QuestionType.MULTIPLE_CHOICE : r.questionType()).build();
    return Mapper.question(questions.save(q));
  }

  @Transactional
  public QuestionImportResponse importQuestions(Long examId, MultipartFile file) {
    if (file == null || file.isEmpty()) throw ApiException.bad("CSV file is required");
    Exam exam = exams.findById(examId).orElseThrow(() -> ApiException.notFound("Exam not found"));
    List<String> errors = new ArrayList<>();
    List<Question> imported = new ArrayList<>();
    List<List<String>> rows = parseCsv(file);

    for (int i = 0; i < rows.size(); i++) {
      List<String> row = rows.get(i);
      int line = i + 1;
      if (row.stream().allMatch(String::isBlank)) continue;
      if (line == 1 && !row.isEmpty() && "content".equalsIgnoreCase(row.get(0).trim())) continue;
      if (row.isEmpty() || row.get(0).isBlank()) {
        errors.add("Line " + line + ": content is required");
        continue;
      }
      try {
        imported.add(Question.builder()
            .exam(exam)
            .content(value(row, 0))
            .optionA(value(row, 1))
            .optionB(value(row, 2))
            .optionC(value(row, 3))
            .optionD(value(row, 4))
            .optionE(value(row, 5))
            .optionF(value(row, 6))
            .audioUrl(value(row, 7))
            .scriptText(value(row, 8))
            .correctAnswer(value(row, 9))
            .explanation(value(row, 10))
            .questionType(questionType(value(row, 11), line))
            .build());
      } catch (IllegalArgumentException ex) {
        errors.add(ex.getMessage());
      }
    }

    if (!imported.isEmpty()) questions.saveAll(imported);
    return new QuestionImportResponse(imported.size(), errors);
  }

  private List<List<String>> parseCsv(MultipartFile file) {
    try {
      String text = new String(file.getBytes(), StandardCharsets.UTF_8);
      List<List<String>> rows = new ArrayList<>();
      List<String> row = new ArrayList<>();
      StringBuilder cell = new StringBuilder();
      boolean quoted = false;
      for (int i = 0; i < text.length(); i++) {
        char c = text.charAt(i);
        if (c == '"') {
          if (quoted && i + 1 < text.length() && text.charAt(i + 1) == '"') {
            cell.append('"');
            i++;
          } else {
            quoted = !quoted;
          }
        } else if (c == ',' && !quoted) {
          row.add(cell.toString().trim());
          cell.setLength(0);
        } else if ((c == '\n' || c == '\r') && !quoted) {
          if (c == '\r' && i + 1 < text.length() && text.charAt(i + 1) == '\n') i++;
          row.add(cell.toString().trim());
          rows.add(row);
          row = new ArrayList<>();
          cell.setLength(0);
        } else {
          cell.append(c);
        }
      }
      row.add(cell.toString().trim());
      rows.add(row);
      return rows;
    } catch (IOException ex) {
      throw ApiException.bad("Cannot read CSV file");
    }
  }

  private String value(List<String> row, int index) {
    if (index >= row.size()) return null;
    String value = row.get(index).trim();
    return value.isBlank() ? null : value;
  }

  private QuestionType questionType(String value, int line) {
    if (value == null || value.isBlank()) return QuestionType.MULTIPLE_CHOICE;
    try {
      return QuestionType.valueOf(value.trim().toUpperCase());
    } catch (IllegalArgumentException ex) {
      throw new IllegalArgumentException("Line " + line + ": questionType must be MULTIPLE_CHOICE, LISTENING_AUDIO, ESSAY, SPEAKING_PROMPT, SPEAKING_IMAGE_TABLE, SPEAKING_COMPARE_IMAGES, SPEAKING_PART4_LIST, PARAGRAPH_ORDER, MATCHING_DROPDOWN, OPINION_MATCH, INLINE_DROPDOWN, or PASSAGE_MATCH");
    }
  }

  public QuestionResponse updateQuestion(Long questionId, QuestionRequest r) {
    Question q = questions.findById(questionId).orElseThrow(() -> ApiException.notFound("Question not found"));
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
    return Mapper.question(questions.save(q));
  }

  public void deleteQuestion(Long questionId) {
    if (!questions.existsById(questionId)) throw ApiException.notFound("Question not found");
    questions.deleteById(questionId);
  }

  @Transactional
  public ExamResultResponse submit(Long examId, SubmitExamRequest r) {
    users.requireActiveSubscription();
    Exam exam = exams.findById(examId).orElseThrow(() -> ApiException.notFound("Exam not found"));
    int total = exam.getQuestions().size();
    int correct = 0;
    if (r.answers() != null) {
      for (Question q : exam.getQuestions()) {
        String answer = r.answers().get(q.getId());
        if (answer != null && q.getCorrectAnswer() != null && normalizeAnswer(answer).equals(normalizeAnswer(q.getCorrectAnswer()))) correct++;
      }
    }
    double score = total == 0 ? 0 : correct * 100.0 / total;
    String cefrLevel = null;
    String feedback = null;
    if (exam.getType() == ExamType.READING || exam.getType() == ExamType.LISTENING) {
      score = ai.objectiveScaleScore(correct, total);
      cefrLevel = ai.cefrLevel(exam.getType(), score);
      feedback = "Aptis General scale score " + Math.round(score) + "/50; CEFR " + cefrLevel + ". Raw correct: " + correct + "/" + total + ".";
    }
    if (exam.getType() == ExamType.WRITING) {
      var f = ai.writing(r.essayText());
      score = f.score();
      cefrLevel = ai.cefrLevel(exam.getType(), score);
      feedback = f.toString();
    }
    if (exam.getType() == ExamType.SPEAKING) {
      var f = ai.speaking(r.recordingUrl());
      score = f.score();
      cefrLevel = ai.cefrLevel(exam.getType(), score);
      feedback = f.toString();
    }
    ExamResult result = results.save(ExamResult.builder().user(users.current()).exam(exam).score(score)
        .cefrLevel(cefrLevel).totalCorrect(correct).totalQuestions(total).timeSpentSeconds(r.timeSpentSeconds()).aiFeedback(feedback).build());
    return Mapper.result(result);
  }

  public List<ExamResultResponse> history() {
    return results.findByUserIdOrderBySubmittedAtDesc(users.current().getId()).stream().map(Mapper::result).toList();
  }

  private String normalizeAnswer(String value) {
    return value == null ? "" : value.replaceAll("\\s+", "").toUpperCase();
  }
}
