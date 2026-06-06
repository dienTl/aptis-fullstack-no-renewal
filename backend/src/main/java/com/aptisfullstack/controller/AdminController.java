package com.aptisfullstack.controller;

import com.aptisfullstack.domain.*;
import com.aptisfullstack.domain.Enums.UserStatus;
import com.aptisfullstack.dto.Dto.*;
import com.aptisfullstack.service.*;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController @RequestMapping("/api/admin") @RequiredArgsConstructor
public class AdminController {
  private final UserService users;
  private final ExamService exams;
  private final ContentService content;
  private final DashboardService dashboard;

  @GetMapping("/users") ApiResponse<List<UserResponse>> users() { return ApiResponse.ok(users.all()); }
  @PatchMapping("/users/{id}/status") ApiResponse<UserResponse> status(@PathVariable Long id, @RequestParam UserStatus status) { return ApiResponse.ok(users.status(id, status)); }
  @GetMapping("/exams") ApiResponse<List<ExamResponse>> exams() { return ApiResponse.ok(exams.list(null)); }
  @PostMapping("/exams") ApiResponse<ExamResponse> createExam(@Valid @RequestBody ExamRequest r) { return ApiResponse.ok(exams.create(r)); }
  @PutMapping("/exams/{id}") ApiResponse<ExamResponse> updateExam(@PathVariable Long id, @Valid @RequestBody ExamRequest r) { return ApiResponse.ok(exams.update(id, r)); }
  @DeleteMapping("/exams/{id}") ApiResponse<Void> deleteExam(@PathVariable Long id) { exams.delete(id); return ApiResponse.message("Exam deleted"); }
  @PostMapping("/exams/{id}/questions") ApiResponse<QuestionResponse> addQuestion(@PathVariable Long id, @Valid @RequestBody QuestionRequest r) { return ApiResponse.ok(exams.addQuestion(id, r)); }
  @PostMapping("/exams/{id}/questions/import") ApiResponse<QuestionImportResponse> importQuestions(@PathVariable Long id, @RequestParam MultipartFile file) { return ApiResponse.ok(exams.importQuestions(id, file)); }
  @PutMapping("/questions/{id}") ApiResponse<QuestionResponse> updateQuestion(@PathVariable Long id, @Valid @RequestBody QuestionRequest r) { return ApiResponse.ok(exams.updateQuestion(id, r)); }
  @DeleteMapping("/questions/{id}") ApiResponse<Void> deleteQuestion(@PathVariable Long id) { exams.deleteQuestion(id); return ApiResponse.message("Question deleted"); }
  @GetMapping("/lessons") ApiResponse<List<Lesson>> lessons() { return ApiResponse.ok(content.lessons()); }
  @PostMapping("/lessons") ApiResponse<Lesson> lesson(@Valid @RequestBody LessonRequest r) { return ApiResponse.ok(content.lesson(r)); }
  @PutMapping("/lessons/{id}") ApiResponse<Lesson> updateLesson(@PathVariable Long id, @Valid @RequestBody LessonRequest r) { return ApiResponse.ok(content.updateLesson(id, r)); }
  @DeleteMapping("/lessons/{id}") ApiResponse<Void> deleteLesson(@PathVariable Long id) { content.deleteLesson(id); return ApiResponse.message("Lesson deleted"); }
  @GetMapping("/notifications") ApiResponse<List<Notification>> notifications() { return ApiResponse.ok(content.allNotifications()); }
  @PostMapping("/notifications") ApiResponse<Notification> notify(@Valid @RequestBody NotificationRequest r) { return ApiResponse.ok(content.notify(r)); }
  @PutMapping("/notifications/{id}") ApiResponse<Notification> updateNotification(@PathVariable Long id, @Valid @RequestBody NotificationRequest r) { return ApiResponse.ok(content.updateNotification(id, r)); }
  @DeleteMapping("/notifications/{id}") ApiResponse<Void> deleteNotification(@PathVariable Long id) { content.deleteNotification(id); return ApiResponse.message("Notification deleted"); }
  @GetMapping("/dashboard") ApiResponse<DashboardStats> dashboard() { return ApiResponse.ok(dashboard.stats()); }
}
