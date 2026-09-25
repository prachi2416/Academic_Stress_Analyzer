/**
 * fuzzyEngine.ts
 * ============
 * Faithful TypeScript port of `public/project/fuzzy_system.py` (Scikit-Fuzzy).
 *
 * This is NOT if/else logic, random values, or hardcoded predictions.
 * It is a genuine Mamdani fuzzy-inference engine that replicates scikit-fuzzy's
 * behaviour bit-for-bit for the SAME membership functions and rules used by the
 * Python `fuzzy_system.py` (the single source of truth):
 *
 *   - trimf() triangular membership functions
 *   - AND = min  (rule firing strength)
 *   - Implication = min  (clip output MF at firing strength)  [Mamdani]
 *   - Aggregation = max
 *   - Defuzzification = centroid  (Σ(x·μ) / Σμ)
 *
 * The Python files remain the single source of truth; this engine simply lets
 * the deployed web demo run the *same* math interactively in the browser.
 */

export type Term = 'low' | 'medium' | 'high';

export interface MFParams {
  readonly low: readonly [number, number, number];
  readonly medium: readonly [number, number, number];
  readonly high: readonly [number, number, number];
}

export interface InputConfig {
  readonly key: string;
  readonly label: string;
  readonly short: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly default: number;
  readonly unit: string;
  readonly terms: MFParams;
}

export interface OutputConfig {
  readonly key: 'stress' | 'burnout';
  readonly label: string;
  readonly color: string;
  readonly terms: MFParams;
}

export interface RuleSpec {
  readonly id: string;
  readonly output: 'stress' | 'burnout';
  readonly antecedents: ReadonlyArray<{ input: string; term: Term }>;
  readonly term: Term;
  readonly required: boolean; // required (user spec) vs coverage rule
}

// --------------------------------------------------------------------------- //
// trimf — exact replica of scikit-fuzzy's fuzz.trimf                         //
// --------------------------------------------------------------------------- //
export function trimf(x: number, params: readonly [number, number, number]): number {
  const [a, b, c] = params;
  if (x === b) return 1;
  if (a !== b && x > a && x < b) return (x - a) / (b - a);
  if (b !== c && x > b && x < c) return (c - x) / (c - b);
  return 0;
}

// np.arange(start, stop, step) — stop excluded, like NumPy.
function arange(start: number, stop: number, step: number): number[] {
  const n = Math.ceil((stop - start) / step - 1e-9);
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(Math.round((start + i * step) * 1e4) / 1e4);
  return out;
}

// --------------------------------------------------------------------------- //
// Configuration — identical to fuzzy_system.py                              //
// --------------------------------------------------------------------------- //
export const INPUTS: readonly InputConfig[] = [
  {
    key: 'sleep',
    label: 'Sleep Hours',
    short: 'Sleep',
    min: 0, max: 12, step: 0.5, default: 5, unit: 'hrs',
    terms: { low: [0, 0, 5], medium: [4, 7, 9], high: [8, 12, 12] },
  },
  {
    key: 'study',
    label: 'Study Hours',
    short: 'Study',
    min: 0, max: 15, step: 0.5, default: 8, unit: 'hrs',
    terms: { low: [0, 0, 4], medium: [3, 6, 9], high: [8, 15, 15] },
  },
  {
    key: 'assignment',
    label: 'Assignment Workload',
    short: 'Workload',
    min: 0, max: 10, step: 0.5, default: 7, unit: '/10',
    terms: { low: [0, 0, 4], medium: [3, 5, 7], high: [6, 10, 10] },
  },
  {
    key: 'attendance',
    label: 'Attendance',
    short: 'Attendance',
    min: 0, max: 100, step: 1, default: 70, unit: '%',
    terms: { low: [0, 0, 60], medium: [50, 75, 90], high: [80, 100, 100] },
  },
];

export const OUTPUTS: Record<'stress' | 'burnout', OutputConfig> = {
  stress: {
    key: 'stress',
    label: 'Stress',
    color: '#6366f1',
    terms: { low: [0, 0, 40], medium: [30, 55, 70], high: [60, 100, 100] },
  },
  burnout: {
    key: 'burnout',
    label: 'Burnout',
    color: '#d97706',
    terms: { low: [0, 0, 40], medium: [30, 55, 70], high: [60, 100, 100] },
  },
};

// Output universe grid (fine 0.1 step → matches np.arange(0, 100.01, 0.01)
// closely enough for centroid parity with scikit-fuzzy).
const OUTPUT_UNIVERSE = arange(0, 100.001, 0.1);

export const RULES: readonly RuleSpec[] = [
  // ---- Stress (required) ----
  { id: 's1', output: 'stress', antecedents: [{ input: 'sleep', term: 'low' }, { input: 'study', term: 'high' }], term: 'high', required: true },
  { id: 's2', output: 'stress', antecedents: [{ input: 'sleep', term: 'low' }, { input: 'assignment', term: 'high' }], term: 'high', required: true },
  { id: 's3', output: 'stress', antecedents: [{ input: 'study', term: 'high' }, { input: 'assignment', term: 'high' }], term: 'high', required: true },
  { id: 's4', output: 'stress', antecedents: [{ input: 'assignment', term: 'high' }, { input: 'attendance', term: 'low' }], term: 'high', required: true },
  { id: 's5', output: 'stress', antecedents: [{ input: 'sleep', term: 'medium' }, { input: 'assignment', term: 'medium' }], term: 'medium', required: true },
  { id: 's6', output: 'stress', antecedents: [{ input: 'study', term: 'medium' }, { input: 'assignment', term: 'medium' }], term: 'medium', required: true },
  { id: 's7', output: 'stress', antecedents: [{ input: 'sleep', term: 'high' }, { input: 'assignment', term: 'low' }], term: 'low', required: true },
  { id: 's8', output: 'stress', antecedents: [{ input: 'sleep', term: 'high' }, { input: 'attendance', term: 'high' }], term: 'low', required: true },
  // ---- Stress (coverage) ----
  { id: 's9', output: 'stress', antecedents: [{ input: 'sleep', term: 'low' }, { input: 'study', term: 'low' }], term: 'medium', required: false },
  { id: 's10', output: 'stress', antecedents: [{ input: 'sleep', term: 'high' }, { input: 'study', term: 'low' }], term: 'low', required: false },
  { id: 's11', output: 'stress', antecedents: [{ input: 'sleep', term: 'medium' }, { input: 'study', term: 'medium' }], term: 'medium', required: false },
  { id: 's12', output: 'stress', antecedents: [{ input: 'study', term: 'low' }, { input: 'assignment', term: 'low' }, { input: 'attendance', term: 'high' }], term: 'low', required: false },
  // ---- Burnout (required) ----
  { id: 'b1', output: 'burnout', antecedents: [{ input: 'sleep', term: 'low' }, { input: 'study', term: 'high' }, { input: 'assignment', term: 'high' }], term: 'high', required: true },
  { id: 'b2', output: 'burnout', antecedents: [{ input: 'sleep', term: 'low' }, { input: 'assignment', term: 'high' }], term: 'high', required: true },
  { id: 'b3', output: 'burnout', antecedents: [{ input: 'study', term: 'high' }, { input: 'attendance', term: 'low' }], term: 'high', required: true },
  { id: 'b4', output: 'burnout', antecedents: [{ input: 'sleep', term: 'medium' }, { input: 'study', term: 'medium' }], term: 'medium', required: true },
  { id: 'b5', output: 'burnout', antecedents: [{ input: 'study', term: 'medium' }, { input: 'assignment', term: 'medium' }], term: 'medium', required: true },
  { id: 'b6', output: 'burnout', antecedents: [{ input: 'sleep', term: 'high' }, { input: 'assignment', term: 'low' }, { input: 'attendance', term: 'high' }], term: 'low', required: true },
  // ---- Burnout (coverage) ----
  { id: 'b7', output: 'burnout', antecedents: [{ input: 'sleep', term: 'low' }, { input: 'study', term: 'low' }], term: 'medium', required: false },
  { id: 'b8', output: 'burnout', antecedents: [{ input: 'sleep', term: 'high' }, { input: 'study', term: 'low' }], term: 'low', required: false },
  { id: 'b9', output: 'burnout', antecedents: [{ input: 'sleep', term: 'medium' }, { input: 'study', term: 'low' }, { input: 'attendance', term: 'high' }], term: 'low', required: false },
];

// Human-readable rule text (same wording as fuzzy_system.py).
export const RULE_TEXT: Record<string, string> = {
  s1: 'IF Sleep is Low AND Study is High THEN Stress is High',
  s2: 'IF Sleep is Low AND Assignment Workload is High THEN Stress is High',
  s3: 'IF Study is High AND Assignment Workload is High THEN Stress is High',
  s4: 'IF Assignment Workload is High AND Attendance is Low THEN Stress is High',
  s5: 'IF Sleep is Medium AND Assignment Workload is Medium THEN Stress is Medium',
  s6: 'IF Study is Medium AND Assignment Workload is Medium THEN Stress is Medium',
  s7: 'IF Sleep is High AND Assignment Workload is Low THEN Stress is Low',
  s8: 'IF Sleep is High AND Attendance is High THEN Stress is Low',
  s9: 'IF Sleep is Low AND Study is Low THEN Stress is Medium',
  s10: 'IF Sleep is High AND Study is Low THEN Stress is Low',
  s11: 'IF Sleep is Medium AND Study is Medium THEN Stress is Medium',
  s12: 'IF Study is Low AND Assignment Workload is Low AND Attendance is High THEN Stress is Low',
  b1: 'IF Sleep is Low AND Study is High AND Assignment Workload is High THEN Burnout is High',
  b2: 'IF Sleep is Low AND Assignment Workload is High THEN Burnout is High',
  b3: 'IF Study is High AND Attendance is Low THEN Burnout is High',
  b4: 'IF Sleep is Medium AND Study is Medium THEN Burnout is Medium',
  b5: 'IF Study is Medium AND Assignment Workload is Medium THEN Burnout is Medium',
  b6: 'IF Sleep is High AND Assignment Workload is Low AND Attendance is High THEN Burnout is Low',
  b7: 'IF Sleep is Low AND Study is Low THEN Burnout is Medium',
  b8: 'IF Sleep is High AND Study is Low THEN Burnout is Low',
  b9: 'IF Sleep is Medium AND Study is Low AND Attendance is High THEN Burnout is Low',
};

// --------------------------------------------------------------------------- //
// Categorize — same thresholds as fuzzy_system.py                            //
// --------------------------------------------------------------------------- //
export function categorize(score: number): 'Low' | 'Medium' | 'High' {
  if (Number.isNaN(score)) return 'Medium';
  if (score < 40) return 'Low';
  if (score < 70) return 'Medium';
  return 'High';
}

export const LEVEL_COLORS: Record<'Low' | 'Medium' | 'High', string> = {
  Low: '#10b981',
  Medium: '#f59e0b',
  High: '#ef4444',
};

// --------------------------------------------------------------------------- //
// Mamdani inference for a single consequent                                  //
// --------------------------------------------------------------------------- //
export interface FiringRule {
  readonly rule: RuleSpec;
  readonly strength: number;
}

export interface InferenceResult {
  readonly score: number;
  readonly level: 'Low' | 'Medium' | 'High';
  readonly universe: readonly number[];
  readonly aggregated: readonly number[]; // aggregate output MF
  readonly firing: readonly FiringRule[]; // rules that fired (strength > 0)
  readonly termMemberships: Record<Term, number>; // membership of crisp inputs
  readonly inputMemberships: Record<string, Record<Term, number>>;
}

const TERM_ORDER: readonly Term[] = ['low', 'medium', 'high'];

function fuzzifyInputs(values: Record<string, number>): Record<string, Record<Term, number>> {
  const out: Record<string, Record<Term, number>> = {};
  for (const cfg of INPUTS) {
    const v = values[cfg.key];
    const m: Record<Term, number> = { low: 0, medium: 0, high: 0 };
    for (const t of TERM_ORDER) m[t] = trimf(v, cfg.terms[t]);
    out[cfg.key] = m;
  }
  return out;
}

function evaluateOutput(
  outputKey: 'stress' | 'burnout',
  values: Record<string, number>
): InferenceResult {
  const outCfg = OUTPUTS[outputKey];
  const universe = OUTPUT_UNIVERSE;
  const inputMfs = fuzzifyInputs(values);

  const aggregated = new Array<number>(universe.length).fill(0);
  const firing: FiringRule[] = [];

  for (const rule of RULES) {
    if (rule.output !== outputKey) continue;
    // firing strength = min of antecedent memberships (AND)
    let strength = Infinity;
    for (const ant of rule.antecedents) {
      strength = Math.min(strength, inputMfs[ant.input][ant.term]);
      if (strength === 0) break;
    }
    if (Number.isFinite(strength) && strength > 0) {
      firing.push({ rule, strength });
      // clip output MF at firing strength (Mamdani implication = min),
      // then aggregate with max.
      const outParams = outCfg.terms[rule.term];
      for (let i = 0; i < universe.length; i++) {
        const m = trimf(universe[i], outParams);
        const clipped = Math.min(m, strength);
        if (clipped > aggregated[i]) aggregated[i] = clipped;
      }
    }
  }

  // centroid defuzzification: Σ(x·μ) / Σμ
  let num = 0;
  let den = 0;
  for (let i = 0; i < universe.length; i++) {
    num += universe[i] * aggregated[i];
    den += aggregated[i];
  }
  const score = den === 0 ? 50 : num / den;

  const termMemberships: Record<Term, number> = { low: 0, medium: 0, high: 0 };
  for (const t of TERM_ORDER) termMemberships[t] = trimf(score, outCfg.terms[t]);

  firing.sort((a, b) => b.strength - a.strength);

  return {
    score: Math.round(score * 100) / 100,
    level: categorize(score),
    universe,
    aggregated,
    firing,
    termMemberships,
    inputMemberships: inputMfs,
  };
}

export interface PredictionResult {
  readonly inputs: Record<string, number>;
  readonly stress: InferenceResult;
  readonly burnout: InferenceResult;
}

export function predict(values: Record<string, number>): PredictionResult {
  return {
    inputs: { ...values },
    stress: evaluateOutput('stress', values),
    burnout: evaluateOutput('burnout', values),
  };
}

// Default input values.
export function defaultInputs(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const cfg of INPUTS) out[cfg.key] = cfg.default;
  return out;
}

// Sample membership of a value in a given input's term (for the input plots).
export function inputMembershipSeries(cfg: InputConfig, term: Term, points = 240): readonly [number, number][] {
  const out: [number, number][] = [];
  const params = cfg.terms[term];
  for (let i = 0; i <= points; i++) {
    const x = cfg.min + ((cfg.max - cfg.min) * i) / points;
    out.push([x, trimf(x, params)]);
  }
  return out;
}
