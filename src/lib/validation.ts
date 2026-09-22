import type { DailyRoutine, Subject, ValidationError } from "../types/academic.ts";

/**
 * Parses "HH:MM" into total minutes from 00:00 (0 to 1439).
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== "string") return -1;
  const parts = timeStr.trim().split(":");
  if (parts.length !== 2) return -1;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return -1;
  }
  return h * 60 + m;
}

/**
 * Calculates duration in minutes from start to end, supporting cross-midnight (e.g. 23:00 to 07:00).
 */
export function calculateDurationMinutes(startStr: string, endStr: string): number {
  const start = timeToMinutes(startStr);
  const end = timeToMinutes(endStr);
  if (start < 0 || end < 0) return 0;
  if (end >= start) {
    return end - start;
  }
  // Crosses midnight: from start to 24:00 (1440) + 0 to end
  return 1440 - start + end;
}

/**
 * Checks if a specific minute point in the 24h cycle falls within a window [start, end],
 * supporting cross-midnight windows.
 */
export function isMinuteInWindow(minute: number, startMin: number, endMin: number): boolean {
  if (startMin <= endMin) {
    return minute >= startMin && minute < endMin;
  }
  // Crosses midnight
  return minute >= startMin || minute < endMin;
}

/**
 * Checks if two time windows [start1, end1] and [start2, end2] overlap in a 24h cycle.
 */
export function doWindowsOverlap(s1: string, e1: string, s2: string, e2: string): boolean {
  const start1 = timeToMinutes(s1);
  const end1 = timeToMinutes(e1);
  const start2 = timeToMinutes(s2);
  const end2 = timeToMinutes(e2);
  if (start1 < 0 || end1 < 0 || start2 < 0 || end2 < 0) return false;

  // Discretize into 1440 minute points and check intersection
  const len1 = calculateDurationMinutes(s1, e1);
  for (let i = 0; i < len1; i++) {
    const minute = (start1 + i) % 1440;
    if (isMinuteInWindow(minute, start2, end2)) {
      return true;
    }
  }
  return false;
}

/**
 * Validates the Daily Routine input according to PART 11.
 */
export function validateRoutine(routine: DailyRoutine): ValidationError[] {
  const errors: ValidationError[] = [];

  const wakeMin = timeToMinutes(routine.wakeTime);
  const sleepMin = timeToMinutes(routine.sleepTime);
  const collegeStartMin = timeToMinutes(routine.collegeStart);
  const collegeEndMin = timeToMinutes(routine.collegeEnd);

  if (wakeMin < 0) {
    errors.push({ field: "wakeTime", message: "Wake-up time must be a valid time (e.g. 07:00)." });
  }
  if (sleepMin < 0) {
    errors.push({ field: "sleepTime", message: "Sleep time must be a valid time (e.g. 23:30)." });
  }
  if (collegeStartMin < 0) {
    errors.push({ field: "collegeStart", message: "College start time must be a valid time (e.g. 09:00)." });
  }
  if (collegeEndMin < 0) {
    errors.push({ field: "collegeEnd", message: "College end time must be a valid time (e.g. 16:00)." });
  }

  if (routine.travelMinutes < 0) {
    errors.push({ field: "travelMinutes", message: "Travel time cannot be negative." });
  }
  if (routine.mealMinutes < 0) {
    errors.push({ field: "mealMinutes", message: "Meal/break time cannot be negative." });
  }

  if (errors.length > 0) return errors;

  // Sleep duration
  const sleepDurationMinutes = calculateDurationMinutes(routine.sleepTime, routine.wakeTime);
  const sleepHours = sleepDurationMinutes / 60;
  if (sleepHours < 3) {
    errors.push({
      field: "sleepTime",
      message: `Calculated sleep duration (${sleepHours.toFixed(1)} hrs) is dangerously low. Please allocate at least 4-5 hours of sleep.`,
    });
  } else if (sleepHours > 14) {
    errors.push({
      field: "sleepTime",
      message: `Calculated sleep duration (${sleepHours.toFixed(1)} hrs) exceeds 14 hours. Please verify wake and sleep times.`,
    });
  }

  // College duration
  const collegeDurationMinutes = calculateDurationMinutes(routine.collegeStart, routine.collegeEnd);
  const collegeHours = collegeDurationMinutes / 60;
  if (collegeHours <= 0 || collegeHours > 14) {
    errors.push({
      field: "collegeHours",
      message: `College hours (${collegeHours.toFixed(1)} hrs) must be realistic and greater than 0.`,
    });
  }

  // Check college overlap with sleep
  if (doWindowsOverlap(routine.collegeStart, routine.collegeEnd, routine.sleepTime, routine.wakeTime)) {
    errors.push({
      field: "scheduleConflict",
      message: "College hours cannot overlap with your intended sleep period.",
    });
  }

  // Validate fixed commitments
  for (let i = 0; i < routine.fixedCommitments.length; i++) {
    const c = routine.fixedCommitments[i];
    if (!c.name.trim()) {
      errors.push({ field: `commitment_${i}`, message: `Commitment #${i + 1} requires a valid name.` });
    }
    const cStart = timeToMinutes(c.start);
    const cEnd = timeToMinutes(c.end);
    if (cStart < 0 || cEnd < 0) {
      errors.push({ field: `commitment_${i}`, message: `Commitment "${c.name || `#${i + 1}`}" has invalid times.` });
      continue;
    }
    if (doWindowsOverlap(c.start, c.end, routine.sleepTime, routine.wakeTime)) {
      errors.push({
        field: `commitment_${i}`,
        message: `Commitment "${c.name}" overlaps with your intended sleep period.`,
      });
    }
    if (doWindowsOverlap(c.start, c.end, routine.collegeStart, routine.collegeEnd)) {
      errors.push({
        field: `commitment_${i}`,
        message: `Commitment "${c.name}" overlaps with your college hours.`,
      });
    }
  }

  // Check total protected hours does not exceed 24 hours
  let totalCommitmentMinutes = 0;
  for (const c of routine.fixedCommitments) {
    totalCommitmentMinutes += calculateDurationMinutes(c.start, c.end);
  }

  const totalProtectedMinutes =
    sleepDurationMinutes +
    collegeDurationMinutes +
    routine.travelMinutes +
    routine.mealMinutes +
    totalCommitmentMinutes;

  if (totalProtectedMinutes >= 1440) {
    const totalHours = (totalProtectedMinutes / 60).toFixed(1);
    errors.push({
      field: "totalHours",
      message: `Total routine commitments (${totalHours} hrs) equal or exceed 24 hours in a day. No study time can be scheduled.`,
    });
  }

  return errors;
}

/**
 * Validates a Subject input according to PART 11.
 */
export function validateSubject(subject: Partial<Subject>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!subject.name || !subject.name.trim()) {
    errors.push({ field: "name", message: "Subject name is required." });
  }

  if (!subject.deadline || !subject.deadline.trim()) {
    errors.push({ field: "deadline", message: "Deadline date is required." });
  } else {
    // Check format and date validity
    const deadlineDate = new Date(`${subject.deadline}T23:59:59`);
    if (isNaN(deadlineDate.getTime())) {
      errors.push({ field: "deadline", message: "Deadline is not a valid date." });
    } else {
      // Check if deadline is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        errors.push({
          field: "deadline",
          message: "Deadline cannot be in the past. Please select today or a future date.",
        });
      }
    }
  }

  if (subject.estimatedHours === undefined || isNaN(subject.estimatedHours)) {
    errors.push({ field: "estimatedHours", message: "Estimated study hours required is required." });
  } else if (subject.estimatedHours <= 0) {
    errors.push({ field: "estimatedHours", message: "Estimated hours must be greater than 0." });
  } else if (subject.estimatedHours > 200) {
    errors.push({ field: "estimatedHours", message: "Estimated hours cannot exceed 200 hours per subject." });
  }

  if (!subject.tasksRemaining || !subject.tasksRemaining.trim()) {
    errors.push({ field: "tasksRemaining", message: "Please specify the remaining topics or tasks." });
  }

  if (!subject.type || !["Exam", "Assignment", "Project", "Other"].includes(subject.type)) {
    errors.push({ field: "type", message: "Type must be Exam, Assignment, Project, or Other." });
  }

  if (!subject.difficulty || !["Low", "Medium", "High"].includes(subject.difficulty)) {
    errors.push({ field: "difficulty", message: "Difficulty must be Low, Medium, or High." });
  }

  if (!subject.preparation || !["Low", "Medium", "High"].includes(subject.preparation)) {
    errors.push({ field: "preparation", message: "Preparation must be Low, Medium, or High." });
  }

  if (!subject.importance || !["Low", "Medium", "High"].includes(subject.importance)) {
    errors.push({ field: "importance", message: "Importance must be Low, Medium, or High." });
  }

  return errors;
}
