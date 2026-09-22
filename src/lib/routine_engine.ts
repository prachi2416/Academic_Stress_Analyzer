import type { DailyRoutine, RoutineSummary } from "../types/academic.ts";
import { calculateDurationMinutes, timeToMinutes, validateRoutine } from "./validation.ts";

export const DEFAULT_ROUTINE: DailyRoutine = {
  wakeTime: "07:00",
  sleepTime: "23:30",
  collegeStart: "09:00",
  collegeEnd: "16:00",
  travelMinutes: 60, // 1 hour total
  mealMinutes: 90,   // 1.5 hours total
  fixedCommitments: [],
};

/**
 * Calculates a full summary of protected hours and remaining available study time.
 */
export function calculateRoutineSummary(routine: DailyRoutine): RoutineSummary {
  const errors = validateRoutine(routine);
  if (errors.length > 0) {
    return {
      sleepHours: 0,
      collegeHours: 0,
      travelHours: 0,
      mealHours: 0,
      fixedCommitmentHours: 0,
      totalProtectedHours: 24,
      availableStudyHours: 0,
      isValid: false,
      validationError: errors[0].message,
    };
  }

  const sleepMin = calculateDurationMinutes(routine.sleepTime, routine.wakeTime);
  const collegeMin = calculateDurationMinutes(routine.collegeStart, routine.collegeEnd);
  const travelMin = Math.max(0, routine.travelMinutes);
  const mealMin = Math.max(0, routine.mealMinutes);

  let fixedCommitmentsMin = 0;
  for (const c of routine.fixedCommitments) {
    fixedCommitmentsMin += calculateDurationMinutes(c.start, c.end);
  }

  const totalProtectedMin = sleepMin + collegeMin + travelMin + mealMin + fixedCommitmentsMin;
  const availableStudyMin = Math.max(0, 1440 - totalProtectedMin);

  return {
    sleepHours: Math.round((sleepMin / 60) * 10) / 10,
    collegeHours: Math.round((collegeMin / 60) * 10) / 10,
    travelHours: Math.round((travelMin / 60) * 10) / 10,
    mealHours: Math.round((mealMin / 60) * 10) / 10,
    fixedCommitmentHours: Math.round((fixedCommitmentsMin / 60) * 10) / 10,
    totalProtectedHours: Math.round((totalProtectedMin / 60) * 10) / 10,
    availableStudyHours: Math.round((availableStudyMin / 60) * 10) / 10,
    isValid: true,
  };
}

export interface AvailableTimeSlot {
  startMinutes: number; // minutes from 00:00
  endMinutes: number;
  durationMinutes: number;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

function minutesToTimeString(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Discovers actual concrete unblocked study time windows across the student's day.
 * Respects sleep, college, travel, meals, and fixed commitments.
 */
export function getAvailableStudyWindows(routine: DailyRoutine): AvailableTimeSlot[] {
  const summary = calculateRoutineSummary(routine);
  if (!summary.isValid || summary.availableStudyHours <= 0) {
    return [];
  }

  // Build a 1440-minute occupancy boolean array (true = occupied/protected)
  const occupied = new Array<boolean>(1440).fill(false);

  const blockMinutes = (startStr: string, endStr: string) => {
    const s = timeToMinutes(startStr);
    const dur = calculateDurationMinutes(startStr, endStr);
    for (let i = 0; i < dur; i++) {
      occupied[(s + i) % 1440] = true;
    }
  };

  // 1. Block sleep
  blockMinutes(routine.sleepTime, routine.wakeTime);

  // 2. Block college
  blockMinutes(routine.collegeStart, routine.collegeEnd);

  // 3. Block travel (place half before college and half after college)
  const travelHalf = Math.floor(routine.travelMinutes / 2);
  const collegeStartMin = timeToMinutes(routine.collegeStart);
  const collegeEndMin = timeToMinutes(routine.collegeEnd);

  for (let i = 1; i <= travelHalf; i++) {
    occupied[((collegeStartMin - i) % 1440 + 1440) % 1440] = true;
  }
  for (let i = 0; i < (routine.travelMinutes - travelHalf); i++) {
    occupied[(collegeEndMin + i) % 1440] = true;
  }

  // 4. Block meals
  // Usually dinner 19:30 - 20:30 (or around evening) & morning breakfast
  const wakeMin = timeToMinutes(routine.wakeTime);
  // Allocate 30 mins after waking for morning routine/breakfast
  for (let i = 0; i < Math.min(30, routine.mealMinutes); i++) {
    occupied[(wakeMin + i) % 1440] = true;
  }
  // Allocate remaining meal time around 19:30 or between college end and sleep
  const remainingMeal = Math.max(0, routine.mealMinutes - 30);
  if (remainingMeal > 0) {
    // Look for an appropriate dinner slot around 19:30
    const dinnerStart = 19 * 60 + 30; // 19:30
    for (let i = 0; i < remainingMeal; i++) {
      occupied[(dinnerStart + i) % 1440] = true;
    }
  }

  // 5. Block fixed commitments
  for (const c of routine.fixedCommitments) {
    blockMinutes(c.start, c.end);
  }

  // Find contiguous free slots starting from wake time
  const slots: AvailableTimeSlot[] = [];
  let inFreeSlot = false;
  let slotStart = 0;

  for (let step = 0; step < 1440; step++) {
    const minute = (wakeMin + step) % 1440;
    const isOccupied = occupied[minute];

    if (!isOccupied && !inFreeSlot) {
      inFreeSlot = true;
      slotStart = minute;
    } else if (isOccupied && inFreeSlot) {
      inFreeSlot = false;
      const dur = calculateDurationMinutes(minutesToTimeString(slotStart), minutesToTimeString(minute));
      if (dur >= 20) { // Only count usable blocks of 20+ minutes
        slots.push({
          startMinutes: slotStart,
          endMinutes: minute,
          durationMinutes: dur,
          startTime: minutesToTimeString(slotStart),
          endTime: minutesToTimeString(minute),
        });
      }
    }
  }

  // Wrap up any open slot
  if (inFreeSlot) {
    const endMin = (wakeMin + 1440) % 1440;
    const dur = calculateDurationMinutes(minutesToTimeString(slotStart), minutesToTimeString(endMin));
    if (dur >= 20) {
      slots.push({
        startMinutes: slotStart,
        endMinutes: endMin,
        durationMinutes: dur,
        startTime: minutesToTimeString(slotStart),
        endTime: minutesToTimeString(endMin),
      });
    }
  }

  return slots;
}
