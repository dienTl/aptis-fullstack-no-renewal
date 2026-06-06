package com.aptisfullstack.service;

import com.aptisfullstack.domain.*;
import com.aptisfullstack.domain.Enums.UserStatus;
import com.aptisfullstack.dto.Dto.*;
import com.aptisfullstack.exception.ApiException;
import com.aptisfullstack.repository.UserRepository;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service @RequiredArgsConstructor
public class UserService {
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final FileStorageService files;
  @Value("${app.upload-dir}") String uploadDir;

  public User current() {
    String email = SecurityContextHolder.getContext().getAuthentication().getName();
    return users.findByEmail(email).orElseThrow(() -> ApiException.notFound("User not found"));
  }
  public User byEmail(String email) { return users.findByEmail(email).orElseThrow(() -> ApiException.notFound("User not found")); }
  public UserResponse profile() { return Mapper.user(current()); }
  public List<UserResponse> chatUsers() {
    Long currentId = current().getId();
    return users.findAll().stream().filter(u -> !u.getId().equals(currentId)).map(Mapper::user).toList();
  }
  public UserResponse update(ProfileRequest r) { User u = current(); u.setFullName(r.fullName()); return Mapper.user(users.save(u)); }
  public void changePassword(ChangePasswordRequest r) {
    User u = current();
    if (!encoder.matches(r.oldPassword(), u.getPassword())) throw ApiException.bad("Old password is incorrect");
    u.setPassword(encoder.encode(r.newPassword()));
    users.save(u);
  }
  public UserResponse avatar(MultipartFile file) {
    User u = current();
    u.setAvatar(files.store(file, "avatars"));
    return Mapper.user(users.save(u));
  }
  public List<UserResponse> all() { return users.findAll().stream().map(Mapper::user).toList(); }
  public UserResponse status(Long id, UserStatus status) {
    User u = users.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
    u.setStatus(status);
    return Mapper.user(users.save(u));
  }

  public void requireActiveSubscription() {
    User u = current();
    if (u.getRole() == Enums.Role.ADMIN) return;
    if (u.getStatus() == UserStatus.LOCKED) throw ApiException.forbidden("Tai khoan dang bi khoa");
  }
}
