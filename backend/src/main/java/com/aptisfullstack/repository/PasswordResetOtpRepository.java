package com.aptisfullstack.repository;

import com.aptisfullstack.domain.PasswordResetOtp;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {
  Optional<PasswordResetOtp> findTopByEmailAndOtpAndUsedFalseOrderByIdDesc(String email, String otp);
  List<PasswordResetOtp> findByEmailAndUsedFalse(String email);
}
