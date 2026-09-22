import { useState } from "react";
import {
  Sparkles, Sliders, Rocket, ShieldAlert,
  BrainCircuit, BarChart3, Lightbulb, ChevronRight,
  Download, Moon, BookOpen, FileSpreadsheet,
  GraduationCap, CheckCircle2, ShieldCheck,
  FileCode, FileText, NotebookPen
} from "lucide-react";
import CodeBlock from "./CodeBlock";
import {
  STRESS_RULES_TEXT,
  BURNOUT_RULES_TEXT,
  MEMBERSHIP_TEXT,
  type FuzzyInputs,
  type analyze,
} from "../lib/fuzzy";

interface Props {
  sleep: number;
  setSleep: (v: number) => void;
  study: number;
  setStudy: (v: number) => void;
  assignments: number;
  setAssignments: (v: number) => void;
  attendance: number;
  setAttendance: (v: number) => void;
  analysed: FuzzyInputs;
  result: ReturnType<typeof analyze>;
  tips: string[];
  isStale: boolean;
  isAnalysing: boolean;
  onRunAnalysis: () => void;
  activeTab: "fuzzy_system.py" | "app.py" | "requirements.txt";
  setActiveTab: (tab: "fuzzy_system.py" | "app.py" | "requirements.txt") => void;
  codeMap: Record<"fuzzy_system.py" | "app.py" | "requirements.txt", string>;
}

const PROJECT_FILES = [
  { name: "app.py", size: "~7 KB", icon: FileCode, desc: "Streamlit UI — dashboard, sliders, Plotly charts, recommendations." },
  { name: "fuzzy_system.py", size: "~10 KB", icon: BrainCircuit, desc: "Scikit-Fuzzy core: antecedents, consequents, rules, inference, defuzz." },
  { name: "requirements.txt", size: "<1 KB", icon: FileText, desc: "Pinned dependencies (Streamlit, scikit-fuzzy, plotly, pandas, numpy)." },
  { name: "README.md", size: "~3 KB", icon: FileText, desc: "Project overview, run instructions, fuzzy design notes." },
  { name: "Smart_Academic_Stress_Analyzer.ipynb", size: "~2 KB", icon: NotebookPen, desc: "Colab notebook that installs, uploads and launches the app." },
];

export default function FuzzyEngineWalkthrough({
  sleep,
  setSleep,
  study,
  setStudy,
  assignments,
  setAssignments,
  attendance,
  setAttendance,
  result,
  tips,
  isStale,
  isAnalysing,
  onRunAnalysis,
  activeTab,
  setActiveTab,
  codeMap,
}: Props) {
  const [ruleFilter, setRuleFilter] = useState<"all" | "stress" | "burnout">("all");

  const rulesToDisplay =
    ruleFilter === "stress"
      ? STRESS_RULES_TEXT.map((r) => ({ text: r, type: "stress" as const }))
      : ruleFilter === "burnout"
      ? BURNOUT_RULES_TEXT.map((r) => ({ text: r, type: "burnout" as const }))
      : [
          ...STRESS_RULES_TEXT.map((r) => ({ text: r, type: "stress" as const })),
          ...BURNOUT_RULES_TEXT.map((r) => ({ text: r, type: "burnout" as const })),
        ];

  return (
    <div className="space-y-10 sm:space-y-14 md:space-y-16 pb-12">
      {/* ================================================================
          SECTION 1 — HERO / INTRODUCTION
          ================================================================ */}
      <section id="hero" className="scroll-section">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-5 sm:p-8 md:p-12 shadow-xl border border-indigo-800/40">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-indigo-500 blur-3xl" />
            <div className="absolute -bottom-24 -right-20 w-96 h-96 rounded-full bg-purple-500 blur-3xl" />
          </div>

          <div className="relative max-w-4xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 bg-indigo-800/60 border border-indigo-700/60 px-3.5 py-1.5 rounded-full shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>V1 Fuzzy Logic Engine</span>
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight break-words">
              Analyze academic stress and burnout using Mamdani fuzzy logic.
            </h1>

            <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-indigo-200/90 leading-relaxed max-w-3xl">
              The original Academic Stress Analyzer evaluates sleep, study hours, assignment workload,
              and attendance using fuzzy membership functions and rule-based inference.
            </p>

            {/* Quick Section Anchor Pills */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium">
              <span className="text-indigo-400 text-xs mr-1 hidden sm:inline">Jump to:</span>
              <a
                href="#fuzzy-inputs"
                className="btn-press px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/10 transition shrink-0 min-h-[36px] inline-flex items-center"
              >
                1. Inputs
              </a>
              <a
                href="#fuzzy-results"
                className="btn-press px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/10 transition shrink-0 min-h-[36px] inline-flex items-center"
              >
                2. Results
              </a>
              <a
                href="#fuzzy-visuals"
                className="btn-press px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/10 transition shrink-0 min-h-[36px] inline-flex items-center"
              >
                3. Visualizations
              </a>
              <a
                href="#fuzzy-memberships"
                className="btn-press px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/10 transition shrink-0 min-h-[36px] inline-flex items-center"
              >
                4. Memberships
              </a>
              <a
                href="#fuzzy-rules"
                className="btn-press px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/10 transition shrink-0 min-h-[36px] inline-flex items-center"
              >
                5. Rule Base
              </a>
              <a
                href="#fuzzy-code"
                className="btn-press px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/10 transition shrink-0 min-h-[36px] inline-flex items-center"
              >
                6. Code Viewer
              </a>
            </div>

            {/* Current Status Baseline Chips */}
            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-indigo-800/60 grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
              <div className="p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
                <span className="text-indigo-300 block text-[10px] font-bold uppercase tracking-wider">Current Stress</span>
                <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">{result.stressScore.toFixed(1)}/100</span>
                <span className="text-[10px] text-indigo-300 font-medium">Level: {result.stressLevel}</span>
              </div>
              <div className="p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
                <span className="text-purple-300 block text-[10px] font-bold uppercase tracking-wider">Current Burnout</span>
                <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">{result.burnoutScore.toFixed(1)}/100</span>
                <span className="text-[10px] text-purple-300 font-medium">Risk: {result.burnoutRisk}</span>
              </div>
              <div className="p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
                <span className="text-slate-300 block text-[10px] font-bold uppercase tracking-wider">Fuzzy Rules</span>
                <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">32 Rules</span>
                <span className="text-[10px] text-slate-300 font-medium">17 Stress + 15 Burnout</span>
              </div>
              <div className="p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
                <span className="text-slate-300 block text-[10px] font-bold uppercase tracking-wider">Defuzzification</span>
                <span className="text-base sm:text-lg font-bold text-white mt-0.5 block">Centroid</span>
                <span className="text-[10px] text-slate-300 font-medium">Mamdani Min-Max</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 2 — STUDENT INPUTS
          ================================================================ */}
      <section id="fuzzy-inputs" className="scroll-section">
        <SectionHeader
          number="01"
          eyebrow="Input Antecedents"
          title="Student Inputs & Sliders"
          subtitle="Adjust the four fundamental academic factors. Triangular membership functions map these continuous inputs into fuzzy linguistic truth degrees."
        />

        <div className="mt-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-slate-200 card-hover">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* 1. Sleep Hours */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/70 border border-slate-200/80 transition-all duration-200 hover:bg-white hover:border-indigo-300">
              <div className="flex items-center justify-between mb-2 gap-2">
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                  <Moon className="w-4 h-4 text-indigo-500 shrink-0" /> Sleep Hours per day
                </label>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                  {sleep}h
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={sleep}
                onChange={(e) => setSleep(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-600 mt-2"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #a855f7 ${(sleep / 12) * 100}%, #e2e8f0 ${(sleep / 12) * 100}%, #e2e8f0 100%)`,
                }}
              />
              <div className="flex justify-between text-[9.5px] sm:text-[10px] text-slate-400 mt-1.5 font-mono">
                <span>0h (Low &lt;6h)</span>
                <span>6–8h (Medium)</span>
                <span>12h (High &gt;8h)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                Primary recovery factor for mental stamina and burnout resistance.
              </p>
            </div>

            {/* 2. Daily Study Hours */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/70 border border-slate-200/80 transition-all duration-200 hover:bg-white hover:border-indigo-300">
              <div className="flex items-center justify-between mb-2 gap-2">
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                  <BookOpen className="w-4 h-4 text-blue-500 shrink-0" /> Daily Study Hours
                </label>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  {study}h
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                step={0.5}
                value={study}
                onChange={(e) => setStudy(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-600 mt-2"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #a855f7 ${(study / 15) * 100}%, #e2e8f0 ${(study / 15) * 100}%, #e2e8f0 100%)`,
                }}
              />
              <div className="flex justify-between text-[9.5px] sm:text-[10px] text-slate-400 mt-1.5 font-mono">
                <span>0h (Low &lt;4h)</span>
                <span>4–7h (Medium)</span>
                <span>15h (High &gt;7h)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                Direct academic exertion. High values elevate burnout risk without sufficient sleep.
              </p>
            </div>

            {/* 3. Assignment Workload */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/70 border border-slate-200/80 transition-all duration-200 hover:bg-white hover:border-indigo-300">
              <div className="flex items-center justify-between mb-2 gap-2">
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                  <FileSpreadsheet className="w-4 h-4 text-purple-500 shrink-0" /> Assignment Workload (Scale 0–10)
                </label>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                  {assignments} / 10
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={assignments}
                onChange={(e) => setAssignments(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-600 mt-2"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #a855f7 ${(assignments / 10) * 100}%, #e2e8f0 ${(assignments / 10) * 100}%, #e2e8f0 100%)`,
                }}
              />
              <div className="flex justify-between text-[9.5px] sm:text-[10px] text-slate-400 mt-1.5 font-mono">
                <span>0 (Light &lt;3)</span>
                <span>3–6 (Moderate)</span>
                <span>10 (Heavy &gt;6)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                Pending assignment burden and immediate submission pressure.
              </p>
            </div>

            {/* 4. Attendance Percentage */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/70 border border-slate-200/80 transition-all duration-200 hover:bg-white hover:border-indigo-300">
              <div className="flex items-center justify-between mb-2 gap-2">
                <label className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                  <GraduationCap className="w-4 h-4 text-emerald-500 shrink-0" /> Attendance Percentage
                </label>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  {attendance}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={attendance}
                onChange={(e) => setAttendance(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-600 mt-2"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #a855f7 ${attendance}%, #e2e8f0 ${attendance}%, #e2e8f0 100%)`,
                }}
              />
              <div className="flex justify-between text-[9.5px] sm:text-[10px] text-slate-400 mt-1.5 font-mono">
                <span>0% (Low &lt;75%)</span>
                <span>75–85% (Medium)</span>
                <span>100% (High &gt;85%)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                Attendance below 75% triggers significant anxiety and academic stress.
              </p>
            </div>
          </div>

          {/* Action Button & Stale Indicator */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              {isStale ? (
                <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Inputs changed. Click button to recalculate fuzzy inference.</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Inference up-to-date with current inputs.</span>
                </div>
              )}
            </div>

            <button
              onClick={onRunAnalysis}
              disabled={isAnalysing}
              className="btn-press w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white font-semibold px-5 sm:px-6 py-3 min-h-[44px] rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isAnalysing ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <span>Computing Centroid Defuzzification…</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Run Fuzzy Inference Engine</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 3 — FUZZY ANALYSIS RESULTS
          ================================================================ */}
      <section id="fuzzy-results" className="scroll-section">
        <SectionHeader
          number="02"
          eyebrow="Inference Output"
          title="Fuzzy Analysis Results"
          subtitle="Deterministic Mamdani centroid defuzzification calculated from the evaluated rule base."
        />

        <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Stress Result Card */}
          <div className="card-hover relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-700" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Academic Stress Score</span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  result.stressLevel === "Low"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : result.stressLevel === "Medium"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {result.stressLevel} Level
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                {result.stressScore.toFixed(1)}
              </span>
              <span className="text-slate-400 font-semibold text-base sm:text-lg">/ 100</span>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed font-medium">
              Evaluated across 17 stress inference rules balancing sleep depletion, excessive study workload, and low attendance.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Antecedent defuzzification: Centroid center of mass</span>
            </div>
          </div>

          {/* Burnout Result Card */}
          <div className="card-hover relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-700" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Burnout Risk Score</span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  result.burnoutRisk === "Low"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : result.burnoutRisk === "Medium"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {result.burnoutRisk} Risk
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                {result.burnoutScore.toFixed(1)}
              </span>
              <span className="text-slate-400 font-semibold text-base sm:text-lg">/ 100</span>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed font-medium">
              Calculated across 15 burnout rules combining cumulative physical fatigue, sleep deprivation, and intense continuous study.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 italic">
              Note: Model-based academic workload indicator; not a clinical diagnosis.
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 4 — VISUALIZATION
          ================================================================ */}
      <section id="fuzzy-visuals" className="scroll-section">
        <SectionHeader
          number="03"
          eyebrow="Visual Comparative Analysis"
          title="Stress vs. Burnout Visualization & Tips"
          subtitle="Side-by-side comparative spectrum with rule-triggered baseline academic recommendations."
        />

        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Comparison Spectrum Card */}
          <div className="lg:col-span-3 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border border-slate-200 shadow-sm card-hover">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-indigo-600 shrink-0" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Stress &amp; Burnout Output Spectrum</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Visual comparison showing where the defuzzified crisp output falls along the 0–100 continuum:
            </p>

            {/* Stress Bar */}
            <div className="mb-6">
              <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between text-xs font-semibold mb-1.5 gap-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" /> Academic Stress
                </span>
                <span className="font-mono text-indigo-700">{result.stressScore.toFixed(1)} / 100 ({result.stressLevel})</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, Math.max(4, result.stressScore))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0 (Low &lt;35)</span>
                <span>35–70 (Medium)</span>
                <span>100 (High &gt;70)</span>
              </div>
            </div>

            {/* Burnout Bar */}
            <div>
              <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between text-xs font-semibold mb-1.5 gap-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" /> Burnout Risk
                </span>
                <span className="font-mono text-purple-700">{result.burnoutScore.toFixed(1)} / 100 ({result.burnoutRisk})</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, Math.max(4, result.burnoutScore))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0 (Low &lt;35)</span>
                <span>35–70 (Medium)</span>
                <span>100 (High &gt;70)</span>
              </div>
            </div>

            {/* Explanatory note */}
            <div className="mt-6 sm:mt-8 p-3 sm:p-3.5 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <b>Centroid interpretation:</b> The output represents the balance point of all activated rules. Even with mixed signals, the system outputs a stable, continuous score without abrupt threshold jumps.
              </span>
            </div>
          </div>

          {/* V1 Recommendations Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-50 via-purple-50/60 to-fuchsia-50/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border border-indigo-100 shadow-sm card-hover flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">V1 Baseline Advice</h3>
              </div>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                Heuristic guidance derived directly from your input membership degrees:
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                {tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-indigo-100/60">
                    <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-indigo-600 shrink-0" />
                    <span className="font-medium">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-100/80 text-[11px] text-slate-500">
              Calculated using the original rule consequence lookup table in <code className="font-mono text-indigo-700">fuzzy.ts</code>.
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 5 — MEMBERSHIP FUNCTIONS
          ================================================================ */}
      <section id="fuzzy-memberships" className="scroll-section">
        <SectionHeader
          number="04"
          eyebrow="Fuzzification Pipeline"
          title="How the Model Understands Your Inputs"
          subtitle="Transforming crisp numerical measurements into fuzzy membership truth degrees between 0.00 and 1.00."
        />

        {/* Visual Pipeline Flow Diagram */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm card-hover">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Mamdani Fuzzification Pipeline
          </p>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <span className="text-[10px] font-bold uppercase text-indigo-600 block">Step 1</span>
              <p className="text-xs font-bold text-indigo-950 mt-1">Crisp Inputs</p>
              <p className="text-[10px] text-indigo-600/80 mt-0.5 font-mono">{sleep}h, {study}h, {assignments}, {attendance}%</p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-purple-50/70 border border-purple-100">
              <span className="text-[10px] font-bold uppercase text-purple-600 block">Step 2</span>
              <p className="text-xs font-bold text-purple-950 mt-1">Triangular MFs</p>
              <p className="text-[10px] text-purple-600/80 mt-0.5">Low, Medium, High bounds</p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-blue-50/70 border border-blue-100">
              <span className="text-[10px] font-bold uppercase text-blue-600 block">Step 3</span>
              <p className="text-xs font-bold text-blue-950 mt-1">Mamdani Inference</p>
              <p className="text-[10px] text-blue-600/80 mt-0.5">Min implication on 32 rules</p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[10px] font-bold uppercase text-emerald-600 block">Step 4</span>
              <p className="text-xs font-bold text-emerald-950 mt-1">Defuzzification</p>
              <p className="text-[10px] text-emerald-600/80 mt-0.5">Centroid Center of Gravity</p>
            </div>
          </div>
        </div>

        {/* Live Degrees Grid */}
        <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border border-slate-200 shadow-sm card-hover">
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-5 h-5 text-indigo-600 shrink-0" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Active Membership Degrees</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Real-time antecedent degrees of truth (&mu; &isin; [0, 1]) fired by your current inputs:
            </p>

            <div className="space-y-4">
              {(Object.keys(result.degrees) as (keyof typeof result.degrees)[]).map((factor) => (
                <div key={factor} className="p-3 bg-slate-50/70 rounded-xl sm:rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">{factor}</p>
                  <div className="grid grid-cols-1 min-[340px]:grid-cols-3 gap-1.5 sm:gap-2">
                    {(["low", "medium", "high"] as const).map((term) => {
                      const v = result.degrees[factor][term] ?? 0;
                      const color =
                        term === "low" ? "bg-emerald-500" : term === "medium" ? "bg-amber-500" : "bg-rose-500";
                      return (
                        <div key={term} className="bg-white rounded-xl p-2 border border-slate-200/60 shadow-2xs">
                          <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-medium">
                            <span className="capitalize">{term}</span>
                            <span className="font-mono font-bold">{v.toFixed(2)}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${v * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theoretical Ranges Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 border border-slate-200 shadow-sm card-hover">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5 text-indigo-600 shrink-0" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Triangular Membership Ranges</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Theoretical triangular coordinate boundaries [a, b, c] defined in <code className="font-mono text-indigo-700">fuzzy_system.py</code>:
            </p>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {Object.entries(MEMBERSHIP_TEXT).map(([variable, terms]) => (
                <div key={variable} className="p-3 bg-slate-50/60 rounded-xl sm:rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-800 mb-1.5">{variable}</p>
                  <div className="grid grid-cols-1 min-[340px]:grid-cols-3 gap-1.5 sm:gap-2">
                    {Object.entries(terms).map(([term, range]) => (
                      <div key={term} className="text-xs bg-white border border-slate-200/70 rounded-xl p-2 shadow-2xs">
                        <p
                          className={`font-bold text-[11px] ${
                            term === "Low" ? "text-emerald-700" : term === "Medium" ? "text-amber-700" : "text-rose-700"
                          }`}
                        >
                          {term}
                        </p>
                        <p className="text-slate-500 font-mono text-[10px] mt-0.5">{range}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 6 — FUZZY RULE BASE
          ================================================================ */}
      <section id="fuzzy-rules" className="scroll-section">
        <SectionHeader
          number="05"
          eyebrow="Soft Computing Viva Panel"
          title="Fuzzy Rule Base & Inference Logic"
          subtitle="Detailed reference of the 32 Mamdani IF-THEN rules designed for academic viva presentation and deterministic evaluation."
        />

        <div className="mt-6 sm:mt-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200 shadow-sm card-hover">
          {/* Rule Filter Switcher */}
          <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between gap-3 mb-4 sm:mb-6 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                onClick={() => setRuleFilter("all")}
                className={`btn-press px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer min-h-[36px] flex items-center ${
                  ruleFilter === "all" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Rules (32)
              </button>
              <button
                onClick={() => setRuleFilter("stress")}
                className={`btn-press px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer min-h-[36px] flex items-center ${
                  ruleFilter === "stress" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Stress Rules (17)
              </button>
              <button
                onClick={() => setRuleFilter("burnout")}
                className={`btn-press px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer min-h-[36px] flex items-center ${
                  ruleFilter === "burnout" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Burnout Rules (15)
              </button>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              Showing {rulesToDisplay.length} rules formatted for easy scanning
            </span>
          </div>

          {/* Formatted Rule List */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {rulesToDisplay.map(({ text, type }, idx) => (
              <div
                key={idx}
                className="flex flex-col min-[420px]:flex-row min-[420px]:items-center gap-1.5 min-[420px]:gap-2 p-2.5 sm:p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-indigo-200 transition-all text-xs font-mono text-slate-800"
              >
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border shrink-0 w-fit ${
                    type === "stress"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-purple-50 text-purple-700 border-purple-200"
                  }`}
                >
                  #{idx + 1} {type}
                </span>
                <span className="leading-relaxed flex-1 break-words">{formatRule(text)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SECTION 7 — CODE / TECHNICAL DETAILS
          ================================================================ */}
      <section id="fuzzy-code" className="scroll-section">
        <SectionHeader
          number="06"
          eyebrow="Implementation & Deliverables"
          title="How V1 is Implemented"
          subtitle="The complete Scikit-Fuzzy Python source files, Streamlit dashboard application, and standalone Colab notebook."
        />

        {/* Code Tabs */}
        <div className="mt-6 sm:mt-8 flex flex-wrap gap-1.5 sm:gap-2 mb-4">
          {(["fuzzy_system.py", "app.py", "requirements.txt"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`btn-press px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono min-h-[40px] flex items-center transition-all duration-200 cursor-pointer ${
                activeTab === t
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-slate-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Embedded CodeBlock */}
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-200">
          <CodeBlock
            filename={activeTab}
            language={activeTab.endsWith(".txt") ? "text" : "python"}
            code={codeMap[activeTab]}
            downloadHref={`/project/${activeTab}`}
          />
        </div>

        {/* Deliverables Download Grid */}
        <div className="mt-8 sm:mt-12">
          <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-600 shrink-0" />
            Download Complete Project Deliverables
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {PROJECT_FILES.map(({ name, size, icon: Icon, desc }) => (
              <a
                key={name}
                href={`/project/${name}`}
                download
                className="card-hover group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-mono text-xs sm:text-sm font-semibold text-slate-900 truncate">{name}</p>
                      <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{size}</p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Academic Notice Banner */}
        <div className="mt-8 sm:mt-10 card-hover rounded-xl sm:rounded-2xl bg-amber-50 border-l-4 border-amber-400 p-4 sm:p-5 flex flex-col min-[460px]:flex-row items-start gap-3 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 text-sm">Academic Project Notice &amp; Disclaimer</p>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              This tool is an engineering and soft-computing academic project developed for educational and workload optimization purposes. It is <b>not</b> a psychological, psychiatric, or medical diagnosis tool and does not diagnose clinical depression, anxiety, or medical burnout.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// -------------------- Sub-components --------------------

function SectionHeader({
  number,
  eyebrow,
  title,
  subtitle,
}: {
  number: string;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-3xl">
      <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full shadow-2xs">
        <span className="font-mono text-indigo-500">{number}</span>
        <span>•</span>
        <span>{eyebrow}</span>
      </div>
      <h2 className="mt-3 text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight break-words">{title}</h2>
      <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">{subtitle}</p>
    </div>
  );
}

/** Formats a rule string like "IF Sleep is Low AND Study is High THEN Stress is High" with colored tokens */
function formatRule(ruleText: string) {
  const parts = ruleText.split(/\b(IF|AND|THEN)\b/g);
  return (
    <span>
      {parts.map((part, i) => {
        const trimmed = part.trim();
        if (trimmed === "IF" || trimmed === "THEN") {
          return (
            <span key={i} className="font-bold text-indigo-600 px-1">
              {trimmed}{" "}
            </span>
          );
        }
        if (trimmed === "AND") {
          return (
            <span key={i} className="font-bold text-purple-600 px-1">
              {trimmed}{" "}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
