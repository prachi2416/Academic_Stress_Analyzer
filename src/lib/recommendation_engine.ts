import type { FuzzyInputs, FuzzyResult } from "./fuzzy.ts";
import type {
  DailyRoutine, RoutineSummary, SubjectWithAnalysis,
  WorkloadSummary
} from "../types/academic.ts";

export interface StressContributor {
  id: string;
  factor: string;
  severity: "High" | "Medium" | "Low";
  description: string;
}

export interface EnhancedRecommendations {
  mainContributors: StressContributor[];
  contextAwareInsights: string[];
  sleepProtectionMessage: string;
  whatToDoNowNarrative: string;
}

/**
 * Synthesizes V1 Fuzzy Inference results with V2 Workload, Deadlines, Routine, and Priorities.
 * Strictly avoids any medical or clinical diagnosis language.
 */
export function generateEnhancedInsights(
  fuzzyInputs: FuzzyInputs,
  fuzzyResult: FuzzyResult,
  routineSummary: RoutineSummary,
  routine: DailyRoutine,
  workloadSummary: WorkloadSummary,
  analyzedSubjects: SubjectWithAnalysis[]
): EnhancedRecommendations {
  const contributors: StressContributor[] = [];

  // 1. Workload Gap Contributor
  if (workloadSummary.hasGap) {
    contributors.push({
      id: "workload_gap",
      factor: "Workload Deficit",
      severity: workloadSummary.workloadGap > 5 ? "High" : "Medium",
      description: `Pending coursework exceeds available study hours by ${workloadSummary.workloadGap}h before the upcoming deadlines.`,
    });
  }

  // 2. Upcoming Imminent Deadlines
  const criticalSubjects = analyzedSubjects.filter((s) => s.daysRemaining <= 3);
  if (criticalSubjects.length > 0) {
    contributors.push({
      id: "imminent_deadlines",
      factor: "Imminent Deadlines",
      severity: criticalSubjects.length >= 2 ? "High" : "Medium",
      description: `${criticalSubjects.length} subject${criticalSubjects.length > 1 ? "s have" : " has a"} deadline within the next 3 days (${criticalSubjects.map((s) => s.name).join(", ")}).`,
    });
  }

  // 3. Preparation Gap on High-Importance Tasks
  const lowPrepImportant = analyzedSubjects.filter(
    (s) => s.preparation === "Low" && (s.importance === "High" || s.difficulty === "High")
  );
  if (lowPrepImportant.length > 0) {
    contributors.push({
      id: "low_preparation",
      factor: "Preparation Gap",
      severity: "High",
      description: `Preparation is currently low for ${lowPrepImportant.map((s) => s.name).join(", ")}, which elevates academic urgency.`,
    });
  }

  // 4. Low Sleep from V1 or Routine
  const effectiveSleep = Math.min(fuzzyInputs.sleep, routineSummary.sleepHours);
  if (effectiveSleep < 6) {
    contributors.push({
      id: "low_sleep",
      factor: "Sleep Restriction",
      severity: "High",
      description: `Current sleep duration (${effectiveSleep.toFixed(1)}h) is below the healthy 7–8h baseline, reducing cognitive stamina.`,
    });
  }

  // 5. High Assignment Load from V1
  if (fuzzyInputs.assignments >= 7) {
    contributors.push({
      id: "assignment_load",
      factor: "Heavy Assignment Load",
      severity: "Medium",
      description: `Assignment volume is rated high (${fuzzyInputs.assignments}/10), creating simultaneous deadlines.`,
    });
  }

  // 6. Low Attendance from V1
  if (fuzzyInputs.attendance < 65) {
    contributors.push({
      id: "low_attendance",
      factor: "Attendance Deficit",
      severity: "Medium",
      description: `Class attendance is ${fuzzyInputs.attendance}%, which compounds study time needed outside lectures.`,
    });
  }

  // 7. Excessive Study Hours from V1
  if (fuzzyInputs.study > 9) {
    contributors.push({
      id: "high_study",
      factor: "Diminishing Returns Study",
      severity: "Medium",
      description: `Daily study duration of ${fuzzyInputs.study}h without structured pacing can drive fatigue.`,
    });
  }

  // Context-Aware Insights
  const insights: string[] = [];

  if (fuzzyResult.stressLevel === "High") {
    if (workloadSummary.hasGap) {
      insights.push(
        `Your stress score is High (${fuzzyResult.stressScore.toFixed(1)}/100). A primary driver is the ${workloadSummary.workloadGap}h workload gap between pending assignments and realistically available study time. Focusing on top-priority tasks first will bring the quickest relief.`
      );
    } else {
      insights.push(
        `Your stress score is High (${fuzzyResult.stressScore.toFixed(1)}/100). Even though total available hours look sufficient, intense assignment volume and routine congestion are driving your perceived pressure.`
      );
    }
  } else if (fuzzyResult.stressLevel === "Medium") {
    insights.push(
      `Your stress level is Moderate (${fuzzyResult.stressScore.toFixed(1)}/100). Keeping to the recommended daily study blocks will prevent workload buildup before upcoming exams.`
    );
  } else {
    insights.push(
      `Your stress score is in a healthy range (${fuzzyResult.stressScore.toFixed(1)}/100). Maintain your consistent schedule and monitor upcoming deadlines weekly.`
    );
  }

  // Top Subject Specific Insight
  if (analyzedSubjects.length > 0) {
    const top = analyzedSubjects[0];
    insights.push(
      `${top.name} currently holds the highest priority (${top.priority}) because ${top.priorityReason.toLowerCase()} Focus on its remaining tasks (${top.tasksRemaining.split(/[,;\n]/)[0] || "core modules"}) during your next available study block.`
    );
  }

  // Sleep Protection Message
  const sleepProtectionMessage =
    `Your daily routine protects ${routineSummary.sleepHours} hours of sleep (from ${routine.sleepTime} to ${routine.wakeTime}). The schedule engine does not extend study into the night, preserving recovery time.`;

  // What To Do Now Narrative
  let whatToDoNowNarrative = "Start by reviewing your course syllabus and setting your daily priorities.";
  if (analyzedSubjects.length > 0) {
    const top = analyzedSubjects[0];
    const topTask = top.tasksRemaining.split(/[,;\n]/)[0] || "Next Topic";
    whatToDoNowNarrative =
      `Recommended Focus: Spend 45–60 minutes on ${top.name} (${topTask}). Reason: ${top.priorityReason}`;
  }

  return {
    mainContributors: contributors,
    contextAwareInsights: insights,
    sleepProtectionMessage,
    whatToDoNowNarrative,
  };
}
