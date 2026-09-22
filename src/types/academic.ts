export type SubjectType = "Exam" | "Assignment" | "Project" | "Other";
export type Level = "Low" | "Medium" | "High";
export type PriorityLevel = "Very High" | "High" | "Medium" | "Low";

export interface FixedCommitment {
  id: string;
  name: string;
  start: string; // "HH:MM" 24h
  end: string;   // "HH:MM" 24h
}

export interface DailyRoutine {
  wakeTime: string;      // "07:00"
  sleepTime: string;     // "23:30"
  collegeStart: string;  // "09:00"
  collegeEnd: string;    // "16:00"
  travelMinutes: number; // e.g. 60 min (1 hr total)
  mealMinutes: number;   // e.g. 90 min (1.5 hr total)
  fixedCommitments: FixedCommitment[];
}

export interface RoutineSummary {
  sleepHours: number;
  collegeHours: number;
  travelHours: number;
  mealHours: number;
  fixedCommitmentHours: number;
  totalProtectedHours: number;
  availableStudyHours: number;
  isValid: boolean;
  validationError?: string;
}

export interface Subject {
  id: string;
  name: string;
  deadline: string; // "YYYY-MM-DD"
  type: SubjectType;
  tasksRemaining: string; // e.g. "Chapter 3, Assignment 2" or "3 topics"
  estimatedHours: number;
  difficulty: Level;
  preparation: Level;
  importance: Level;
  createdAt?: number;
}

export interface SubjectWithAnalysis extends Subject {
  daysRemaining: number;
  urgencyLevel: "Immediate" | "Urgent" | "Moderate" | "Relaxed";
  availableStudyTimeBeforeDeadline: number;
  priority: PriorityLevel;
  priorityScore: number;
  priorityReason: string;
}

export interface WorkloadSummary {
  totalSubjects: number;
  totalPendingHours: number;
  totalAvailableStudyHours: number;
  workloadGap: number;
  workloadGapExplanation: string;
  hasGap: boolean;
  upcomingDeadlinesCount: number;
}

export interface TaskRecommendation {
  currentTopTask: {
    subjectName: string;
    taskDescription: string;
    estimatedMinutes: number;
    reason: string;
    priority: PriorityLevel;
  } | null;
  nextRecommendedTask: {
    subjectName: string;
    taskDescription: string;
    estimatedMinutes: number;
    reason: string;
    priority: PriorityLevel;
  } | null;
}

export type ScheduleBlockType =
  | "sleep"
  | "college"
  | "travel"
  | "meal"
  | "commitment"
  | "study"
  | "break";

export interface DailyScheduleBlock {
  id: string;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  type: ScheduleBlockType;
  title: string;
  subtitle?: string;
  priority?: PriorityLevel;
  durationMinutes: number;
}

export interface DayPlanResult {
  blocks: DailyScheduleBlock[];
  totalStudyMinutes: number;
  totalStudyHours: number;
  allocatedSubjectHours: Record<string, number>;
  unallocatedWorkloadHours: number;
  hasWorkloadGap: boolean;
  gapHours: number;
  explanation: string;
}

export type DailyPlanResult = DayPlanResult;

export interface ValidationError {
  field: string;
  message: string;
}
