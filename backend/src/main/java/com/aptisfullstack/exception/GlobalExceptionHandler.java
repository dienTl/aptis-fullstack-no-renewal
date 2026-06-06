package com.aptisfullstack.exception;

import com.aptisfullstack.dto.Dto.ApiResponse;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ApiException.class)
  ResponseEntity<ApiResponse<Void>> api(ApiException e) {
    return ResponseEntity.status(e.status).body(new ApiResponse<>(false, e.getMessage(), null));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiResponse<Map<String, Object>>> validation(MethodArgumentNotValidException e) {
    Map<String, String> fields = new LinkedHashMap<>();
    e.getBindingResult().getFieldErrors().forEach(f -> fields.putIfAbsent(f.getField(), f.getDefaultMessage()));
    String message = e.getBindingResult().getFieldErrors().stream()
        .map(f -> f.getField() + ": " + f.getDefaultMessage()).collect(Collectors.joining(", "));
    return ResponseEntity.badRequest().body(new ApiResponse<>(false, message, Map.of("fields", fields)));
  }

  @ExceptionHandler(Exception.class)
  ResponseEntity<ApiResponse<Void>> all(Exception e) {
    return ResponseEntity.status(500).body(new ApiResponse<>(false, e.getMessage(), null));
  }
}
