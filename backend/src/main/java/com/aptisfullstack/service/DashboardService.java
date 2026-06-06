package com.aptisfullstack.service;

import static com.aptisfullstack.domain.Enums.*;
import com.aptisfullstack.dto.Dto.DashboardStats;
import com.aptisfullstack.repository.*;
import java.time.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class DashboardService {
  private final UserRepository users;
  private final ExamRepository exams;
  private final ExamResultRepository results;

  public DashboardStats stats() {
    List<Map<String, Object>> top = results.topLearners().stream().limit(10).map(row -> {
      Map<String, Object> m = new LinkedHashMap<>();
      m.put("fullName", row[0]);
      m.put("attempts", row[1]);
      return m;
    }).toList();
    Instant now = Instant.now();
    Map<String, Long> periods = Map.of(
        "today", results.countBySubmittedAtBetween(now.minus(Duration.ofDays(1)), now),
        "month", results.countBySubmittedAtBetween(now.minus(Duration.ofDays(30)), now),
        "year", results.countBySubmittedAtBetween(now.minus(Duration.ofDays(365)), now));
    Map<String, Long> registrations = Map.of(
        "today", users.countByCreatedAtBetween(now.minus(Duration.ofDays(1)), now),
        "week", users.countByCreatedAtBetween(now.minus(Duration.ofDays(7)), now),
        "month", users.countByCreatedAtBetween(now.minus(Duration.ofDays(30)), now));
    Map<String, Long> byRole = Map.of(
        "admin", users.countByRole(Role.ADMIN),
        "user", users.countByRole(Role.USER));
    Map<String, Long> byStatus = Map.of(
        "active", users.countByStatus(UserStatus.ACTIVE),
        "locked", users.countByStatus(UserStatus.LOCKED));
    return new DashboardStats(users.count(), exams.count(), results.count(), top, periods, registrations, byRole, byStatus);
  }
}
