import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateDaysRemaining, evaluateSubjectPriority } from "../priority_engine.ts";
import { calculateOverallWorkload } from "../workload_calculator.ts";
import { getFutureDateStr } from "../storage.ts";
import { DEFAULT_ROUTINE } from "../routine_engine.ts";
import type { Subject } from "../../types/academic.ts";

describe("V2 Priority Engine and Workload Calculator Tests", () => {
  it("calculates days remaining accurately", () => {
    const todayStr = getFutureDateStr(0);
    const tomorrowStr = getFutureDateStr(1);
    const futureStr = getFutureDateStr(5);

    assert.equal(calculateDaysRemaining(todayStr), 0);
    assert.equal(calculateDaysRemaining(tomorrowStr), 1);
    assert.equal(calculateDaysRemaining(futureStr), 5);
  });

  it("assigns Very High priority to close deadline with low preparation", () => {
    const urgentSubject: Subject = {
      id: "test-1",
      name: "Data Mining",
      deadline: getFutureDateStr(2),
      type: "Exam",
      tasksRemaining: "Topic 1, Topic 2, Topic 3",
      estimatedHours: 12,
      difficulty: "High",
      preparation: "Low",
      importance: "High",
    };

    const evalResult = evaluateSubjectPriority(urgentSubject);
    assert.equal(evalResult.priority, "Very High");
    assert.ok(evalResult.score >= 70);
    assert.ok(evalResult.reason.toLowerCase().includes("deadline"));
    assert.ok(evalResult.reason.toLowerCase().includes("preparation"));
  });

  it("assigns Low priority to distant deadline with high preparation", () => {
    const calmSubject: Subject = {
      id: "test-2",
      name: "Technical Communication",
      deadline: getFutureDateStr(25),
      type: "Assignment",
      tasksRemaining: "Review slide deck",
      estimatedHours: 2,
      difficulty: "Low",
      preparation: "High",
      importance: "Low",
    };

    const evalResult = evaluateSubjectPriority(calmSubject);
    assert.equal(evalResult.priority, "Low");
    assert.ok(evalResult.score < 40);
  });

  it("calculates overall workload and correctly identifies workload gap", () => {
    const subjects: Subject[] = [
      {
        id: "s1",
        name: "Machine Learning",
        deadline: getFutureDateStr(2),
        type: "Exam",
        tasksRemaining: "Neural Nets",
        estimatedHours: 14,
        difficulty: "High",
        preparation: "Low",
        importance: "High",
      },
      {
        id: "s2",
        name: "Database Systems",
        deadline: getFutureDateStr(3),
        type: "Project",
        tasksRemaining: "Schema design",
        estimatedHours: 8,
        difficulty: "Medium",
        preparation: "Medium",
        importance: "Medium",
      },
    ];

    // Routine available study time = 7h/day. Earliest deadline = 2 days -> Available study time = 14h
    // Total pending workload = 14 + 8 = 22h
    // Workload gap = 22h - 14h = 8h
    const result = calculateOverallWorkload(subjects, DEFAULT_ROUTINE);

    assert.equal(result.summary.totalSubjects, 2);
    assert.equal(result.summary.totalPendingHours, 22);
    assert.equal(result.summary.totalAvailableStudyHours, 14);
    assert.equal(result.summary.workloadGap, 8);
    assert.equal(result.summary.hasGap, true);
    assert.ok(result.summary.workloadGapExplanation.includes("8 hours"));

    // "What Should I Do Now?" recommendations
    assert.ok(result.recommendations.currentTopTask !== null);
    assert.equal(result.recommendations.currentTopTask?.subjectName, "Machine Learning");
    assert.equal(result.recommendations.currentTopTask?.priority, "Very High");

    assert.ok(result.recommendations.nextRecommendedTask !== null);
    assert.equal(result.recommendations.nextRecommendedTask?.subjectName, "Database Systems");
  });

  it("gracefully handles zero subjects edge case", () => {
    const result = calculateOverallWorkload([], DEFAULT_ROUTINE);
    assert.equal(result.summary.totalSubjects, 0);
    assert.equal(result.summary.totalPendingHours, 0);
    assert.equal(result.summary.workloadGap, 0);
    assert.equal(result.summary.hasGap, false);
    assert.equal(result.recommendations.currentTopTask, null);
    assert.equal(result.recommendations.nextRecommendedTask, null);
  });
});
