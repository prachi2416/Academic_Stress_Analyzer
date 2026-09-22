import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap, Sparkles, Download, BookOpen,
  BrainCircuit, FileCode, FileText, NotebookPen,
  BarChart3, ShieldAlert, Github,
  Zap, Calendar, LayoutDashboard, Clock, Layers
} from "lucide-react";
import DailyRoutineEditor from "./components/DailyRoutineEditor";
import SubjectManager from "./components/SubjectManager";
import WorkloadDashboard from "./components/WorkloadDashboard";
import DailyPlanTimeline from "./components/DailyPlanTimeline";
import VisualAnalytics from "./components/VisualAnalytics";
import FuzzyEngineWalkthrough from "./components/FuzzyEngineWalkthrough";
import { useScrollReveal } from "./hooks/useScrollReveal";

import {
  analyze, recommendations,
  type FuzzyInputs,
} from "./lib/fuzzy";

import type { DailyRoutine, Subject } from "./types/academic";
import { calculateRoutineSummary } from "./lib/routine_engine";
import { calculateOverallWorkload } from "./lib/workload_calculator";
import { generateDailyPlan } from "./lib/schedule_engine";
import { generateEnhancedInsights } from "./lib/recommendation_engine";
import { loadRoutine, loadSubjects, saveRoutine, saveSubjects } from "./lib/storage";

const PROJECT_FILES = [
  { name: "app.py",               size: "~7 KB",   icon: FileCode,   desc: "Streamlit UI — dashboard, sliders, Plotly charts, recommendations." },
  { name: "fuzzy_system.py",      size: "~10 KB",  icon: BrainCircuit, desc: "Scikit-Fuzzy core: antecedents, consequents, rules, inference, defuzz." },
  { name: "requirements.txt",     size: "<1 KB",   icon: FileText,   desc: "Pinned dependencies (Streamlit, scikit-fuzzy, plotly, pandas, numpy)." },
  { name: "README.md",            size: "~3 KB",   icon: FileText,   desc: "Project overview, run instructions, fuzzy design notes." },
  { name: "Smart_Academic_Stress_Analyzer.ipynb", size: "~2 KB", icon: NotebookPen, desc: "Colab notebook that installs, uploads and launches the app." },
];

type TabKey = "fuzzy_system.py" | "app.py" | "requirements.txt";
type ViewMode = "dashboard" | "plan" | "analytics" | "subjects" | "routine" | "fuzzy_engine";

export default function App() {
  // --- View Mode ---
  const [activeView, setActiveView] = useState<ViewMode>("dashboard");
  useScrollReveal(activeView);

  // --- V1 Live preview state ---
  const [sleep, setSleep]             = useState(7);
  const [study, setStudy]             = useState(6);
  const [assignments, setAssignments] = useState(4);
  const [attendance, setAttendance]   = useState(80);

  const [analysed, setAnalysed] = useState<FuzzyInputs>({
    sleep: 7, study: 6, assignments: 4, attendance: 80,
  });
  const [hasAnalysed, setHasAnalysed] = useState(true);
  const [isAnalysing, setIsAnalysing] = useState(false);

  // --- V2 State: Routine & Subjects ---
  const [routine, setRoutine]   = useState<DailyRoutine>(() => loadRoutine());
  const [subjects, setSubjects] = useState<Subject[]>(() => loadSubjects());

  const handleRoutineChange = (newRoutine: DailyRoutine) => {
    setRoutine(newRoutine);
    saveRoutine(newRoutine);
  };

  const handleSubjectsChange = (newSubjects: Subject[]) => {
    setSubjects(newSubjects);
    saveSubjects(newSubjects);
  };

  // --- Calculations ---
  const result = useMemo(() => analyze(analysed), [analysed]);
  const tips   = useMemo(() => recommendations(analysed, result), [analysed, result]);

  const routineSummary = useMemo(() => calculateRoutineSummary(routine), [routine]);

  const { analyzedSubjects, summary: workloadSummary, recommendations: taskRecs } = useMemo(
    () => calculateOverallWorkload(subjects, routine),
    [subjects, routine]
  );

  const dayPlan = useMemo(
    () => generateDailyPlan(routine, analyzedSubjects),
    [routine, analyzedSubjects]
  );

  const enhancedInsights = useMemo(
    () =>
      generateEnhancedInsights(
        analysed,
        result,
        routineSummary,
        routine,
        workloadSummary,
        analyzedSubjects
      ),
    [analysed, result, routineSummary, routine, workloadSummary, analyzedSubjects]
  );

  const isStale =
    hasAnalysed &&
    (analysed.sleep !== sleep ||
      analysed.study !== study ||
      analysed.assignments !== assignments ||
      analysed.attendance !== attendance);

  const runAnalysis = () => {
    setIsAnalysing(true);
    setTimeout(() => {
      setAnalysed({ sleep, study, assignments, attendance });
      setHasAnalysed(true);
      setIsAnalysing(false);
    }, 350);
  };

  // --- Code viewer ---
  const [activeTab, setActiveTab] = useState<TabKey>("fuzzy_system.py");
  const [codeMap, setCodeMap]     = useState<Record<TabKey, string>>({
    "fuzzy_system.py": "Loading…",
    "app.py":          "Loading…",
    "requirements.txt": "Loading…",
  });

  useEffect(() => {
    (async () => {
      const files: TabKey[] = ["fuzzy_system.py", "app.py", "requirements.txt"];
      const results = await Promise.all(
        files.map(async (f) => [f, await fetch(`/project/${f}`).then((r) => r.text())] as const)
      );
      const map = { ...codeMap };
      for (const [k, v] of results) map[k] = v;
      setCodeMap(map);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-800 flex flex-col justify-between">
      <div>
        {/* NAV */}
        <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/70 shadow-xs">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
            {/* Top row on mobile / Left group on desktop */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 flex items-center justify-center shadow-md shadow-indigo-500/30 text-white shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      Academic Stress Analyzer
                    </p>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200 shrink-0">
                      v2.0
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 hidden sm:block">
                    Stress &amp; Workload Management System
                  </p>
                </div>
              </div>

              {/* Compact Mobile Source Button */}
              <div className="flex md:hidden items-center gap-1.5">
                <a
                  href="#download"
                  className="btn-press text-xs bg-slate-900 hover:bg-slate-800 text-white font-medium px-2.5 py-1.5 rounded-xl transition inline-flex items-center gap-1 shadow-xs cursor-pointer min-h-[36px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Source</span>
                </a>
              </div>
            </div>

            {/* View Switcher Tabs (horizontally scrollable with smooth touch panning) */}
            <div className="w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shrink-0">
              <button
                onClick={() => setActiveView("dashboard")}
                className={`btn-press flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap min-h-[40px] shrink-0 ${
                  activeView === "dashboard"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveView("plan")}
                className={`btn-press flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap min-h-[40px] shrink-0 ${
                  activeView === "plan"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Today's Plan</span>
              </button>

              <button
                onClick={() => setActiveView("analytics")}
                className={`btn-press flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap min-h-[40px] shrink-0 ${
                  activeView === "analytics"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => setActiveView("subjects")}
                className={`btn-press flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap min-h-[40px] shrink-0 ${
                  activeView === "subjects"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Subjects ({subjects.length})</span>
              </button>

              <button
                onClick={() => setActiveView("routine")}
                className={`btn-press flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap min-h-[40px] shrink-0 ${
                  activeView === "routine"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Daily Routine</span>
              </button>

              <button
                onClick={() => setActiveView("fuzzy_engine")}
                className={`btn-press flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap min-h-[40px] shrink-0 ${
                  activeView === "fuzzy_engine"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5 shrink-0" />
                <span>Fuzzy Engine (V1)</span>
              </button>
            </div>

            {/* Desktop Source Button */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <a
                href="#download"
                className="btn-press text-xs bg-slate-900 hover:bg-slate-800 text-white font-medium px-3.5 py-1.5 rounded-xl transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer min-h-[38px]"
              >
                <Download className="w-3.5 h-3.5" /> Source
              </a>
            </div>
          </div>
        </nav>

        {/* HERO (DISPLAYED ON V2 WORKLOAD PAGES) */}
        {activeView !== "fuzzy_engine" && (
          <header className="relative overflow-hidden border-b border-indigo-100/50 bg-gradient-to-b from-transparent to-white/40">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-indigo-300/25 blur-3xl" />
              <div className="absolute -top-24 right-0 w-[480px] h-[480px] rounded-full bg-purple-300/25 blur-3xl" />
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-7 sm:pt-10 pb-8 sm:pb-12">
              <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-indigo-700 bg-indigo-100/80 px-3 py-1 rounded-full ring-1 ring-indigo-200 shadow-2xs max-w-full break-words">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate sm:overflow-visible sm:whitespace-normal">Mamdani Fuzzy Inference + Priority &amp; Workload Engine</span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-purple-700 to-fuchsia-700 bg-clip-text text-transparent break-words leading-tight">
                Academic Stress + Workload Management Analyzer
              </h1>
              <p className="mt-2.5 text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl leading-relaxed break-words">
                Answers <span className="font-semibold text-slate-800">"How stressed am I, what drives my pressure, what should I prioritize, and what should I study today?"</span> — combining Mamdani fuzzy stress evaluation with realistic routine constraints, deadlines, and conflict-free study allocations.
              </p>

              {/* Quick stats pills */}
              <div className="mt-5 sm:mt-6 flex flex-wrap gap-2 sm:gap-2.5 text-xs font-semibold">
                <div className="card-hover inline-flex items-center gap-1.5 bg-white/90 border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-2xs transition-all duration-200">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span>Stress: <b>{result.stressScore.toFixed(1)}/100 ({result.stressLevel})</b></span>
                </div>
                <div className="card-hover inline-flex items-center gap-1.5 bg-white/90 border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-2xs transition-all duration-200">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <span>Burnout: <b>{result.burnoutScore.toFixed(1)}/100 ({result.burnoutRisk})</b></span>
                </div>
                <div className="card-hover inline-flex items-center gap-1.5 bg-white/90 border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-2xs transition-all duration-200">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Available Study: <b>{routineSummary.availableStudyHours}h / day</b></span>
                </div>
                <div className="card-hover inline-flex items-center gap-1.5 bg-white/90 border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-2xs transition-all duration-200">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Pending Work: <b>{workloadSummary.totalPendingHours}h</b> ({subjects.length} subjects)</span>
                </div>
                {workloadSummary.hasGap && (
                  <div className="card-hover inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-800 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-2xs transition-all duration-200">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>Workload Gap: <b>{workloadSummary.workloadGap}h</b></span>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* MAIN BODY PER VIEW */}
        <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
          {activeView === "dashboard" && (
            <WorkloadDashboard
              fuzzyResult={result}
              workloadSummary={workloadSummary}
              analyzedSubjects={analyzedSubjects}
              recommendations={taskRecs}
              enhancedInsights={enhancedInsights}
              dayPlan={dayPlan}
            />
          )}

          {activeView === "plan" && (
            <div className="space-y-6">
              <DailyPlanTimeline dayPlan={dayPlan} />
            </div>
          )}

          {activeView === "analytics" && (
            <div className="space-y-6">
              <VisualAnalytics
                fuzzyResult={result}
                workloadSummary={workloadSummary}
                analyzedSubjects={analyzedSubjects}
                dayPlan={dayPlan}
              />
            </div>
          )}

          {activeView === "subjects" && (
            <div className="space-y-6">
              <SubjectManager subjects={subjects} onChange={handleSubjectsChange} />
            </div>
          )}

          {activeView === "routine" && (
            <div className="space-y-6">
              <DailyRoutineEditor routine={routine} onChange={handleRoutineChange} />
            </div>
          )}

          {activeView === "fuzzy_engine" && (
            <FuzzyEngineWalkthrough
              sleep={sleep}
              setSleep={setSleep}
              study={study}
              setStudy={setStudy}
              assignments={assignments}
              setAssignments={setAssignments}
              attendance={attendance}
              setAttendance={setAttendance}
              analysed={analysed}
              result={result}
              tips={tips}
              isStale={isStale}
              isAnalysing={isAnalysing}
              onRunAnalysis={runAnalysis}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              codeMap={codeMap}
            />
          )}

          {/* DELIVERABLES & DOWNLOADS (RENDERED FOR OTHER VIEWS) */}
          {activeView !== "fuzzy_engine" && (
            <>
              <section id="download" className="pt-14 border-t border-slate-200/80 mt-14 reveal-on-scroll">
                <SectionHeader
                  icon={Download}
                  eyebrow="Deliverables &amp; Exports"
                  title="Download Complete Project Modules"
                  subtitle="All files needed to run the standalone Streamlit and Scikit-Fuzzy implementation locally in VS Code or on Google Colab."
                />

                <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PROJECT_FILES.map(({ name, size, icon: Icon, desc }, idx) => (
                    <a
                      key={name}
                      href={`/project/${name}`}
                      download
                      className={`card-hover group bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 cursor-pointer reveal-on-scroll stagger-${Math.min(idx + 1, 7)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-indigo-100 shadow-2xs">
                          <Icon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-mono text-sm font-semibold text-slate-900 truncate">{name}</p>
                            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{size}</p>
                          <p className="text-xs text-slate-600 mt-2 leading-relaxed">{desc}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>

              {/* DISCLAIMER */}
              <section className="py-8">
                <div className="card-hover rounded-2xl bg-amber-50 border-l-4 border-amber-400 p-5 flex items-start gap-3 shadow-2xs reveal-on-scroll transition-all duration-200">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900 text-sm">Academic Project Notice &amp; Disclaimer</p>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      This tool is an engineering and soft-computing academic project developed for educational and workload optimization purposes. It is <b>not</b> a psychological, psychiatric, or medical diagnosis tool and does not diagnose clinical depression, anxiety, or medical burnout.
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-700">Academic Stress &amp; Workload Management Analyzer v2.0.0</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Mamdani Fuzzy System + Priority Engine
            </span>
            <a
              href="https://pythonhosted.org/scikit-fuzzy/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 inline-flex items-center gap-1"
            >
              <Github className="w-3.5 h-3.5 shrink-0" /> skfuzzy docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// -------------------- Sub-components --------------------

function SectionHeader({
  icon: Icon, eyebrow, title, subtitle,
}: { icon: React.ComponentType<{ className?: string }>; eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-3xl">
      <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full ring-1 ring-indigo-200">
        <Icon className="w-3.5 h-3.5" />
        {eyebrow}
      </div>
      <h2 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
      <p className="mt-1.5 text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}
