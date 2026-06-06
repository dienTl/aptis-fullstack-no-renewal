package com.aptisfullstack.config;

import com.aptisfullstack.domain.*;
import com.aptisfullstack.domain.Enums.ExamType;
import com.aptisfullstack.domain.Enums.QuestionType;
import com.aptisfullstack.domain.Enums.Role;
import com.aptisfullstack.domain.Enums.UserStatus;
import com.aptisfullstack.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
  @Bean
  CommandLineRunner seed(UserRepository users, ExamRepository exams, QuestionRepository questions, PasswordEncoder encoder) {
    return args -> {
      User admin = users.findByEmail("admin@aptis.local").orElseGet(() -> User.builder().email("admin@aptis.local").build());
      admin.setFullName("Admin");
      admin.setPassword(encoder.encode("admin123"));
      admin.setRole(Role.ADMIN);
      admin.setStatus(UserStatus.ACTIVE);
      users.save(admin);
      if (exams.count() == 0) {
        Exam exam = exams.save(Exam.builder().title("Reading Sample 1").type(ExamType.READING).duration(35).build());
        questions.save(Question.builder().exam(exam).questionType(QuestionType.MULTIPLE_CHOICE)
            .content("Choose the best heading for a paragraph about urban gardens.")
            .optionA("Transport").optionB("Green spaces").optionC("Banking").optionD("Weather")
            .correctAnswer("B").explanation("The paragraph focuses on gardens and greenery in cities.").build());
      }
    };
  }
}
