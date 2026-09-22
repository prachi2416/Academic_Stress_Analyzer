import type { DailyRoutine, Subject } from "../types/academic.ts";
import { DEFAULT_ROUTINE } from "./routine_engine.ts";

const ROUTINE_KEY = "asa_daily_routine_v2";
const SUBJECTS_KEY = "asa_subjects_v2";

export const SAMPLE_SUBJECTS: Subject[] = [
  {
    id: "sub-1",
    name: "Machine Learning",
    deadline: getFutureDateStr(3),
    type: "Exam",
    tasksRemaining: "Neural Networks, Support Vector Machines, Decision Trees",
    estimatedHours: 10,
    difficulty: "High",
    preparation: "Low",
    importance: "High",
    createdAt: Date.now() - 3000,
  },
  {
    id: "sub-2",
    name: "Statistics & Probability",
    deadline: getFutureDateStr(5),
    type: "Assignment",
    tasksRemaining: "Hypothesis Testing & Regression Problem Set",
    estimatedHours: 6,
    difficulty: "Medium",
    preparation: "Medium",
    importance: "High",
    createdAt: Date.now() - 2000,
  },
  {
    id: "sub-3",
    name: "Database Management Systems",
    deadline: getFutureDateStr(8),
    type: "Project",
    tasksRemaining: "Normalization, Indexing & Final Report",
    estimatedHours: 8,
    difficulty: "Medium",
    preparation: "High",
    importance: "Medium",
    createdAt: Date.now() - 1000,
  },
  {
    id: "sub-4",
    name: "Python Programming",
    deadline: getFutureDateStr(14),
    type: "Assignment",
    tasksRemaining: "File I/O and Exception Handling Module",
    estimatedHours: 4,
    difficulty: "Low",
    preparation: "High",
    importance: "Low",
    createdAt: Date.now(),
  },
];

export function getFutureDateStr(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function loadRoutine(): DailyRoutine {
  try {
    const raw = localStorage.getItem(ROUTINE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.wakeTime === "string") {
        return parsed as DailyRoutine;
      }
    }
  } catch (err) {
    console.warn("Could not load routine from localStorage:", err);
  }
  return DEFAULT_ROUTINE;
}

export function saveRoutine(routine: DailyRoutine): void {
  try {
    localStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
  } catch (err) {
    console.warn("Could not save routine to localStorage:", err);
  }
}

export function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(SUBJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Subject[];
      }
    }
  } catch (err) {
    console.warn("Could not load subjects from localStorage:", err);
  }
  return SAMPLE_SUBJECTS;
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
  } catch (err) {
    console.warn("Could not save subjects to localStorage:", err);
  }
}
