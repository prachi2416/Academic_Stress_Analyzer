import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Activity,
  Flame,
  AlertTriangle,
  Lightbulb,
  CalendarDays,
  LineChart,
  ScrollText,
  FolderGit2,
  ArrowRight,
  Cpu,
  GitBranch,
  Crosshair,
} from 'lucide-react';
import { Container, Reveal, SectionHeading, LevelBadge, type Level } from '../components/ui';
import InputSlider from '../components/InputSlider';
import Gauge from '../components/Gauge';
import MembershipPlot from '../components/MembershipPlot';
import OutputView from '../components/OutputView';
import {
  predict,
  defaultInputs,
  INPUTS,
  OUTPUTS,
  RULE_TEXT,
  LEVEL_COLORS,
} from '../lib/fuzzyEngine';
import { contributingFactors, recommendations, actionPlan } from '../lib/recommendations';
import { PROJECT_FILES } from '../lib/projectFiles';

const PROFILES = [
  { name: 'Stressed', icon: '😤', values: { sleep: 4, study: 12, assignment: 8, attendance: 55 } },
  { name: 'Balanced', icon: '🙂', values: { sleep: 7.5, study: 6, assignment: 4, attendance: 85 } },
  { name: 'Relaxed', icon: '😌', values: { sleep: 9, study: 2, assignment: 2, attendance: 95 } },
];

const FACTOR_ICON: Record<string, string> = {
  'Low Sleep': '💤',
  'High Study Hours': '📚',
  'High Assignment Workload': '📝',
  'Low Attendance': '🏫',
  'Balanced Profile': '✅',
};

export default function Home() {
  const [inputs, setInputs] = useState<Record<string, number>>(defaultInputs());

  const result = useMemo(() => predict(inputs), [inputs]);
  const factors = useMemo(() => contributingFactors(inputs), [inputs]);
  const recs = useMemo(() => recommendations(inputs, result.stress.level, result.burnout.level), [inputs, result]);
  const plan = useMemo(() => actionPlan(inputs, result.stress.level, result.burnout.level), [inputs, result]);

  const setInput = (key: string, v: number) =>
    setInputs((prev) => ({ ...prev, [key]: v }));

  const firedStressIds = new Set(result.stress.firing.map((f) => f.rule.id));
  const firedBurnoutIds = new Set(result.burnout.firing.map((f) => f.rule.id));
  const strengthMap = new Map<string, number>();
  [...result.stress.firing, ...result.burnout.firing].forEach((f) =>
    strengthMap.set(f.rule.id, f.strength)
  );

  return (
    <div>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0b1020] via-[#131a35] to-[#1a1f3a] pt-28 pb-20 text-white">
        <div className="grid-pattern absolute inset-0 opacity-60" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl animate-float-slow" />
        <div
          className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl animate-float-slow"
          style={{ animationDelay: "2s" }}
        />

        <Container className="relative">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-200 backdrop-blur"
            >
              <Cpu size={14} /> Scikit-Fuzzy · Mamdani · Centroid
              Defuzzification
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl"
            >
              Smart Academic
              <span className="block bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                Stress Analyzer
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg"
            >
              A genuine fuzzy-inference system that predicts student{" "}
              <strong className="text-indigo-300">Stress</strong> &{" "}
              <strong className="text-amber-300">Burnout</strong> from four
              academic inputs — powered by{" "}
              <span className="font-mono text-indigo-200">scikit-fuzzy</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <button
                onClick={() =>
                  document
                    .getElementById("analyzer")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-xl shadow-indigo-500/20 transition hover:scale-[1.03] hover:bg-slate-100"
              >
                <Sparkles size={16} /> Try the analyzer
              </button>
              <Link
                to="/code"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
              >
                <FolderGit2 size={16} /> View project files
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400"
            ></motion.div>
          </div>
        </Container>
      </section>

      {/* ===================== ANALYZER ===================== */}
      <section id="analyzer" className="scroll-mt-20 py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={<>Live fuzzy demo</>}
              title="Interactive Stress & Burnout Analyzer"
              subtitle="Adjust the four academic inputs. Stress and Burnout are recomputed instantly through the Mamdani fuzzy engine — the same logic as fuzzy_system.py."
            />
          </Reveal>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold text-slate-400">
              Quick profiles:
            </span>
            {PROFILES.map((p) => (
              <button
                key={p.name}
                onClick={() => setInputs({ ...p.values })}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <span>{p.icon}</span> {p.name}
              </button>
            ))}
            <button
              onClick={() => setInputs(defaultInputs())}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.05fr]">
            {/* Sliders */}
            <Reveal>
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-indigo-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Student Inputs
                  </h3>
                </div>
                <div className="space-y-4">
                  {INPUTS.map((cfg) => (
                    <InputSlider
                      key={cfg.key}
                      cfg={cfg}
                      value={inputs[cfg.key]}
                      onChange={(v) => setInput(cfg.key, v)}
                    />
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Results */}
            <Reveal delay={0.1}>
              <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Brain size={18} className="text-violet-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Predicted Scores
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center rounded-2xl bg-slate-50 p-4">
                    <div className="mb-1 flex items-center gap-1.5 text-sm font-bold text-indigo-600">
                      <Activity size={14} /> Stress
                    </div>
                    <Gauge
                      score={result.stress.score}
                      level={result.stress.level}
                      label="Stress"
                      accent={OUTPUTS.stress.color}
                      size={190}
                    />
                  </div>
                  <div className="flex flex-col items-center rounded-2xl bg-slate-50 p-4">
                    <div className="mb-1 flex items-center gap-1.5 text-sm font-bold text-amber-600">
                      <Flame size={14} /> Burnout
                    </div>
                    <Gauge
                      score={result.burnout.score}
                      level={result.burnout.level}
                      label="Burnout"
                      accent={OUTPUTS.burnout.color}
                      size={190}
                    />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <ScoreBar
                    label="Stress"
                    score={result.stress.score}
                    level={result.stress.level}
                    accent={OUTPUTS.stress.color}
                  />
                  <ScoreBar
                    label="Burnout"
                    score={result.burnout.score}
                    level={result.burnout.level}
                    accent={OUTPUTS.burnout.color}
                  />
                </div>

                <div className="mt-auto grid grid-cols-3 gap-2 pt-5 text-center text-[11px] text-slate-400">
                  <div>
                    <span className="font-bold text-emerald-500">Low</span> &lt;
                    40
                  </div>
                  <div>
                    <span className="font-bold text-amber-500">Medium</span>{" "}
                    40–69.9
                  </div>
                  <div>
                    <span className="font-bold text-rose-500">High</span> ≥ 70
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ===================== FACTORS + RECS ===================== */}
      <section id="factors" className="scroll-mt-20 bg-white py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={<>Personalized advice</>}
              title="Contributing Factors & Recommendations"
              subtitle="The scores come from Scikit-Fuzzy. The advice below uses simple heuristics on your raw inputs to explain why and suggest what to do."
            />
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Contributing Factors
                  </h3>
                </div>
                <div className="space-y-3">
                  {factors.map((f, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-bold text-slate-800">
                          <span>{FACTOR_ICON[f.factor] ?? "•"}</span> {f.factor}
                        </span>
                        <LevelBadge level={f.severity} />
                      </div>
                      {f.value !== null && (
                        <div className="mt-1 font-mono text-xs text-slate-500">
                          {f.value} {f.unit}
                        </div>
                      )}
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {f.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Lightbulb size={18} className="text-indigo-500" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Personalized Recommendations
                  </h3>
                </div>
                <div className="space-y-3">
                  {recs.map((r, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                          {i + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800">
                            {r.title}
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            {r.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ===================== 7-DAY PLAN ===================== */}
      <section id="plan" className="scroll-mt-20 py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={<>Action plan</>}
              title="Simple 7-Day Action Plan"
              subtitle="A personalised week of small, concrete steps generated from your current profile."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {plan.map((day, i) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className={`rounded-2xl border p-4 ${i < 4 ? "lg:col-span-1" : ""}`}
                  style={{
                    borderColor: "#e2e8f0",
                    background: i % 2 === 0 ? "#fff" : "#f8fafc",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                      {day.day}
                    </span>
                    <CalendarDays size={15} className="text-slate-400" />
                  </div>
                  <div className="mt-3 text-sm font-bold text-slate-800">
                    {day.focus}
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {day.tasks.map((t, j) => (
                      <li
                        key={j}
                        className="flex gap-1.5 text-xs leading-snug text-slate-600"
                      >
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-indigo-400" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ===================== OUTPUT VIEWS ===================== */}
      <section id="outputs" className="scroll-mt-20 bg-white py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={<>Defuzzification</>}
              title="See the Fuzzy Output Take Shape"
              subtitle="The shaded area is the aggregated fuzzy set (max of clipped rule outputs). The crisp score is its centroid — shown as the vertical marker."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <OutputView result={result.stress} output={OUTPUTS.stress} />
              <OutputView result={result.burnout} output={OUTPUTS.burnout} />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ===================== MEMBERSHIP FUNCTIONS ===================== */}
      <section id="membership" className="scroll-mt-20 py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={<>Membership functions</>}
              title="Input & Output Membership Functions"
              subtitle="Triangular (trimf) membership functions. The dashed marker is your current input value — watch which terms it activates."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {INPUTS.map((cfg) => (
                <MembershipPlot
                  key={cfg.key}
                  cfg={cfg}
                  value={inputs[cfg.key]}
                />
              ))}
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-1 px-1 text-sm font-bold text-slate-800">
                  Stress (0–100)
                </div>
                <OutputViewInlineMini
                  outputKey="stress"
                  result={result.stress}
                />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-1 px-1 text-sm font-bold text-slate-800">
                  Burnout (0–100)
                </div>
                <OutputViewInlineMini
                  outputKey="burnout"
                  result={result.burnout}
                />
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ===================== RULES ===================== */}
      <section id="rules" className="scroll-mt-20 bg-white py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={<>Fuzzy rules · ctrl.Rule</>}
              title="The Rule Base"
              subtitle="Each rule uses AND (min firing strength). Rules highlighted in color are firing for your current inputs — the bar shows how strongly."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <RuleCard
                title="Stress rules"
                icon={<Activity size={16} className="text-indigo-600" />}
                accent="#6366f1"
                ruleIds={[
                  "s1",
                  "s2",
                  "s3",
                  "s4",
                  "s5",
                  "s6",
                  "s7",
                  "s8",
                  "s9",
                  "s10",
                  "s11",
                  "s12",
                ]}
                firedIds={firedStressIds}
                strengthMap={strengthMap}
              />
              <RuleCard
                title="Burnout rules"
                icon={<Flame size={16} className="text-amber-600" />}
                accent="#d97706"
                ruleIds={["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9"]}
                firedIds={firedBurnoutIds}
                strengthMap={strengthMap}
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ===================== METHODOLOGY PREVIEW ===================== */}
      <section id="methodology-preview" className="scroll-mt-20 py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={<>How it works</>}
              title="Mamdani Inference in 6 Steps"
              subtitle="From crisp inputs to a crisp Stress/Burnout score — the exact pipeline scikit-fuzzy runs."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  n: 1,
                  t: "Fuzzification",
                  d: "Crisp inputs are mapped to membership grades via trimf.",
                  icon: <LineChart size={18} />,
                },
                {
                  n: 2,
                  t: "Rule evaluation",
                  d: "Each rule fires at strength = min (AND) of its antecedent memberships.",
                  icon: <GitBranch size={18} />,
                },
                {
                  n: 3,
                  t: "Implication",
                  d: "Output MFs are clipped at the firing strength (Mamdani / min).",
                  icon: <Crosshair size={18} />,
                },
                {
                  n: 4,
                  t: "Aggregation",
                  d: "Clipped outputs are combined with max into one fuzzy set.",
                  icon: <Cpu size={18} />,
                },
                {
                  n: 5,
                  t: "Defuzzification",
                  d: "The centroid Σ(x·μ)/Σμ gives the crisp score.",
                  icon: <Crosshair size={18} />,
                },
                {
                  n: 6,
                  t: "Categorization",
                  d: "<40 Low · 40–69.9 Medium · ≥70 High.",
                  icon: <Sparkles size={18} />,
                },
              ].map((s) => (
                <div
                  key={s.n}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                      {s.icon}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      STEP {s.n}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-slate-900">
                    {s.t}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {s.d}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-8 text-center">
              <Link
                to="/methodology"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <ScrollText size={16} /> Read the full methodology
                <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ===================== PROJECT FILES ===================== */}
      <section id="files" className="scroll-mt-20 bg-white py-16 sm:py-20">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={<>Download the project</>}
              title="Python + Colab Project Files"
              subtitle="The real Scikit-Fuzzy engine, Streamlit app, recommendations, requirements, README and a ready-to-run Google Colab notebook."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROJECT_FILES.map((f) => (
                <div
                  key={f.name}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-5 transition hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{f.icon}</span>
                    <span className="font-mono text-sm font-bold text-slate-800">
                      {f.name}
                    </span>
                  </div>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-500">
                    {f.description}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/code?file=${encodeURIComponent(f.name)}`}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-xs font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700"
                    >
                      View
                    </Link>
                    <a
                      href={f.downloadUrl}
                      download
                      className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-center text-xs font-bold text-white transition hover:bg-slate-700"
                    >
                      Download
                    </a>
                  </div>
                  {f.name === 'Smart_Academic_Stress_Analyzer.ipynb' && (
                    <a
                      href="https://colab.research.google.com/drive/1vo_7fIjZCt87ixUbFESxih2sB5LPZBIN"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-800 transition hover:bg-amber-100"
                    >
                      🚀 Open in Google Colab
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}

function ScoreBar({ label, score, level, accent }: { label: string; score: number; level: Level; accent: string }) {
  const color = LEVEL_COLORS[level];
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold" style={{ color: accent }}>{score.toFixed(1)}</span>
          <LevelBadge level={level} />
        </div>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function RuleCard({
  title,
  icon,
  accent,
  ruleIds,
  firedIds,
  strengthMap,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
  ruleIds: string[];
  firedIds: Set<string>;
  strengthMap: Map<string, number>;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <span className="ml-auto text-xs font-semibold text-slate-400">{ruleIds.length} rules</span>
      </div>
      <div className="space-y-2">
        {ruleIds.map((id) => {
          const fired = firedIds.has(id);
          const strength = strengthMap.get(id) ?? 0;
          const isCoverage = !['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6'].includes(id);
          return (
            <div
              key={id}
              className={`rounded-xl border p-3 transition ${
                fired
                  ? 'border-transparent bg-white shadow-sm'
                  : 'border-slate-200 bg-white/40'
              }`}
              style={fired ? { boxShadow: `inset 3px 0 0 ${accent}` } : undefined}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`font-mono text-xs leading-relaxed ${
                    fired ? 'font-semibold text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {RULE_TEXT[id]}
                </span>
                {isCoverage && (
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-400">
                    coverage
                  </span>
                )}
              </div>
              {fired && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full" style={{ width: `${strength * 100}%`, backgroundColor: accent }} />
                  </div>
                  <span className="font-mono text-[10px] font-bold" style={{ color: accent }}>
                    {strength.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Minimal inline output mini-plot for the membership grid
function OutputViewInlineMini({ outputKey, result }: { outputKey: 'stress' | 'burnout'; result: ReturnType<typeof predict>['stress'] }) {
  return <OutputView result={result} output={OUTPUTS[outputKey]} />;
}
