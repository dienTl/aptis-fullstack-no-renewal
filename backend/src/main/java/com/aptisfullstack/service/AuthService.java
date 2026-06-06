package com.aptisfullstack.service;

import static com.aptisfullstack.domain.Enums.*;
import com.aptisfullstack.domain.*;
import com.aptisfullstack.dto.Dto.*;
import com.aptisfullstack.exception.ApiException;
import com.aptisfullstack.repository.*;
import com.aptisfullstack.security.JwtService;
import java.time.Instant;
import java.security.SecureRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class AuthService {
  private final UserRepository users;
  private final RefreshTokenRepository refreshTokens;
  private final PasswordResetOtpRepository otps;
  private final PasswordEncoder encoder;
  private final AuthenticationManager auth;
  private final JwtService jwt;
  private final MailService mail;
  private final SecureRandom secureRandom = new SecureRandom();

  public AuthResponse register(RegisterRequest r) {
    String email = normalizeEmail(r.email());
    if (users.existsByEmail(email)) throw ApiException.bad("Email already exists");
    User user = users.save(User.builder()
        .fullName(r.fullName().trim())
        .email(email)
        .password(encoder.encode(r.password()))
        .role(Role.USER)
        .status(UserStatus.ACTIVE)
        .build());
    return tokens(user);
  }

  public AuthResponse login(LoginRequest r) {
    String email = normalizeEmail(r.email());
    auth.authenticate(new UsernamePasswordAuthenticationToken(email, r.password()));
    return tokens(users.findByEmail(email).orElseThrow());
  }

  @Transactional
  public AuthResponse refresh(RefreshRequest r) {
    RefreshToken rt = refreshTokens.findByToken(r.refreshToken()).orElseThrow(() -> ApiException.bad("Invalid refresh token"));
    if (rt.getExpiresAt().isBefore(Instant.now())) throw ApiException.bad("Refresh token expired");
    return tokens(rt.getUser());
  }

  private AuthResponse tokens(User user) {
    String access = jwt.access(user);
    String refresh = jwt.refresh(user);
    refreshTokens.save(RefreshToken.builder().user(user).token(refresh).expiresAt(Instant.now().plusSeconds(14 * 86400)).build());
    return new AuthResponse(access, refresh, Mapper.user(user));
  }

  @Transactional
  public void forgot(ForgotPasswordRequest r) {
    String email = normalizeEmail(r.email());
    users.findByEmail(email).ifPresent(user -> {
      otps.findByEmailAndUsedFalse(email).forEach(otp -> otp.setUsed(true));
      String otp = String.valueOf(100000 + secureRandom.nextInt(900000));
      otps.save(PasswordResetOtp.builder().email(email).otp(otp).expiresAt(Instant.now().plusSeconds(600)).build());
      mail.send(email, "Aptis password reset OTP", "Your OTP is: " + otp + "\nThis code expires in 10 minutes.");
    });
  }

  @Transactional
  public void reset(ResetPasswordRequest r) {
    String email = normalizeEmail(r.email());
    PasswordResetOtp otp = otps.findTopByEmailAndOtpAndUsedFalseOrderByIdDesc(email, r.otp()).orElseThrow(() -> ApiException.bad("Invalid OTP"));
    if (otp.getExpiresAt().isBefore(Instant.now())) throw ApiException.bad("OTP expired");
    User user = users.findByEmail(email).orElseThrow(() -> ApiException.bad("Invalid OTP"));
    user.setPassword(encoder.encode(r.newPassword()));
    otp.setUsed(true);
    refreshTokens.deleteByUser(user);
    users.save(user);
    otps.save(otp);
  }

  private String normalizeEmail(String email) {
    return email == null ? "" : email.trim().toLowerCase();
  }
}
