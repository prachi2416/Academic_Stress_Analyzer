/**
 * recommendations.ts — mirrors public/project/recommendations.py.
 * Contributing factors + personalized recommendations + 7-day action plan.
 *
 * NOTE: only the *advice* uses simple if/else on the raw inputs. The actual
 * Stress/Burnout scores always come from the Scikit-Fuzzy engine.
 */
import { INPUTS, type PredictionResult } from './fuzzyEngine';

const SLEEP_LOW = 6;
const STUDY_HIGH = 10;
const WORKLOAD_HIGH = 6;
const ATTENDANCE_LOW = 70;

type Severity = 'Low' | 'Medium' | 'High';

export interface Factor {
  factor: string;
  value: number | null;
  unit: string;
  severity: Severity;
  detail: string;
}

export interface Recommendation {
  title: string;
  detail: string;
}

export interface DayPlan {
  day: number;
  focus: string;
  tasks: string[];
}

export function contributingFactors(inputs: Record<string, number>): Factor[] {
  const factors: Factor[] = [];

  if (inputs.sleep < SLEEP_LOW) {
    const gap = Math.round((SLEEP_LOW - inputs.sleep) * 10) / 10;
    factors.push({
      factor: 'Low Sleep',
      value: inputs.sleep,
      unit: 'hrs',
      severity: inputs.sleep < 4 ? 'High' : 'Medium',
      detail: `Sleeping ${inputs.sleep}h is below the healthy minimum (~${SLEEP_LOW}h); a deficit of ${gap}h.`,
    });
  }
  if (inputs.study > STUDY_HIGH) {
    factors.push({
      factor: 'High Study Hours',
      value: inputs.study,
      unit: 'hrs',
      severity: inputs.study >= 12 ? 'High' : 'Medium',
      detail: `Studying ${inputs.study}h/day is well above the recommended focus budget (~${STUDY_HIGH}h).`,
    });
  }
  if (inputs.assignment > WORKLOAD_HIGH) {
    factors.push({
      factor: 'High Assignment Workload',
      value: inputs.assignment,
      unit: '/10',
      severity: inputs.assignment >= 8 ? 'High' : 'Medium',
      detail: `Workload rated ${inputs.assignment}/10 indicates a heavy pile of pending assignments.`,
    });
  }
  if (inputs.attendance < ATTENDANCE_LOW) {
    factors.push({
      factor: 'Low Attendance',
      value: inputs.attendance,
      unit: '%',
      severity: inputs.attendance < 50 ? 'High' : 'Medium',
      detail: `Attendance at ${inputs.attendance}% is below the ${ATTENDANCE_LOW}% expected for steady progress.`,
    });
  }
  if (factors.length === 0) {
    factors.push({
      factor: 'Balanced Profile',
      value: null,
      unit: '',
      severity: 'Low',
      detail: 'All inputs are within healthy ranges. Keep it up!',
    });
  }
  return factors;
}

export function recommendations(
  inputs: Record<string, number>,
  stressLevel: string,
  burnoutLevel: string
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (inputs.sleep < SLEEP_LOW) {
    recs.push({
      title: 'Improve your sleep routine',
      detail: 'Aim for 7-8 hours. Set a fixed bedtime, avoid screens 30 min before sleep, and cut caffeine after 4 PM.',
    });
  }
  if (inputs.study > STUDY_HIGH) {
    recs.push({
      title: 'Use shorter, focused study sessions',
      detail: 'Switch to Pomodoro (25 min focus + 5 min break). Spacing study blocks improves retention and lowers fatigue.',
    });
  }
  if (inputs.assignment > WORKLOAD_HIGH) {
    recs.push({
      title: 'Break assignments into smaller tasks',
      detail: 'Split each assignment into sub-tasks, prioritise by deadline, and tackle one piece at a time to avoid overload.',
    });
  }
  if (inputs.attendance < ATTENDANCE_LOW) {
    recs.push({
      title: 'Review missed classes & improve attendance',
      detail: 'Catch up on missed lectures using notes/recordings and commit to attending upcoming classes to stay on track.',
    });
  }
  if (stressLevel === 'High' || burnoutLevel === 'High') {
    recs.push({
      title: 'Reach out for support',
      detail: 'High stress/burnout levels were detected. Consider talking to a mentor, counsellor, or campus support service.',
    });
  }
  if (recs.length === 0) {
    recs.push({
      title: 'Maintain your healthy routine',
      detail: 'Your profile looks balanced. Keep monitoring your sleep and workload to stay in the green zone.',
    });
  }
  return recs;
}

export function actionPlan(
  inputs: Record<string, number>,
  stressLevel: string,
  burnoutLevel: string
): DayPlan[] {
  const lowSleep = inputs.sleep < SLEEP_LOW;
  const highStudy = inputs.study > STUDY_HIGH;
  const highLoad = inputs.assignment > WORKLOAD_HIGH;
  const lowAtt = inputs.attendance < ATTENDANCE_LOW;

  const plan: DayPlan[] = [];

  const d1: string[] = ['Audit your current weekly schedule (study, sleep, classes).'];
  if (lowSleep) d1.push('Set a fixed bedtime tonight targeting 7-8h of sleep.');
  if (highLoad) d1.push('List every pending assignment and rank by deadline.');
  plan.push({ day: 1, focus: 'Audit & plan', tasks: d1 });

  const d2: string[] = ['Begin a wind-down routine 45 min before bed (no screens).'];
  if (lowSleep) d2.push('Go to bed 30 min earlier than usual.');
  plan.push({ day: 2, focus: 'Sleep recovery', tasks: d2 });

  const d3: string[] = ['Try two Pomodoro focus blocks (25 min + 5 min break).'];
  if (highStudy) d3.push('Cap total study at 6 focused hours; rest the remainder.');
  plan.push({ day: 3, focus: 'Smarter study', tasks: d3 });

  const d4: string[] = ['Pick one assignment and break it into 3-5 sub-tasks.'];
  if (highLoad) d4.push('Complete the first sub-task of your hardest assignment.');
  plan.push({ day: 4, focus: 'Tame the workload', tasks: d4 });

  const d5: string[] = ['Attend all scheduled classes today.'];
  if (lowAtt) d5.push('Collect notes/recordings for 2 missed lectures and review them.');
  plan.push({ day: 5, focus: 'Attendance catch-up', tasks: d5 });

  const d6: string[] = ['Take a 20-30 min walk or light exercise.'];
  if (stressLevel === 'High' || stressLevel === 'Medium' || burnoutLevel === 'High' || burnoutLevel === 'Medium') {
    d6.push('Do a 5-minute breathing/relaxation exercise.');
  }
  plan.push({ day: 6, focus: 'Active rest', tasks: d6 });

  const d7: string[] = [
    'Re-assess your stress using this analyzer with updated inputs.',
    'Keep what worked this week; adjust one habit that did not.',
  ];
  plan.push({ day: 7, focus: 'Review & adjust', tasks: d7 });

  return plan;
}

export const FACTOR_THRESHOLDS = { SLEEP_LOW, STUDY_HIGH, WORKLOAD_HIGH, ATTENDANCE_LOW };

export function inputsList() {
  return INPUTS;
}

export type { PredictionResult };
