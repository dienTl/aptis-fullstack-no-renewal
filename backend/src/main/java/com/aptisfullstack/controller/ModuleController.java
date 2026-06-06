package com.aptisfullstack.controller;

import static com.aptisfullstack.domain.Enums.ExamType.*;
import com.aptisfullstack.dto.Dto.*;
import com.aptisfullstack.service.ExamService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/modules") @RequiredArgsConstructor
public class ModuleController {
  private final ExamService exams;
  @GetMapping("/reading") ApiResponse<List<ExamResponse>> reading() { return ApiResponse.ok(exams.list(READING)); }
  @GetMapping("/listening") ApiResponse<List<ExamResponse>> listening() { return ApiResponse.ok(exams.list(LISTENING)); }
  @GetMapping("/writing") ApiResponse<List<ExamResponse>> writing() { return ApiResponse.ok(exams.list(WRITING)); }
  @GetMapping("/speaking") ApiResponse<List<ExamResponse>> speaking() { return ApiResponse.ok(exams.list(SPEAKING)); }
  @GetMapping("/grammar") ApiResponse<List<ExamResponse>> grammar() { return ApiResponse.ok(exams.list(GRAMMAR)); }
}
