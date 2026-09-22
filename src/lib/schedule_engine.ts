import type {
  DailyPlanResult, DailyRoutine, DailyScheduleBlock,
  SubjectWithAnalysis
} from "../types/academic.ts";
import {
  calculateDurationMinutes, timeToMinutes
} from "./validation.ts";
import {
  calculateRoutineSummary, getAvailableStudyWindows
} from "./routine_engine.ts";

function minutesToTime(m: number): string {
  const norm = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const min = norm % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

/**
 * Generates a realistic, priority-based daily plan allocating study blocks to highest priority tasks.
 * Protects Sleep, College, Travel, Meals, and Fixed Commitments.
 */
export function generateDailyPlan(
  routine: DailyRoutine,
  analyzedSubjects: SubjectWithAnalysis[]
): DailyPlanResult {
  const summary = calculateRoutineSummary(routine);
  if (!summary.isValid || summary.availableStudyHours <= 0) {
    return {
      blocks: [],
      totalStudyMinutes: 0,
      totalStudyHours: 0,
      allocatedSubjectHours: {},
      unallocatedWorkloadHours: analyzedSubjects.reduce((acc, s) => acc + s.estimatedHours, 0),
      hasWorkloadGap: true,
      gapHours: summary.availableStudyHours <= 0 ? 24 : 0,
      explanation: summary.validationError || "Routine does not leave realistic study hours.",
    };
  }

  // Get available study windows
  const freeWindows = getAvailableStudyWindows(routine);

  // Filter subjects with remaining work and sort by priority score descending
  const subjectsQueue = [...analyzedSubjects]
    .filter((s) => s.estimatedHours > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const allocatedSubjectMinutes: Record<string, number> = {};
  const studyBlocks: DailyScheduleBlock[] = [];

  // Track subject remaining needed minutes for today (target max ~2-3 hours per subject per day for realistic pacing)
  const remainingMinutesMap = new Map<string, number>();
  for (const s of subjectsQueue) {
    // Student can do at most 3 hours of one subject in a single day to avoid burnout
    const dailyTargetMinutes = Math.min(180, Math.round(s.estimatedHours * 60));
    remainingMinutesMap.set(s.id, dailyTargetMinutes);
  }

  // Allocate free windows to subjects
  let subjectIdx = 0;

  for (let wIdx = 0; wIdx < freeWindows.length; wIdx++) {
    const win = freeWindows[wIdx];
    let winRemaining = win.durationMinutes;
    let currentStart = win.startMinutes;

    while (winRemaining >= 25 && subjectsQueue.length > 0) {
      // Find next subject that still needs study time today
      let attempts = 0;
      while (
        attempts < subjectsQueue.length &&
        (remainingMinutesMap.get(subjectsQueue[subjectIdx].id) ?? 0) <= 0
      ) {
        subjectIdx = (subjectIdx + 1) % subjectsQueue.length;
        attempts++;
      }

      if (attempts >= subjectsQueue.length) {
        // All subjects have received their daily target
        break;
      }

      const activeSubject = subjectsQueue[subjectIdx];
      const subjectNeeded = remainingMinutesMap.get(activeSubject.id) ?? 0;

      // Plan focused session: 30 to 60 minutes
      const sessionMinutes = Math.min(60, Math.min(winRemaining, subjectNeeded));

      const sessionEnd = currentStart + sessionMinutes;
      studyBlocks.push({
        id: `study-${wIdx}-${currentStart}`,
        startTime: minutesToTime(currentStart),
        endTime: minutesToTime(sessionEnd),
        type: "study",
        title: activeSubject.name,
        subtitle: `Focus: ${activeSubject.tasksRemaining.split(/[,;\n]/)[0] || "Core Review"} (${activeSubject.priority} Priority)`,
        priority: activeSubject.priority,
        durationMinutes: sessionMinutes,
      });

      allocatedSubjectMinutes[activeSubject.name] =
        (allocatedSubjectMinutes[activeSubject.name] || 0) + sessionMinutes;
      remainingMinutesMap.set(activeSubject.id, Math.max(0, subjectNeeded - sessionMinutes));

      winRemaining -= sessionMinutes;
      currentStart = sessionEnd;

      // If more than 35 mins still remain in this window, insert a short 10-min break
      if (winRemaining >= 35) {
        const breakMinutes = 10;
        const breakEnd = currentStart + breakMinutes;
        studyBlocks.push({
          id: `break-${wIdx}-${currentStart}`,
          startTime: minutesToTime(currentStart),
          endTime: minutesToTime(breakEnd),
          type: "break",
          title: "Rest & Hydration Break",
          subtitle: "10-minute mental refresh (Pomodoro rhythm)",
          durationMinutes: breakMinutes,
        });
        winRemaining -= breakMinutes;
        currentStart = breakEnd;
      }

      // Rotate to next subject to promote interleaved learning
      subjectIdx = (subjectIdx + 1) % subjectsQueue.length;
    }
  }

  // Now assemble full day chronological blocks
  const allBlocks: DailyScheduleBlock[] = [];

  // Sleep block
  allBlocks.push({
    id: "block-sleep",
    startTime: routine.sleepTime,
    endTime: routine.wakeTime,
    type: "sleep",
    title: "Night Sleep",
    subtitle: `Protected sleep window (${summary.sleepHours} hrs)`,
    durationMinutes: calculateDurationMinutes(routine.sleepTime, routine.wakeTime),
  });

  // College block
  allBlocks.push({
    id: "block-college",
    startTime: routine.collegeStart,
    endTime: routine.collegeEnd,
    type: "college",
    title: "College & Academic Lectures",
    subtitle: `Scheduled classes (${summary.collegeHours} hrs)`,
    durationMinutes: calculateDurationMinutes(routine.collegeStart, routine.collegeEnd),
  });

  // Fixed commitments
  routine.fixedCommitments.forEach((c) => {
    allBlocks.push({
      id: `block-comm-${c.id}`,
      startTime: c.start,
      endTime: c.end,
      type: "commitment",
      title: c.name,
      subtitle: "Protected commitment",
      durationMinutes: calculateDurationMinutes(c.start, c.end),
    });
  });

  // Add study and break blocks
  studyBlocks.forEach((sb) => allBlocks.push(sb));

  // Sort blocks chronologically starting from wake time
  const wakeMin = timeToMinutes(routine.wakeTime);
  allBlocks.sort((a, b) => {
    const aStart = (timeToMinutes(a.startTime) - wakeMin + 1440) % 1440;
    const bStart = (timeToMinutes(b.startTime) - wakeMin + 1440) % 1440;
    return aStart - bStart;
  });

  // Metrics
  const totalStudyMinutes = Object.values(allocatedSubjectMinutes).reduce((a, b) => a + b, 0);
  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

  const allocatedSubjectHours: Record<string, number> = {};
  for (const [name, min] of Object.entries(allocatedSubjectMinutes)) {
    allocatedSubjectHours[name] = Math.round((min / 60) * 10) / 10;
  }

  const totalPendingWorkload = analyzedSubjects.reduce((acc, s) => acc + s.estimatedHours, 0);
  const unallocatedWorkloadHours = Math.max(0, Math.round((totalPendingWorkload - totalStudyHours) * 10) / 10);
  const hasWorkloadGap = unallocatedWorkloadHours > 0;

  let explanation = "";
  if (analyzedSubjects.length === 0) {
    explanation = "No pending subjects to schedule. Enjoy your balanced routine!";
  } else if (hasWorkloadGap) {
    explanation = `Today's plan schedules ${totalStudyHours} hours of focused study across your highest-priority subjects. An overall pending workload of ${unallocatedWorkloadHours} hours remains for upcoming days. Intended sleep (${summary.sleepHours}h) and college hours are fully protected.`;
  } else {
    explanation = `All estimated pending academic work (${totalStudyHours}h) is comfortably scheduled today without infringing on your sleep or college commitments.`;
  }

  return {
    blocks: allBlocks,
    totalStudyMinutes,
    totalStudyHours,
    allocatedSubjectHours,
    unallocatedWorkloadHours,
    hasWorkloadGap,
    gapHours: unallocatedWorkloadHours,
    explanation,
  };
}
