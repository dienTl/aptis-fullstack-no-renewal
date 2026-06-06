package com.aptisfullstack.service;

import static com.aptisfullstack.domain.Enums.*;
import com.aptisfullstack.dto.Dto.AiFeedback;
import org.springframework.stereotype.Service;

@Service
public class AiScoringService {
  public double objectiveScaleScore(int correct, int total) {
    if (total <= 0) return 0;
    return clamp50(Math.round(correct * 50.0 / total));
  }

  public String cefrLevel(ExamType type, double score) {
    int rounded = (int) Math.round(score);
    int[] cuts = switch (type) {
      case LISTENING -> new int[] {8, 16, 24, 34, 42};
      case READING -> new int[] {8, 16, 26, 38, 46};
      case WRITING -> new int[] {6, 18, 26, 40, 48};
      case SPEAKING -> new int[] {4, 16, 26, 41, 48};
      default -> null;
    };
    if (cuts == null) return null;
    if (rounded >= cuts[4]) return "C";
    if (rounded >= cuts[3]) return "B2";
    if (rounded >= cuts[2]) return "B1";
    if (rounded >= cuts[1]) return "A2";
    if (rounded >= cuts[0]) return "A1";
    return "Below A1";
  }

  public AiFeedback writing(String text) {
    int words = text == null || text.isBlank() ? 0 : text.trim().split("\\s+").length;
    if (words == 0) {
      return new AiFeedback(0, "No writing submitted.", "No vocabulary evidence.", "No organisation evidence.", null, "Aptis General estimate: Below A1.");
    }

    String trimmed = text.trim();
    int sentences = Math.max(1, trimmed.split("[.!?]+").length);
    int paragraphs = Math.max(1, trimmed.split("\\R\\s*\\R").length);
    long uniqueWords = java.util.Arrays.stream(trimmed.toLowerCase().split("\\W+")).filter(s -> !s.isBlank()).distinct().count();
    double lexicalDiversity = words == 0 ? 0 : uniqueWords * 1.0 / words;
    boolean hasConnectors = trimmed.toLowerCase().matches(".*\\b(because|although|however|therefore|moreover|firstly|finally|while|whereas|in conclusion)\\b.*");
    boolean hasPunctuation = trimmed.matches(".*[.!?,;:].*");
    boolean startsCapital = Character.isUpperCase(trimmed.charAt(0));

    double lengthScore = Math.min(16, words / 10.0);
    double sentenceScore = Math.min(10, sentences * 1.8);
    double vocabularyScore = Math.min(10, lexicalDiversity * 16);
    double organisationScore = Math.min(8, paragraphs * 2.0 + (hasConnectors ? 3 : 0));
    double mechanicsScore = (hasPunctuation ? 3 : 0) + (startsCapital ? 3 : 0);
    double score = clamp50(Math.round(lengthScore + sentenceScore + vocabularyScore + organisationScore + mechanicsScore));
    String level = cefrLevel(ExamType.WRITING, score);

    return new AiFeedback(score,
        "Estimated from sentence control, punctuation and basic mechanics.",
        "Estimated from range and repetition of vocabulary.",
        "Estimated from paragraphing and linking language.",
        null,
        "Aptis General estimate: " + level + ". This is heuristic scoring, not an official examiner mark.");
  }

  public AiFeedback speaking(String recordingUrl) {
    boolean submitted = recordingUrl != null && !recordingUrl.isBlank();
    double score = submitted ? 26 : 0;
    String level = cefrLevel(ExamType.SPEAKING, score);
    return new AiFeedback(score, null, null, null,
        submitted ? "Recording submitted; pronunciation cannot be analysed without a speech-to-text/phoneme scorer." : "No recording submitted.",
        "Aptis General estimate: " + level + ". Connect a real speech scoring provider for examiner-like speaking marks.");
  }

  private double clamp50(double score) {
    return Math.min(50, Math.max(0, score));
  }
}
