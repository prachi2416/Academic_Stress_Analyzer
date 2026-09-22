import type { Level, PriorityLevel, Subject } from "../types/academic.ts";

export interface PriorityEvaluation {
  priority: PriorityLevel;
  score: number; // 0 - 100
  reason: string;
  urgencyLabel: "Immediate" | "Urgent" | "Moderate" | "Relaxed";
}

/**
 * Calculates days remaining from today until the deadline date (inclusive).
 * Returns 0 if due today, negative if past due.
 */
export function calculateDaysRemaining(deadlineStr: string): number {
  if (!deadlineStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${deadlineStr}T00:00:00`);
  if (isNaN(target.getTime())) return 0;
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates priority for a given subject using a deterministic 5-factor scoring model:
 * 1. Deadline urgency (35%)
 * 2. Remaining workload hours (20%)
 * 3. Preparation level gap (20%)
 * 4. Importance (15%)
 * 5. Difficulty (10%)
 */
export function evaluateSubjectPriority(subject: Subject): PriorityEvaluation {
  const days = calculateDaysRemaining(subject.deadline);

  // 1. Deadline urgency score (0-100)
  let urgencyScore = 15;
  let urgencyLabel: PriorityEvaluation["urgencyLabel"] = "Relaxed";

  if (days <= 1) {
    urgencyScore = 100;
    urgencyLabel = "Immediate";
  } else if (days <= 3) {
    urgencyScore = 85;
    urgencyLabel = "Immediate";
  } else if (days <= 5) {
    urgencyScore = 70;
    urgencyLabel = "Urgent";
  } else if (days <= 7) {
    urgencyScore = 55;
    urgencyLabel = "Urgent";
  } else if (days <= 14) {
    urgencyScore = 35;
    urgencyLabel = "Moderate";
  } else {
    urgencyScore = 15;
    urgencyLabel = "Relaxed";
  }

  // 2. Workload score (0-100, normalized up to 15 hours)
  const workloadScore = Math.min(100, Math.max(10, (subject.estimatedHours / 12) * 100));

  // 3. Preparation gap (Low prep = highest priority need)
  const prepScoreMap: Record<Level, number> = {
    Low: 100, // Behind -> Needs immediate attention
    Medium: 55,
    High: 20, // Prepared -> Lower stress urgency
  };
  const prepScore = prepScoreMap[subject.preparation] ?? 50;

  // 4. Importance (Core course / exam)
  const impScoreMap: Record<Level, number> = {
    High: 100,
    Medium: 60,
    Low: 25,
  };
  const impScore = impScoreMap[subject.importance] ?? 60;

  // 5. Difficulty
  const diffScoreMap: Record<Level, number> = {
    High: 100,
    Medium: 60,
    Low: 25,
  };
  const diffScore = diffScoreMap[subject.difficulty] ?? 60;

  // Weighted composite score (0-100)
  const compositeScore =
    urgencyScore * 0.35 +
    workloadScore * 0.20 +
    prepScore * 0.20 +
    impScore * 0.15 +
    diffScore * 0.10;

  let priority: PriorityLevel = "Low";
  if (compositeScore >= 72 || days <= 1) {
    priority = "Very High";
  } else if (compositeScore >= 55 || days <= 3) {
    priority = "High";
  } else if (compositeScore >= 38) {
    priority = "Medium";
  } else {
    priority = "Low";
  }

  // Build transparent, human-readable rationale
  const reasons: string[] = [];
  if (days <= 1) {
    reasons.push("Deadline is due today or tomorrow");
  } else if (days <= 3) {
    reasons.push(`Deadline is very close (${days} days remaining)`);
  } else if (days <= 7) {
    reasons.push(`Upcoming deadline in ${days} days`);
  }

  if (subject.preparation === "Low") {
    reasons.push("preparation is currently low");
  }

  if (subject.estimatedHours >= 8) {
    reasons.push(`${subject.estimatedHours}h of pending workload remaining`);
  }

  if (subject.difficulty === "High") {
    reasons.push("high conceptual difficulty");
  }

  if (subject.importance === "High" && reasons.length < 3) {
    reasons.push("high academic importance");
  }

  if (reasons.length === 0) {
    if (subject.preparation === "High") {
      reasons.push("Good preparation and comfortable deadline window");
    } else {
      reasons.push("Manageable workload and deadline timing");
    }
  }

  const reasonText = reasons.join(", ") + ".";
  // Capitalize first letter
  const formattedReason = reasonText.charAt(0).toUpperCase() + reasonText.slice(1);

  return {
    priority,
    score: Math.round(compositeScore * 10) / 10,
    reason: formattedReason,
    urgencyLabel,
  };
}
