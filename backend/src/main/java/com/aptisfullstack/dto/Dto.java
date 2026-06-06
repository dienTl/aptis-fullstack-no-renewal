package com.aptisfullstack.dto;

import com.aptisfullstack.domain.Enums.*;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

public final class Dto {
  private Dto() {}

  public record ApiResponse<T>(boolean success, String message, T data) {
    public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(true, "OK", data); }
    public static <T> ApiResponse<T> message(String message) { return new ApiResponse<>(true, message, null); }
  }
  public record RegisterRequest(@NotBlank String fullName, @Email @NotBlank String email, @NotBlank @Size(min = 6) String password) {}
  public record LoginRequest(@NotBlank String email, @NotBlank String password) {}
  public record AuthResponse(String accessToken, String refreshToken, UserResponse user) {}
  public record RefreshRequest(@NotBlank String refreshToken) {}
  public record ForgotPasswordRequest(@Email @NotBlank String email) {}
  public record ResetPasswordRequest(@Email @NotBlank String email, @Pattern(regexp = "\\d{6}") String otp, @NotBlank @Size(min = 6) String newPassword) {}
  public record ChangePasswordRequest(@NotBlank String oldPassword, @NotBlank @Size(min = 6) String newPassword) {}
  public record ProfileRequest(@NotBlank String fullName) {}
  public record UserResponse(Long id, String fullName, String email, Role role, String avatar, UserStatus status) {}
  public record ExamRequest(@NotBlank String title, @NotNull ExamType type, @Min(1) Integer duration, String transcript, String audioUrl, String prompt) {}
  public record ExamResponse(Long id, String title, ExamType type, Integer duration, String transcript, String audioUrl, String prompt, List<QuestionResponse> questions) {}
  public record PracticeExamRequest(@NotBlank String title, @NotNull ExamType type, @Min(1) Integer duration, String transcript, String audioUrl, String prompt) {}
  public record PracticeExamResponse(Long id, String title, ExamType type, Integer duration, String transcript, String audioUrl, String prompt, List<QuestionResponse> questions) {}
  public record QuestionRequest(@NotBlank String content, String optionA, String optionB, String optionC, String optionD, String optionE, String optionF, String audioUrl, String imageUrl, String imageUrl2, String scriptText, String correctAnswer, String explanation, QuestionType questionType) {}
  public record QuestionResponse(Long id, String content, String optionA, String optionB, String optionC, String optionD, String optionE, String optionF, String audioUrl, String imageUrl, String imageUrl2, String scriptText, String correctAnswer, String explanation, QuestionType questionType) {}
  public record QuestionImportResponse(int imported, List<String> errors) {}
  public record SubmitExamRequest(Map<Long, String> answers, Integer timeSpentSeconds, String essayText, String recordingUrl) {}
  public record ExamResultResponse(Long id, Long examId, String examTitle, double score, String cefrLevel, int totalCorrect, int totalQuestions, Integer timeSpentSeconds, String aiFeedback, Instant submittedAt) {}
  public record LessonRequest(@NotBlank String title, ExamType type, @NotBlank String content) {}
  public record NotificationRequest(@NotBlank String title, @NotBlank String content) {}
  public record MessageRequest(@NotNull Long receiverId, @NotBlank String content) {}
  public record ReviewRequest(@NotBlank String title, @NotBlank String content, LocalDate reviewDate) {}
  public record ReviewResponse(Long id, String title, String content, ReviewStatus status, LocalDate reviewDate, Instant createdAt, UserResponse user) {}
  public record AiFeedback(double score, String grammar, String vocabulary, String coherence, String pronunciation, String overall) {}
  public record DashboardStats(long totalUsers, long totalExams, long totalAttempts, List<Map<String, Object>> topLearners, Map<String, Long> attemptsByPeriod, Map<String, Long> userRegistrations, Map<String, Long> usersByRole, Map<String, Long> usersByStatus) {}
}
