package com.aptisfullstack.domain;

public final class Enums {
  private Enums() {}
  public enum Role { USER, ADMIN }
  public enum UserStatus { ACTIVE, LOCKED }
  public enum ExamType { READING, LISTENING, WRITING, SPEAKING, GRAMMAR, MIXED }
  public enum QuestionType { MULTIPLE_CHOICE, LISTENING_AUDIO, ESSAY, SPEAKING_PROMPT, SPEAKING_IMAGE_TABLE, SPEAKING_COMPARE_IMAGES, SPEAKING_PART4_LIST, PARAGRAPH_ORDER, MATCHING_DROPDOWN, OPINION_MATCH, INLINE_DROPDOWN, PASSAGE_MATCH }
  public enum ReviewStatus { APPROVED, PENDING }
}
