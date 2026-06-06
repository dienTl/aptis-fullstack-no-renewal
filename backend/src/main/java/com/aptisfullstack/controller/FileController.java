package com.aptisfullstack.controller;

import com.aptisfullstack.dto.Dto.ApiResponse;
import com.aptisfullstack.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController @RequestMapping("/api/files") @RequiredArgsConstructor
public class FileController {
  private final FileStorageService files;
  @PostMapping("/audio") ApiResponse<String> audio(@RequestParam MultipartFile file) { return ApiResponse.ok(files.store(file, "audio")); }
  @PostMapping("/avatar") ApiResponse<String> avatar(@RequestParam MultipartFile file) { return ApiResponse.ok(files.store(file, "avatars")); }
}
