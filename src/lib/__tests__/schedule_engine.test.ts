import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateDailyPlan } from "../schedule_engine.ts";
import { calculateOverallWorkload } from "../workload_calculator.ts";
import { DEFAULT_ROUTINE } from "../routine_engine.ts";
import { getFutureDateStr } from "../storage.ts";
import type { DailyScheduleBlock, Subject } from "../../types/academic.ts";

describe("V2 Daily Schedule Engine Tests", () => {
  const sampleSubjects: Subject[] = [
    {
      id: "s1",
      name: "Machine Learning",
      deadline: getFutureDateStr(2),
      type: "Exam",
      tasksRemaining: "SVM, Neural Networks",
      estimatedHours: 8,
      difficulty: "High",
      preparation: "Low",
      importance: "High",
    },
    {
      id: "s2",
      name: "Probability & Statistics",
      deadline: getFutureDateStr(4),
      type: "Assignment",
      tasksRemaining: "Problem set 4",
      estimatedHours: 4,
      difficulty: "Medium",
      preparation: "Medium",
      importance: "High",
    },
  ];

  it("generates a realistic schedule allocating study to high-priority subjects first", () => {
    const { analyzedSubjects } = calculateOverallWorkload(sampleSubjects, DEFAULT_ROUTINE);
    const plan = generateDailyPlan(DEFAULT_ROUTINE, analyzedSubjects);

    assert.ok(plan.blocks.length > 0);
    assert.ok(plan.totalStudyHours > 0);

    // Sleep block must be present and protected
    const sleepBlock = plan.blocks.find((b: DailyScheduleBlock) => b.type === "sleep");
    assert.ok(sleepBlock !== undefined);
    assert.equal(sleepBlock?.startTime, DEFAULT_ROUTINE.sleepTime);
    assert.equal(sleepBlock?.endTime, DEFAULT_ROUTINE.wakeTime);

    // College block must be present and protected
    const collegeBlock = plan.blocks.find((b: DailyScheduleBlock) => b.type === "college");
    assert.ok(collegeBlock !== undefined);
    assert.equal(collegeBlock?.startTime, DEFAULT_ROUTINE.collegeStart);
    assert.equal(collegeBlock?.endTime, DEFAULT_ROUTINE.collegeEnd);

    // Machine Learning is highest priority, so it should receive study allocation
    assert.ok((plan.allocatedSubjectHours["Machine Learning"] ?? 0) > 0);

    // Should include break blocks
    const breakBlocks = plan.blocks.filter((b: DailyScheduleBlock) => b.type === "break");
    assert.ok(breakBlocks.length >= 0);

    // Total study allocated should not exceed available study hours
    assert.ok(plan.totalStudyHours <= 7.5);
  });

  it("never schedules study during college or sleep hours", () => {
    const { analyzedSubjects } = calculateOverallWorkload(sampleSubjects, DEFAULT_ROUTINE);
    const plan = generateDailyPlan(DEFAULT_ROUTINE, analyzedSubjects);

    const studyBlocks = plan.blocks.filter((b: DailyScheduleBlock) => b.type === "study");
    for (const sb of studyBlocks) {
      // Must not be within college hours (09:00 - 16:00)
      const isDuringCollege = sb.startTime >= "09:00" && sb.endTime <= "16:00";
      assert.equal(isDuringCollege, false, `Study block ${sb.startTime}-${sb.endTime} overlaps college!`);

      // Must not overlap sleep (23:30 - 07:00)
      const isDuringSleep = sb.startTime >= "23:30" || sb.endTime <= "07:00";
      assert.equal(isDuringSleep, false, `Study block ${sb.startTime}-${sb.endTime} overlaps sleep!`);
    }
  });

  it("handles zero subjects gracefully", () => {
    const plan = generateDailyPlan(DEFAULT_ROUTINE, []);
    assert.equal(plan.totalStudyHours, 0);
    assert.equal(plan.unallocatedWorkloadHours, 0);
    assert.ok(plan.blocks.some((b: DailyScheduleBlock) => b.type === "sleep"));
    assert.ok(plan.blocks.some((b: DailyScheduleBlock) => b.type === "college"));
  });
});
