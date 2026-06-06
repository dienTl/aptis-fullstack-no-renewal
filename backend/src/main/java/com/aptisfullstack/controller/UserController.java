package com.aptisfullstack.controller;

import com.aptisfullstack.dto.Dto.*;
import com.aptisfullstack.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController @RequestMapping("/api/users/me") @RequiredArgsConstructor
public class UserController {
  private final UserService users;
  @GetMapping ApiResponse<UserResponse> me() { return ApiResponse.ok(users.profile()); }
  @PutMapping ApiResponse<UserResponse> update(@Valid @RequestBody ProfileRequest r) { return ApiResponse.ok(users.update(r)); }
  @PostMapping("/change-password") ApiResponse<Void> password(@Valid @RequestBody ChangePasswordRequest r) { users.changePassword(r); return ApiResponse.message("Password changed"); }
  @PostMapping("/avatar") ApiResponse<UserResponse> avatar(@RequestParam MultipartFile file) { return ApiResponse.ok(users.avatar(file)); }
}
