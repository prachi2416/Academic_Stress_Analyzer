
type MF = (x: number) => number;

const tri = (a: number, b: number, c: number): MF => (x: number) => {
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
};

// ---------- Antecedent membership functions ----------
const sleepMF = {
  low:    tri(0, 0, 5),
  medium: tri(4, 7, 9),
  high:   tri(8, 12, 12),
};
const studyMF = {
  low:    tri(0, 0, 4),
  medium: tri(3, 6, 9),
  high:   tri(8, 15, 15),
};
const assignMF = {
  low:    tri(0, 0, 4),
  medium: tri(3, 5, 7),
  high:   tri(6, 10, 10),
};
const attendMF = {
  low:    tri(0, 0, 60),
  medium: tri(50, 75, 90),
  high:   tri(80, 100, 100),
};

// ---------- Consequent membership functions (shared for stress & burnout) ----------
const outMF = {
  low:    tri(0, 0, 40),
  medium: tri(30, 50, 70),
  high:   tri(60, 100, 100),
};

type OutTerm = "low" | "medium" | "high";

interface Rule {
  antecedents: number[];   // firing strengths of each antecedent clause
  consequent: OutTerm;
}

const stressRules = (s: Record<string, number>, st: Record<string, number>,
                     a: Record<string, number>, at: Record<string, number>): Rule[] => [
  { antecedents: [s.low, a.high],                   consequent: "high"   },
  { antecedents: [s.low, st.high],                  consequent: "high"   },
  { antecedents: [st.high, a.high],                 consequent: "high"   },
  { antecedents: [s.low, at.low],                   consequent: "high"   },
  { antecedents: [a.high, at.low],                  consequent: "high"   },
  { antecedents: [s.low, st.high, a.high],          consequent: "high"   },
  { antecedents: [s.medium, a.medium],              consequent: "medium" },
  { antecedents: [st.medium, a.medium],             consequent: "medium" },
  { antecedents: [s.medium, st.high],               consequent: "medium" },
  { antecedents: [s.medium, at.medium],             consequent: "medium" },
  { antecedents: [a.medium, at.medium],             consequent: "medium" },
  { antecedents: [s.high, a.high],                  consequent: "medium" },
  { antecedents: [s.low, a.medium],                 consequent: "medium" },
  { antecedents: [s.high, a.low],                   consequent: "low"    },
  { antecedents: [s.high, st.low, at.high],         consequent: "low"    },
  { antecedents: [s.high, st.medium, a.low],        consequent: "low"    },
  { antecedents: [s.medium, a.low, at.high],        consequent: "low"    },
];

const burnoutRules = (s: Record<string, number>, st: Record<string, number>,
                      a: Record<string, number>, at: Record<string, number>): Rule[] => [
  { antecedents: [s.low, st.high, a.high],          consequent: "high"   },
  { antecedents: [s.low, a.high, at.low],           consequent: "high"   },
  { antecedents: [s.low, st.high, at.low],          consequent: "high"   },
  { antecedents: [s.low, at.low],                   consequent: "high"   },
  { antecedents: [st.high, a.high, at.low],         consequent: "high"   },
  { antecedents: [s.low, a.medium],                 consequent: "medium" },
  { antecedents: [s.medium, a.high],                consequent: "medium" },
  { antecedents: [st.high, a.medium],               consequent: "medium" },
  { antecedents: [st.medium, a.high],               consequent: "medium" },
  { antecedents: [s.low, st.medium],                consequent: "medium" },
  { antecedents: [s.medium, at.low],                consequent: "medium" },
  { antecedents: [s.high, a.low],                   consequent: "low"    },
  { antecedents: [s.high, st.low],                  consequent: "low"    },
  { antecedents: [s.high, at.high, a.low],          consequent: "low"    },
  { antecedents: [s.medium, a.low, at.high],        consequent: "low"    },
];

function inferMamdani(rules: Rule[]): number {
  const N = 101;
  const aggregated = new Array<number>(N).fill(0);

  for (const r of rules) {
    const fire = Math.min(...r.antecedents);
    if (fire <= 0) continue;
    const mf = outMF[r.consequent];
    for (let i = 0; i < N; i++) {
      const clipped = Math.min(fire, mf(i));
      if (clipped > aggregated[i]) aggregated[i] = clipped;
    }
  }

  // Centroid defuzzification
  let num = 0;
  let den = 0;
  for (let i = 0; i < N; i++) {
    num += i * aggregated[i];
    den += aggregated[i];
  }
  if (den === 0) return 50; // graceful fallback
  return num / den;
}

export interface FuzzyInputs {
  sleep: number;
  study: number;
  assignments: number;
  attendance: number;
}

export interface FuzzyResult {
  stressScore: number;
  stressLevel: "Low" | "Medium" | "High";
  burnoutScore: number;
  burnoutRisk: "Low" | "Medium" | "High";
  degrees: {
    sleep: Record<string, number>;
    study: Record<string, number>;
    assignments: Record<string, number>;
    attendance: Record<string, number>;
  };
}

const cat = (v: number): "Low" | "Medium" | "High" =>
  v < 40 ? "Low" : v < 65 ? "Medium" : "High";

export function analyze(inputs: FuzzyInputs): FuzzyResult {
  const s  = { low: sleepMF.low(inputs.sleep),  medium: sleepMF.medium(inputs.sleep),  high: sleepMF.high(inputs.sleep) };
  const st = { low: studyMF.low(inputs.study),  medium: studyMF.medium(inputs.study),  high: studyMF.high(inputs.study) };
  const a  = { low: assignMF.low(inputs.assignments), medium: assignMF.medium(inputs.assignments), high: assignMF.high(inputs.assignments) };
  const at = { low: attendMF.low(inputs.attendance),  medium: attendMF.medium(inputs.attendance),  high: attendMF.high(inputs.attendance) };

  const stressScore  = inferMamdani(stressRules(s, st, a, at));
  const burnoutScore = inferMamdani(burnoutRules(s, st, a, at));

  return {
    stressScore,
    stressLevel: cat(stressScore),
    burnoutScore,
    burnoutRisk: cat(burnoutScore),
    degrees: { sleep: s, study: st, assignments: a, attendance: at },
  };
}

export function recommendations(inputs: FuzzyInputs, result: FuzzyResult): string[] {
  const tips: string[] = [];
  const { sleep, study, assignments, attendance } = inputs;

  if (sleep < 6)  tips.push("😴 Your sleep is below the healthy range. Aim for 7–8 hours a night to lower cortisol and improve concentration.");
  else if (sleep > 9) tips.push("⏰ Over-sleeping (>9h) can indicate fatigue. Try a consistent 7–8h routine.");

  if (study > 9)  tips.push("📖 Study hours are very high. Break sessions with the Pomodoro method (25 min work / 5 min break).");
  else if (study < 3) tips.push("📚 Study time is low. Even 2–3 focused sessions per day help prevent last-minute exam pressure.");

  if (assignments >= 7) tips.push("🗂️ Assignment workload is high. Prioritise using an Eisenhower matrix and speak to faculty about deadline overlap.");
  if (attendance < 65)  tips.push("🏫 Low attendance creates learning gaps that snowball into stress. Aim for at least 75%.");

  if (result.stressLevel === "High")  tips.push("🧘 Stress score is HIGH. Add 10–15 min of daily mindfulness or exercise, and talk to a mentor.");
  if (result.burnoutRisk === "High")  tips.push("🚨 Burnout risk is HIGH. Schedule at least one full recovery day this week with no academic work.");
  if (result.stressLevel === "Low" && result.burnoutRisk === "Low")
    tips.push("✅ You are in a healthy zone. Keep your current routine and re-evaluate weekly.");

  if (tips.length === 0) tips.push("🧠 Your inputs are balanced. Maintain regular sleep, study, and attendance rhythms.");
  return tips;
}

export const STRESS_RULES_TEXT = [
  "IF sleep is LOW AND assignments is HIGH  →  stress is HIGH",
  "IF sleep is LOW AND study is HIGH        →  stress is HIGH",
  "IF study is HIGH AND assignments is HIGH →  stress is HIGH",
  "IF sleep is LOW AND attendance is LOW    →  stress is HIGH",
  "IF assignments is HIGH AND attendance is LOW → stress is HIGH",
  "IF sleep is MEDIUM AND assignments is MEDIUM → stress is MEDIUM",
  "IF study is MEDIUM AND assignments is MEDIUM → stress is MEDIUM",
  "IF sleep is MEDIUM AND study is HIGH     →  stress is MEDIUM",
  "IF sleep is HIGH AND assignments is HIGH →  stress is MEDIUM",
  "IF sleep is HIGH AND assignments is LOW  →  stress is LOW",
  "IF sleep is HIGH AND study is LOW AND attendance is HIGH → stress is LOW",
  "IF sleep is MEDIUM AND assignments is LOW AND attendance is HIGH → stress is LOW",
];

export const BURNOUT_RULES_TEXT = [
  "IF sleep is LOW AND study is HIGH AND assignments is HIGH  →  burnout is HIGH",
  "IF sleep is LOW AND assignments is HIGH AND attendance is LOW → burnout is HIGH",
  "IF sleep is LOW AND study is HIGH AND attendance is LOW   →  burnout is HIGH",
  "IF study is HIGH AND assignments is HIGH AND attendance is LOW → burnout is HIGH",
  "IF sleep is LOW AND assignments is MEDIUM  →  burnout is MEDIUM",
  "IF sleep is MEDIUM AND assignments is HIGH →  burnout is MEDIUM",
  "IF study is HIGH AND assignments is MEDIUM →  burnout is MEDIUM",
  "IF sleep is MEDIUM AND attendance is LOW   →  burnout is MEDIUM",
  "IF sleep is HIGH AND assignments is LOW    →  burnout is LOW",
  "IF sleep is HIGH AND study is LOW          →  burnout is LOW",
  "IF sleep is HIGH AND attendance is HIGH AND assignments is LOW → burnout is LOW",
];

export const MEMBERSHIP_TEXT: Record<string, Record<string, string>> = {
  "Sleep (hours/day)": {
    Low:    "0 – 5 hours",
    Medium: "4 – 9 hours (peak at 7)",
    High:   "8 – 12 hours",
  },
  "Study (hours/day)": {
    Low:    "0 – 4 hours",
    Medium: "3 – 9 hours (peak at 6)",
    High:   "8 – 15 hours",
  },
  "Assignments (0–10)": {
    Low:    "0 – 4",
    Medium: "3 – 7 (peak at 5)",
    High:   "6 – 10",
  },
  "Attendance (%)": {
    Low:    "0 – 60 %",
    Medium: "50 – 90 % (peak at 75)",
    High:   "80 – 100 %",
  },
  "Stress / Burnout (0–100)": {
    Low:    "0 – 40",
    Medium: "30 – 70 (peak at 50)",
    High:   "60 – 100",
  },
};
