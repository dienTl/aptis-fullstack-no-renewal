package com.aptisfullstack.controller;

import com.aptisfullstack.domain.*;
import com.aptisfullstack.dto.Dto.*;
import com.aptisfullstack.service.*;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class ContentController {
  private final ContentService content;
  private final UserService users;
  @GetMapping("/lessons") ApiResponse<List<Lesson>> lessons() { return ApiResponse.ok(content.lessons()); }
  @GetMapping("/notifications") ApiResponse<List<Notification>> notifications() { return ApiResponse.ok(content.notifications(users.current())); }
  @GetMapping("/chat/users") ApiResponse<List<UserResponse>> chatUsers() { return ApiResponse.ok(users.chatUsers()); }
  @PostMapping("/messages") ApiResponse<Message> send(@RequestBody MessageRequest r) { return ApiResponse.ok(content.send(users.current(), r)); }
  @GetMapping("/messages/{userId}") ApiResponse<List<Message>> chat(@PathVariable Long userId) { return ApiResponse.ok(content.chat(users.current().getId(), userId)); }
  @GetMapping("/reviews") ApiResponse<List<ReviewResponse>> reviews(@RequestParam(required = false) LocalDate date) { return ApiResponse.ok(content.reviews(date)); }
  @PostMapping("/reviews") ApiResponse<ReviewResponse> review(@RequestBody ReviewRequest r) { return ApiResponse.ok(content.review(users.current(), r)); }
  @DeleteMapping("/admin/reviews/{id}") ApiResponse<Void> deleteReview(@PathVariable Long id) { content.deleteReview(id); return ApiResponse.message("Review deleted"); }
}
