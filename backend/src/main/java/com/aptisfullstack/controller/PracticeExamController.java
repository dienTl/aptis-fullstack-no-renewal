package com.aptisfullstack.controller;

import com.aptisfullstack.domain.Enums.ExamType;
import com.aptisfullstack.dto.Dto.*;
import com.aptisfullstack.service.PracticeExamService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class PracticeExamController {
  private final PracticeExamService practice;

  @GetMapping("/practice-exams") ApiResponse<List<PracticeExamResponse>> list(@RequestParam(required = false) ExamType type) {
    return ApiResponse.ok(practice.list(type));
  }
  @GetMapping("/practice-exams/{id}") ApiResponse<PracticeExamResponse> one(@PathVariable Long id) {
    return ApiResponse.ok(practice.one(id));
  }
  @PostMapping("/practice-exams/speaking/generate") ApiResponse<PracticeExamResponse> generateSpeaking() {
    return ApiResponse.ok(practice.generateSpeaking());
  }
  @GetMapping("/admin/practice-exams") ApiResponse<List<PracticeExamResponse>> adminList() {
    return ApiResponse.ok(practice.list(null));
  }
  @PostMapping("/admin/practice-exams") ApiResponse<PracticeExamResponse> create(@Valid @RequestBody PracticeExamRequest r) {
    return ApiResponse.ok(practice.create(r));
  }
  @PutMapping("/admin/practice-exams/{id}") ApiResponse<PracticeExamResponse> update(@PathVariable Long id, @Valid @RequestBody PracticeExamRequest r) {
    return ApiResponse.ok(practice.update(id, r));
  }
  @DeleteMapping("/admin/practice-exams/{id}") ApiResponse<Void> delete(@PathVariable Long id) {
    practice.delete(id);
    return ApiResponse.message("Practice exam deleted");
  }
  @PostMapping("/admin/practice-exams/{id}/questions") ApiResponse<QuestionResponse> addQuestion(@PathVariable Long id, @Valid @RequestBody QuestionRequest r) {
    return ApiResponse.ok(practice.addQuestion(id, r));
  }
  @PutMapping("/admin/practice-questions/{id}") ApiResponse<QuestionResponse> updateQuestion(@PathVariable Long id, @Valid @RequestBody QuestionRequest r) {
    return ApiResponse.ok(practice.updateQuestion(id, r));
  }
  @DeleteMapping("/admin/practice-questions/{id}") ApiResponse<Void> deleteQuestion(@PathVariable Long id) {
    practice.deleteQuestion(id);
    return ApiResponse.message("Practice question deleted");
  }
}
