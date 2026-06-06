package com.aptisfullstack.service;

import com.aptisfullstack.domain.*;
import static com.aptisfullstack.domain.Enums.*;
import com.aptisfullstack.dto.Dto.*;
import com.aptisfullstack.exception.ApiException;
import com.aptisfullstack.repository.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class ContentService {
  private final LessonRepository lessons;
  private final NotificationRepository notifications;
  private final MessageRepository messages;
  private final ExamReviewRepository reviews;
  private final UserRepository users;
  private final SimpMessagingTemplate ws;

  public Lesson lesson(LessonRequest r) { return lessons.save(Lesson.builder().title(r.title()).type(r.type()).content(r.content()).build()); }
  public List<Lesson> lessons() { return lessons.findAll(); }
  public Lesson updateLesson(Long id, LessonRequest r) {
    Lesson lesson = lessons.findById(id).orElseThrow(() -> ApiException.notFound("Lesson not found"));
    lesson.setTitle(r.title());
    lesson.setType(r.type());
    lesson.setContent(r.content());
    return lessons.save(lesson);
  }
  public void deleteLesson(Long id) {
    if (!lessons.existsById(id)) throw ApiException.notFound("Lesson not found");
    lessons.deleteById(id);
  }
  public Notification notify(NotificationRequest r) {
    return notifyFor("ALL", r.title(), r.content());
  }
  private Notification notifyFor(String targetRole, String title, String content) {
    Notification n = notifications.save(Notification.builder().title(title).content(content).targetRole(targetRole).build());
    ws.convertAndSend("/topic/notifications", n);
    return n;
  }
  public List<Notification> notifications(User user) {
    List<String> roles = user.getRole() == Role.ADMIN ? List.of("ALL", "ADMIN") : List.of("ALL");
    return notifications.visibleTop20(roles, PageRequest.of(0, 20));
  }
  public List<Notification> allNotifications() { return notifications.visibleAll(List.of("ALL", "ADMIN")); }
  public Notification updateNotification(Long id, NotificationRequest r) {
    Notification n = notifications.findById(id).orElseThrow(() -> ApiException.notFound("Notification not found"));
    n.setTitle(r.title());
    n.setContent(r.content());
    Notification saved = notifications.save(n);
    ws.convertAndSend("/topic/notifications", saved);
    return saved;
  }
  public void deleteNotification(Long id) {
    if (!notifications.existsById(id)) throw ApiException.notFound("Notification not found");
    notifications.deleteById(id);
  }
  public Message send(User sender, MessageRequest r) {
    User receiver = users.findById(r.receiverId()).orElseThrow(() -> ApiException.notFound("Receiver not found"));
    Message m = messages.save(Message.builder().sender(sender).receiver(receiver).content(r.content()).build());
    ws.convertAndSendToUser(receiver.getEmail(), "/queue/messages", m);
    if (!receiver.getEmail().equals(sender.getEmail())) ws.convertAndSendToUser(sender.getEmail(), "/queue/messages", m);
    return m;
  }
  public List<Message> chat(Long a, Long b) {
    return messages.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtAsc(a, b, a, b);
  }
  public List<ReviewResponse> reviews(java.time.LocalDate date) {
    List<ExamReview> data = date == null ? reviews.findAllByOrderByReviewDateDescCreatedAtDesc() : reviews.findByReviewDateOrderByCreatedAtDesc(date);
    return data.stream().map(Mapper::review).toList();
  }
  public ReviewResponse review(User user, ReviewRequest r) {
    ExamReview review = ExamReview.builder().user(user).title(r.title()).content(r.content()).reviewDate(r.reviewDate()).build();
    return Mapper.review(reviews.save(review));
  }
  public void deleteReview(Long id) {
    if (!reviews.existsById(id)) throw ApiException.notFound("Review not found");
    reviews.deleteById(id);
  }
}
