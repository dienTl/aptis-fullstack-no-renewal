package com.aptisfullstack.controller;

import com.aptisfullstack.dto.Dto.*;
import com.aptisfullstack.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
  private final AuthService auth;
  @PostMapping("/register") ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest r) { return ApiResponse.ok(auth.register(r)); }
  @PostMapping("/login") ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest r) { return ApiResponse.ok(auth.login(r)); }
  @PostMapping("/refresh") ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshRequest r) { return ApiResponse.ok(auth.refresh(r)); }
  @PostMapping("/forgot-password") ApiResponse<Void> forgot(@Valid @RequestBody ForgotPasswordRequest r) { auth.forgot(r); return ApiResponse.message("OTP sent"); }
  @PostMapping("/reset-password") ApiResponse<Void> reset(@Valid @RequestBody ResetPasswordRequest r) { auth.reset(r); return ApiResponse.message("Password reset"); }
}
