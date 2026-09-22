import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateRoutine, validateSubject, calculateDurationMinutes, doWindowsOverlap } from "../validation.ts";
import { calculateRoutineSummary, DEFAULT_ROUTINE } from "../routine_engine.ts";
import type { DailyRoutine, Subject } from "../../types/academic.ts";

describe("V2 Routine and Validation Tests", () => {
  it("calculates time duration correctly including cross-midnight", () => {
    // 09:00 to 16:00 = 7 hours = 420 minutes
    assert.equal(calculateDurationMinutes("09:00", "16:00"), 420);

    // 23:30 to 07:00 = 7.5 hours = 450 minutes
    assert.equal(calculateDurationMinutes("23:30", "07:00"), 450);

    // Same time = 0 minutes
    assert.equal(calculateDurationMinutes("08:00", "08:00"), 0);
  });

  it("detects time window overlaps accurately", () => {
    // Sleep 23:00 to 07:00 and College 06:00 to 12:00 overlap between 06:00 and 07:00
    assert.equal(doWindowsOverlap("23:00", "07:00", "06:00", "12:00"), true);

    // Sleep 23:00 to 07:00 and College 09:00 to 16:00 do NOT overlap
    assert.equal(doWindowsOverlap("23:00", "07:00", "09:00", "16:00"), false);
  });

  it("validates a healthy default routine without errors", () => {
    const errors = validateRoutine(DEFAULT_ROUTINE);
    assert.equal(errors.length, 0);

    const summary = calculateRoutineSummary(DEFAULT_ROUTINE);
    assert.equal(summary.isValid, true);
    // Wake 07:00, Sleep 23:30 -> Sleep = 7.5 hrs
    // College 09:00 to 16:00 -> College = 7 hrs
    // Travel = 1 hr (60 min), Meals = 1.5 hrs (90 min)
    // Total Protected = 7.5 + 7 + 1 + 1.5 = 17 hrs
    // Realistic Available Study Time = 24 - 17 = 7 hrs
    assert.equal(summary.sleepHours, 7.5);
    assert.equal(summary.collegeHours, 7);
    assert.equal(summary.travelHours, 1);
    assert.equal(summary.mealHours, 1.5);
    assert.equal(summary.totalProtectedHours, 17);
    assert.equal(summary.availableStudyHours, 7);
  });

  it("catches impossible or overlapping routine schedules", () => {
    // Overlapping college and sleep
    const overlappingRoutine: DailyRoutine = {
      wakeTime: "10:00",
      sleepTime: "02:00", // Sleep 02:00 to 10:00
      collegeStart: "08:00", // Starts before wake-up!
      collegeEnd: "15:00",
      travelMinutes: 30,
      mealMinutes: 60,
      fixedCommitments: [],
    };
    const errors = validateRoutine(overlappingRoutine);
    assert.ok(errors.some((e) => e.field === "scheduleConflict"));

    // Total routine exceeding 24 hours
    const overloadedRoutine: DailyRoutine = {
      wakeTime: "06:00",
      sleepTime: "22:00", // 8 hrs sleep
      collegeStart: "08:00",
      collegeEnd: "20:00", // 12 hrs college
      travelMinutes: 180, // 3 hrs travel
      mealMinutes: 180,   // 3 hrs meals (Total = 26 hrs)
      fixedCommitments: [],
    };
    const overflowErrors = validateRoutine(overloadedRoutine);
    assert.ok(overflowErrors.some((e) => e.field === "totalHours"));
  });

  it("validates subject input constraints", () => {
    const validSubject: Partial<Subject> = {
      name: "Operating Systems",
      deadline: "2029-12-31",
      type: "Exam",
      tasksRemaining: "Process Synchronization, Virtual Memory",
      estimatedHours: 8,
      difficulty: "High",
      preparation: "Medium",
      importance: "High",
    };
    assert.equal(validateSubject(validSubject).length, 0);

    // Negative hours
    const invalidHours: Partial<Subject> = {
      ...validSubject,
      estimatedHours: -2,
    };
    assert.ok(validateSubject(invalidHours).some((e) => e.field === "estimatedHours"));

    // Past deadline
    const pastDeadline: Partial<Subject> = {
      ...validSubject,
      deadline: "2020-01-01",
    };
    assert.ok(validateSubject(pastDeadline).some((e) => e.field === "deadline"));

    // Empty name
    const emptyName: Partial<Subject> = {
      ...validSubject,
      name: "   ",
    };
    assert.ok(validateSubject(emptyName).some((e) => e.field === "name"));
  });
});
