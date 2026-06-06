package com.aptisfullstack.controller;

import com.aptisfullstack.domain.Enums.ExamType;
import com.aptisfullstack.dto.Dto.*;
import com.aptisfullstack.service.ExamService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/exams") @RequiredArgsConstructor
public class ExamController {
  private final ExamService exams;
  @GetMapping ApiResponse<List<ExamResponse>> list(@RequestParam(required = false) ExamType type) { return ApiResponse.ok(exams.list(type)); }
  @GetMapping("/{id}") ApiResponse<ExamResponse> one(@PathVariable Long id) { return ApiResponse.ok(exams.one(id)); }
  @PostMapping("/{id}/submit") ApiResponse<ExamResultResponse> submit(@PathVariable Long id, @RequestBody SubmitExamRequest r) { return ApiResponse.ok(exams.submit(id, r)); }
  @GetMapping("/history/me") ApiResponse<List<ExamResultResponse>> history() { return ApiResponse.ok(exams.history()); }
}
