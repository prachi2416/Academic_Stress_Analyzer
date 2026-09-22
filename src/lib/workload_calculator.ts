import type {
  DailyRoutine, Subject, SubjectWithAnalysis,
  TaskRecommendation, WorkloadSummary
} from "../types/academic.ts";
import { calculateRoutineSummary } from "./routine_engine.ts";
import { calculateDaysRemaining, evaluateSubjectPriority } from "./priority_engine.ts";

/**
 * Analyzes an individual subject in the context of the student's daily routine.
 */
export function analyzeSubject(subject: Subject, dailyAvailableStudyHours: number): SubjectWithAnalysis {
  const days = calculateDaysRemaining(subject.deadline);
  const evalResult = evaluateSubjectPriority(subject);

  // Available study time before deadline = daily available study hours * days remaining
  // If due today (0 days left), student only has today's study hours
  const effectiveDays = Math.max(1, days);
  const availableStudyTimeBeforeDeadline =
    Math.round(dailyAvailableStudyHours * effectiveDays * 10) / 10;

  return {
    ...subject,
    daysRemaining: days,
    urgencyLevel: evalResult.urgencyLabel,
    availableStudyTimeBeforeDeadline,
    priority: evalResult.priority,
    priorityScore: evalResult.score,
    priorityReason: evalResult.reason,
  };
}

/**
 * Calculates overall workload metrics and workload gap across all subjects.
 */
export function calculateOverallWorkload(
  subjects: Subject[],
  routine: DailyRoutine
): {
  analyzedSubjects: SubjectWithAnalysis[];
  summary: WorkloadSummary;
  recommendations: TaskRecommendation;
} {
  const routineSummary = calculateRoutineSummary(routine);
  const dailyAvailableStudyHours = routineSummary.availableStudyHours;

  const analyzedSubjects = subjects
    .map((s) => analyzeSubject(s, dailyAvailableStudyHours))
    .sort((a, b) => {
      // Sort primarily by priority score descending, then by days remaining ascending
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return a.daysRemaining - b.daysRemaining;
    });

  const totalSubjects = analyzedSubjects.length;
  const totalPendingHours = Math.round(
    analyzedSubjects.reduce((acc, s) => acc + s.estimatedHours, 0) * 10
  ) / 10;

  // Calculate upcoming deadlines (due within 7 days)
  const upcomingDeadlinesCount = analyzedSubjects.filter(
    (s) => s.daysRemaining >= 0 && s.daysRemaining <= 7
  ).length;

  // Available study hours before deadlines:
  // To avoid unrealistic scheduling, look at the earliest deadline or total 7-day study window
  const minDays = analyzedSubjects.length > 0
    ? Math.max(1, Math.min(...analyzedSubjects.map((s) => Math.max(0, s.daysRemaining))))
    : 7;

  // Available study hours in the upcoming critical window
  const totalAvailableStudyHours = Math.round(dailyAvailableStudyHours * minDays * 10) / 10;

  // Workload gap = pending work - available study hours before critical deadline
  const gapRaw = totalPendingHours - totalAvailableStudyHours;
  const workloadGap = Math.max(0, Math.round(gapRaw * 10) / 10);
  const hasGap = workloadGap > 0;

  let workloadGapExplanation = "";
  if (totalSubjects === 0) {
    workloadGapExplanation = "No subjects added yet. Add your courses and deadlines to analyze your workload.";
  } else if (hasGap) {
    workloadGapExplanation =
      `Your estimated pending workload (${totalPendingHours}h) exceeds your realistic available study time (${totalAvailableStudyHours}h) before the upcoming deadline. A workload gap of ${workloadGap} hours exists.`;
  } else {
    workloadGapExplanation =
      `Your available study time (${totalAvailableStudyHours}h) is sufficient to cover your pending academic workload (${totalPendingHours}h) before the upcoming deadlines.`;
  }

  // Derive "What Should I Do Now?"
  const recommendations: TaskRecommendation = {
    currentTopTask: null,
    nextRecommendedTask: null,
  };

  if (analyzedSubjects.length > 0) {
    const top = analyzedSubjects[0];
    const tasks = top.tasksRemaining.split(/[,;\n]/).map((t) => t.trim()).filter(Boolean);
    const specificTask = tasks.length > 0 ? tasks[0] : "Core Topic Review";

    recommendations.currentTopTask = {
      subjectName: top.name,
      taskDescription: specificTask,
      estimatedMinutes: Math.min(60, Math.round((top.estimatedHours * 60) / Math.max(1, tasks.length))),
      reason: top.priorityReason,
      priority: top.priority,
    };

    if (analyzedSubjects.length > 1) {
      const second = analyzedSubjects[1];
      const secondTasks = second.tasksRemaining.split(/[,;\n]/).map((t) => t.trim()).filter(Boolean);
      const secondSpecificTask = secondTasks.length > 0 ? secondTasks[0] : "Problem Practice";

      recommendations.nextRecommendedTask = {
        subjectName: second.name,
        taskDescription: secondSpecificTask,
        estimatedMinutes: Math.min(45, Math.round((second.estimatedHours * 60) / Math.max(1, secondTasks.length))),
        reason: second.priorityReason,
        priority: second.priority,
      };
    }
  }

  return {
    analyzedSubjects,
    summary: {
      totalSubjects,
      totalPendingHours,
      totalAvailableStudyHours,
      workloadGap,
      workloadGapExplanation,
      hasGap,
      upcomingDeadlinesCount,
    },
    recommendations,
  };
}
