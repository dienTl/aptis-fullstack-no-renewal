export const SKILL_DURATIONS = {
  READING: 35,
  LISTENING: 55,
  WRITING: 50
};

export function examDurationMinutes(exam) {
  return SKILL_DURATIONS[exam?.type] || Number(exam?.duration) || 0;
}

export function durationForType(type, fallback = 35) {
  return SKILL_DURATIONS[type] || fallback;
}
