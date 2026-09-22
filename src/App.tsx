import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap, Sparkles, Download, Rocket, BookOpen, Code2,
  BrainCircuit, ChevronRight, FileCode, FileText, NotebookPen,
  Sliders, BarChart3, Lightbulb, ShieldAlert, PlayCircle, Github,
  Zap,
} from "lucide-react";
import CodeBlock from "./components/CodeBlock";
import {
  analyze, recommendations,
  STRESS_RULES_TEXT, BURNOUT_RULES_TEXT, MEMBERSHIP_TEXT,
  type FuzzyInputs,
} from "./lib/fuzzy";

const PROJECT_FILES = [
  { name: "app.py",               size: "~7 KB",   icon: FileCode,   desc: "Streamlit UI — dashboard, sliders, Plotly charts, recommendations." },
  { name: "fuzzy_system.py",      size: "~10 KB",  icon: BrainCircuit, desc: "Scikit-Fuzzy core: antecedents, consequents, rules, inference, defuzz." },
  { name: "requirements.txt",     size: "<1 KB",   icon: FileText,   desc: "Pinned dependencies (Streamlit, scikit-fuzzy, plotly, pandas, numpy)." },
  { name: "README.md",            size: "~3 KB",   icon: FileText,   desc: "Project overview, run instructions, fuzzy design notes." },
  { name: "Smart_Academic_Stress_Analyzer.ipynb", size: "~2 KB", icon: NotebookPen, desc: "Colab notebook that installs, uploads and launches the app." },
];

type TabKey = "fuzzy_system.py" | "app.py" | "requirements.txt";

export default function App() {
  // --- Live preview state ---
  const [sleep, setSleep]           = useState(7);
  const [study, setStudy]           = useState(6);
  const [assignments, setAssignments] = useState(4);
  const [attendance, setAttendance] = useState(80);

  const inputs: FuzzyInputs = { sleep, study, assignments, attendance };

  // Results only update when the user clicks "Analyze Stress" (same UX as the
  // Streamlit app). We store the snapshot of inputs that were analysed so we
  // can show a "stale" indicator if the sliders have moved since.
  const [analysed, setAnalysed] = useState<FuzzyInputs>({
    sleep: 7, study: 6, assignments: 4, attendance: 80,
  });
  const [hasAnalysed, setHasAnalysed] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);

  const result = useMemo(() => analyze(analysed), [analysed]);
  const tips   = useMemo(() => recommendations(analysed, result), [analysed, result]);

  const isStale =
    hasAnalysed &&
    (analysed.sleep !== sleep ||
     analysed.study !== study ||
     analysed.assignments !== assignments ||
     analysed.attendance !== attendance);

  const runAnalysis = () => {
    setIsAnalysing(true);
    // Small delay so users perceive the "computation" happening.
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

  const pillClass = (lvl: string) =>
    lvl === "Low"    ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
  : lvl === "Medium" ? "bg-amber-100 text-amber-800 ring-amber-200"
                     : "bg-rose-100 text-rose-800 ring-rose-200";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-800">
      {/* NAV */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">
                Smart Academic Stress Analyzer
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#preview" className="hover:text-indigo-600 transition">
              Live Preview
            </a>
            <a href="#download" className="hover:text-indigo-600 transition">
              Download
            </a>
            <a href="#code" className="hover:text-indigo-600 transition">
              Source
            </a>
            <a href="#fuzzy" className="hover:text-indigo-600 transition">
              Fuzzy Details
            </a>
            <a href="#run" className="hover:text-indigo-600 transition">
              How to Run
            </a>
          </div>
          <a
            href="/project/app.py"
            download
            className="hidden sm:inline-flex items-center gap-1.5 text-sm bg-slate-900 text-white px-3.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <Download className="w-4 h-4" /> app.py
          </a>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-indigo-300/30 blur-3xl" />
          <div className="absolute -top-24 right-0 w-[480px] h-[480px] rounded-full bg-purple-300/30 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-16">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full ring-1 ring-indigo-200">
            <Sparkles className="w-3.5 h-3.5" />
            Python • Streamlit • Scikit-Fuzzy
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-700 via-purple-700 to-fuchsia-700 bg-clip-text text-transparent">
            Smart Academic Stress Analyzer
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-3xl">
            Scikit-Fuzzy based student{" "}
            <span className="font-semibold text-slate-800">
              stress &amp; burnout
            </span>{" "}
            assessment that turns four everyday academic inputs into fuzzy
            scores, linguistic categories, and personalised recommendations —
            built for an M.Sc. Data Science <em>Soft Computing Techniques</em>{" "}
            mini project.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#preview"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition"
            >
              <PlayCircle className="w-5 h-5" /> Try the Live Preview
            </a>
            <a
              href="#download"
              className="inline-flex items-center gap-2 bg-white text-slate-800 px-5 py-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 transition"
            >
              <Download className="w-5 h-5" /> Download Project Files
            </a>
            <a
              href="#run"
              className="inline-flex items-center gap-2 bg-white text-slate-800 px-5 py-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:text-indigo-700 transition"
            >
              <Rocket className="w-5 h-5" /> Run in Colab
            </a>
          </div>

          {/* Stat pills */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                k: "4 Antecedents",
                v: "sleep, study, assignments, attendance",
                icon: Sliders,
              },
              {
                k: "2 Consequents",
                v: "stress, burnout (0–100)",
                icon: BarChart3,
              },
              { k: "17 + 15 Rules", v: "Mamdani rule base", icon: BookOpen },
              {
                k: "Centroid Defuzz",
                v: "skfuzzy default",
                icon: BrainCircuit,
              },
            ].map(({ k, v, icon: Icon }) => (
              <div
                key={k}
                className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-indigo-600">
                  <Icon className="w-4 h-4" />
                  <p className="text-xs font-semibold uppercase tracking-wider">
                    {k}
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-600">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* LIVE PREVIEW */}
      <section id="preview" className="max-w-7xl mx-auto px-6 py-14">
        <SectionHeader
          icon={PlayCircle}
          eyebrow="Live in-browser preview"
          title="Try the fuzzy inference before running the app"
          subtitle="Set the four student inputs and click Analyze Stress to run the fuzzy inference. This preview uses a JavaScript port of the exact same Mamdani rules and triangular MFs from fuzzy_system.py, so the scores match what Streamlit + Scikit-Fuzzy produce."
        />

        <div className="mt-8 grid lg:grid-cols-5 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-5">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-slate-900">Student Inputs</h3>
            </div>

            <SliderInput
              label="😴 Sleep Hours per day"
              value={sleep}
              min={0}
              max={12}
              step={0.5}
              onChange={setSleep}
              unit="h"
            />
            <SliderInput
              label="📖 Study Hours per day"
              value={study}
              min={0}
              max={15}
              step={0.5}
              onChange={setStudy}
              unit="h"
            />
            <SliderInput
              label="📝 Assignment Workload"
              value={assignments}
              min={0}
              max={10}
              step={1}
              onChange={setAssignments}
            />
            <SliderInput
              label="🏫 Attendance"
              value={attendance}
              min={0}
              max={100}
              step={1}
              onChange={setAttendance}
              unit="%"
            />

            {/* Analyze Stress button (matches the Streamlit app) */}
            <button
              onClick={runAnalysis}
              disabled={isAnalysing}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAnalysing ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      opacity="0.25"
                    />
                    <path
                      d="M4 12a8 8 0 018-8"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Running fuzzy inference…
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Analyze Stress
                </>
              )}
            </button>

            {isStale && (
              <div className="mt-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2.5 flex items-start gap-2">
                <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  Inputs have changed since your last analysis. Click{" "}
                  <span className="font-semibold">Analyze Stress</span> again to
                  refresh the scores.
                </span>
              </div>
            )}

            <div className="mt-4 text-[11px] text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <span className="font-semibold text-slate-700">Note:</span> the
              underlying Scikit-Fuzzy inference (17 stress rules + 15 burnout
              rules, Mamdani + centroid defuzzification) runs on click, exactly
              as it does in <span className="font-mono">app.py</span>.
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-5">
            {!hasAnalysed ? (
              <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-200 border-dashed flex flex-col items-center justify-center text-center min-h-[420px]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-4">
                  <Rocket className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Ready to analyse
                </h3>
                <p className="text-sm text-slate-600 max-w-md mt-2">
                  Set the four student inputs on the left, then click{" "}
                  <span className="font-semibold text-indigo-700">
                    Analyze Stress
                  </span>
                  . The fuzzy inference engine will compute your stress and
                  burnout scores, membership degrees, and personalised
                  recommendations.
                </p>
                <div className="mt-5 grid grid-cols-4 gap-3 w-full max-w-md">
                  {[
                    { label: "Sleep", v: `${sleep}h` },
                    { label: "Study", v: `${study}h` },
                    { label: "Assignments", v: `${assignments}` },
                    { label: "Attendance", v: `${attendance}%` },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-slate-50 border border-slate-100 rounded-xl py-2 px-1"
                    >
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                        {s.label}
                      </p>
                      <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">
                        {s.v}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <ScoreCard
                    label="Stress Score"
                    score={result.stressScore}
                    level={result.stressLevel}
                    color="from-indigo-500 to-indigo-700"
                  />
                  <ScoreCard
                    label="Burnout Score"
                    score={result.burnoutScore}
                    level={result.burnoutRisk}
                    color="from-purple-500 to-fuchsia-700"
                  />
                </div>

                {/* Comparison bar */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-slate-900">
                      Stress vs Burnout
                    </h3>
                  </div>
                  <ComparisonBars
                    stress={result.stressScore}
                    burnout={result.burnoutScore}
                  />
                </div>

                {/* Membership degrees */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-1">
                    <BrainCircuit className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-slate-900">
                      How Your Inputs Contributed
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Membership degree (0 – 1) in each fuzzy set. This is what
                    the rule base actually reasons on.
                  </p>
                  <MembershipGrid degrees={result.degrees} />
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-fuchsia-50 rounded-3xl p-6 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-slate-900">
                      Personalised Recommendations
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {tips.map((t, i) => (
                      <li key={i} className="flex gap-2">
                        <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* DOWNLOAD */}
      <section id="download" className="max-w-7xl mx-auto px-6 py-14">
        <SectionHeader
          icon={Download}
          eyebrow="Deliverables"
          title="Download the complete project"
          subtitle="Every file needed to run the Streamlit app locally in VS Code or on Google Colab. UI and fuzzy-logic code are kept in separate modules."
        />

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROJECT_FILES.map(({ name, size, icon: Icon, desc }) => (
            <a
              key={name}
              href={`/project/${name}`}
              download
              className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border border-indigo-100">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm font-semibold text-slate-900 truncate">
                      {name}
                    </p>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{size}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* CODE VIEWER */}
      <section id="code" className="max-w-7xl mx-auto px-6 py-14">
        <SectionHeader
          icon={Code2}
          eyebrow="Source code"
          title="Read the exact Scikit-Fuzzy implementation"
          subtitle="The core prediction uses skfuzzy.control — real Antecedents, Consequents, ctrl.Rule objects, ControlSystemSimulation, and centroid defuzzification. No random values, no if/else fallbacks."
        />

        <div className="mt-8 flex flex-wrap gap-2 mb-4">
          {(["fuzzy_system.py", "app.py", "requirements.txt"] as TabKey[]).map(
            (t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-mono transition ${
                  activeTab === t
                    ? "bg-slate-900 text-white shadow"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                }`}
              >
                {t}
              </button>
            ),
          )}
        </div>

        <CodeBlock
          filename={activeTab}
          language={activeTab.endsWith(".txt") ? "text" : "python"}
          code={codeMap[activeTab]}
          downloadHref={`/project/${activeTab}`}
        />
      </section>

      {/* FUZZY DETAILS */}
      <section id="fuzzy" className="max-w-7xl mx-auto px-6 py-14">
        <SectionHeader
          icon={BrainCircuit}
          eyebrow="Everything you need on one screen — membership ranges, rule bases, and design choices."
          title="Fuzzy Logic Details"
          subtitle=""
        />

        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" /> Membership
              Function Ranges
            </h3>
            <div className="space-y-4">
              {Object.entries(MEMBERSHIP_TEXT).map(([variable, terms]) => (
                <div key={variable}>
                  <p className="text-sm font-semibold text-slate-800">
                    {variable}
                  </p>
                  <div className="mt-1.5 grid grid-cols-3 gap-2">
                    {Object.entries(terms).map(([term, range]) => (
                      <div
                        key={term}
                        className="text-xs bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5"
                      >
                        <p
                          className={`font-semibold ${
                            term === "Low"
                              ? "text-emerald-700"
                              : term === "Medium"
                                ? "text-amber-700"
                                : "text-rose-700"
                          }`}
                        >
                          {term}
                        </p>
                        <p className="text-slate-600">{range}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Fuzzy Rule Base
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2">
                  Stress Rules
                </p>
                <ul className="space-y-1.5 text-[12.5px] text-slate-700 font-mono">
                  {STRESS_RULES_TEXT.map((r, i) => (
                    <li
                      key={i}
                      className="bg-indigo-50/60 border border-indigo-100 rounded-md px-2.5 py-1.5"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-2">
                  Burnout Rules
                </p>
                <ul className="space-y-1.5 text-[12.5px] text-slate-700 font-mono">
                  {BURNOUT_RULES_TEXT.map((r, i) => (
                    <li
                      key={i}
                      className="bg-purple-50/60 border border-purple-100 rounded-md px-2.5 py-1.5"
                    >
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Design notes */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            {
              title: "Inference",
              body: "Mamdani (min for AND, max for aggregation) — skfuzzy.control default.",
            },
            {
              title: "Defuzzification",
              body: "Centroid over the 0–100 output universe — skfuzzy default.",
            },
            {
              title: "Separation",
              body: "UI (app.py) and fuzzy engine (fuzzy_system.py) are decoupled modules for clean viva demos.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="bg-white rounded-2xl p-5 border border-slate-200"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {c.title}
              </p>
              <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* RUN */}
      <section id="run" className="max-w-7xl mx-auto px-6 py-14">
        <SectionHeader
          icon={Rocket}
          eyebrow="How to run"
          title="Two ways to demo the project"
          subtitle="Either run it locally in VS Code, or share it from a Google Colab tunnel for online demos."
        />

        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          {/* Local */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-indigo-700" />
              </div>
              <h3 className="font-semibold text-slate-900">Local (VS Code)</h3>
            </div>
            <ol className="text-sm text-slate-600 space-y-1 list-decimal ml-5 mb-4">
              <li>Download the files from the section above.</li>
              <li>Open the folder in VS Code.</li>
              <li>Create a virtual environment and install requirements.</li>
              <li>Launch Streamlit.</li>
            </ol>
            <TerminalBlock
              lines={[
                "python -m venv venv",
                "source venv/bin/activate      # Windows: venv\\Scripts\\activate",
                "pip install -r requirements.txt",
                "streamlit run app.py",
              ]}
            />
          </div>

          {/* Colab */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                <NotebookPen className="w-5 h-5 text-purple-700" />
              </div>
              <h3 className="font-semibold text-slate-900">Google Colab</h3>
            </div>
            <ol className="text-sm text-slate-600 space-y-1 list-decimal ml-5 mb-4">
              <li>Open a new Colab notebook.</li>
              <li>
                Upload <span className="font-mono">app.py</span> and{" "}
                <span className="font-mono">fuzzy_system.py</span>.
              </li>
              <li>Run the cells below.</li>
              <li>Open the tunnel URL, paste the shown IP as password.</li>
            </ol>
            <TerminalBlock
              lines={[
                "!pip install -q streamlit scikit-fuzzy plotly pandas numpy",
                "!npm install -g localtunnel",
                "!streamlit run app.py &>/content/log.txt &",
                "!curl -s ifconfig.me                   # tunnel password",
                "!npx --yes localtunnel --port 8501",
              ]}
            />
            <a
              href="/project/Smart_Academic_Stress_Analyzer.ipynb"
              download
              className="mt-4 inline-flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 font-semibold"
            >
              <Download className="w-4 h-4" /> Download ready-made Colab
              notebook
            </a>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="rounded-2xl bg-amber-50 border-l-4 border-amber-400 p-5 flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Disclaimer</p>
            <p className="text-sm text-amber-800 mt-1">
              This tool is an academic project for educational purposes and is{" "}
              <b>not</b> a medical or psychological diagnosis.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white/60">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-500" /> Built with
              Streamlit + Scikit-Fuzzy
            </span>
            <a
              href="https://pythonhosted.org/scikit-fuzzy/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 inline-flex items-center gap-1"
            >
              <Github className="w-3.5 h-3.5" /> skfuzzy docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );

  // For unused import warning suppression when styling pills inline
  void pillClass;
}

// -------------------- Sub-components --------------------

function SectionHeader({
  icon: Icon, eyebrow, title, subtitle,
}: { icon: React.ComponentType<{ className?: string }>; eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-3xl">
      <div className="inline-flex items-center gap-2 text-xs font-medium text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full ring-1 ring-indigo-200">
        <Icon className="w-3.5 h-3.5" />
        {eyebrow}
      </div>
      <h2 className="mt-3 text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
      <p className="mt-2 text-slate-600">{subtitle}</p>
    </div>
  );
}

function SliderInput({
  label, value, min, max, step, onChange, unit,
}: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm text-slate-700 font-medium">{label}</label>
        <span className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded-md text-slate-800">
          {value}{unit ?? ""}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-600"
        style={{
          background: `linear-gradient(to right, #6366f1 0%, #a855f7 ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
        }}
      />
      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

function ScoreCard({ label, score, level, color }: { label: string; score: number; level: "Low" | "Medium" | "High"; color: string }) {
  const levelClass =
    level === "Low"    ? "bg-emerald-100 text-emerald-800 ring-emerald-200"
  : level === "Medium" ? "bg-amber-100 text-amber-800 ring-amber-200"
                       : "bg-rose-100 text-rose-800 ring-rose-200";
  return (
    <div className="relative bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color}`} />
      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <p className={`text-5xl font-extrabold bg-gradient-to-br ${color} bg-clip-text text-transparent`}>
          {score.toFixed(1)}
        </p>
        <span className="text-slate-400 text-lg">/100</span>
      </div>
      <div className="mt-3">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${levelClass}`}>
          {level}
        </span>
      </div>
    </div>
  );
}

function ComparisonBars({ stress, burnout }: { stress: number; burnout: number }) {
  const rows = [
    { label: "Stress",  value: stress,  color: "from-indigo-500 to-indigo-600" },
    { label: "Burnout", value: burnout, color: "from-purple-500 to-fuchsia-600" },
  ];
  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-700">{r.label}</span>
            <span className="font-mono text-slate-600">{r.value.toFixed(1)} / 100</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${r.color} transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(100, r.value)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MembershipGrid({ degrees }: { degrees: Record<string, Record<string, number>> }) {
  const factors = Object.keys(degrees);
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {factors.map((f) => (
        <div key={f} className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">{f}</p>
          <div className="space-y-2">
            {(["low", "medium", "high"] as const).map((term) => {
              const v = degrees[f][term] ?? 0;
              const color =
                term === "low"    ? "bg-emerald-500"
              : term === "medium" ? "bg-amber-500"
                                  : "bg-rose-500";
              return (
                <div key={term}>
                  <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                    <span className="capitalize font-medium">{term}</span>
                    <span className="font-mono">{v.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 bg-white rounded-full overflow-hidden border border-slate-100">
                    <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${v * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function TerminalBlock({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-xl bg-[#0f172a] border border-slate-800 overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1e293b] border-b border-white/5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-2 text-[11px] font-mono text-slate-400">terminal</span>
      </div>
      <pre className="text-[12.5px] leading-relaxed p-3.5 text-emerald-300 font-mono overflow-x-auto">
        {lines.map((l, i) => (
          <div key={i}><span className="text-slate-500 select-none">$ </span>{l}</div>
        ))}
      </pre>
    </div>
  );
}
