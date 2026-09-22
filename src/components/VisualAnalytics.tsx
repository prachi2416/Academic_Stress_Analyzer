import {
  BarChart3, PieChart, Calendar, Clock, AlertTriangle,
  CheckCircle2, Flame, Brain, Hourglass, ArrowUpRight
} from "lucide-react";
import type { FuzzyResult } from "../lib/fuzzy.ts";
import type {
  DayPlanResult, PriorityLevel, SubjectWithAnalysis,
  WorkloadSummary
} from "../types/academic.ts";

interface Props {
  fuzzyResult: FuzzyResult;
  workloadSummary: WorkloadSummary;
  analyzedSubjects: SubjectWithAnalysis[];
  dayPlan: DayPlanResult;
}

export default function VisualAnalytics({
  fuzzyResult,
  workloadSummary,
  analyzedSubjects,
  dayPlan,
}: Props) {
  // 1. Priority Counts
  const priorityCounts: Record<PriorityLevel, number> = {
    "Very High": 0,
    High: 0,
    Medium: 0,
    Low: 0,
  };
  analyzedSubjects.forEach((s) => {
    if (priorityCounts[s.priority] !== undefined) {
      priorityCounts[s.priority]++;
    }
  });

  const totalSubjects = analyzedSubjects.length;

  // 2. Max hours for relative scaling
  const maxSubjectHours = Math.max(1, ...analyzedSubjects.map((s) => s.estimatedHours));

  // 3. Workload vs Available comparison
  const reqHours = workloadSummary.totalPendingHours;
  const availHours = workloadSummary.totalAvailableStudyHours;
  const maxComp = Math.max(1, Math.max(reqHours, availHours));
  const reqPct = Math.min(100, (reqHours / maxComp) * 100);
  const availPct = Math.min(100, (availHours / maxComp) * 100);

  // 4. Sorted upcoming deadlines
  const sortedByDeadline = [...analyzedSubjects].sort((a, b) => a.daysRemaining - b.daysRemaining);

  // 5. Daily study allocation items from dayPlan
  const allocatedItems = Object.entries(dayPlan.allocatedSubjectHours).filter(([, hrs]) => hrs > 0);
  const maxAllocated = Math.max(1, ...allocatedItems.map(([, hrs]) => hrs));

  const priorityColor = (p: PriorityLevel) => {
    switch (p) {
      case "Very High":
        return "bg-rose-500 text-rose-50 border-rose-600";
      case "High":
        return "bg-orange-500 text-orange-50 border-orange-600";
      case "Medium":
        return "bg-amber-500 text-amber-50 border-amber-600";
      case "Low":
        return "bg-emerald-500 text-emerald-50 border-emerald-600";
    }
  };

  const priorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case "Very High":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Low":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 reveal-on-scroll">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Academic Analytics &amp; Visualizations</h3>
            <p className="text-xs text-slate-500">
              Interactive visualizations grounded in actual calculated fuzzy stress, routine availability, and daily plan data.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
            Part 10A Specification
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 reveal-on-scroll">
        {/* 1. STRESS & BURNOUT OVERVIEW */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-7 shadow-xs border border-slate-200 card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-600 shrink-0" />
                <h4 className="text-sm font-bold text-slate-900">1. Stress &amp; Burnout Overview</h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">V1 Mamdani System</span>
            </div>

            <div className="space-y-4">
              {/* Stress Bar */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 flex-wrap gap-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" /> Stress Score
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">{fuzzyResult.stressScore.toFixed(1)} / 100</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      fuzzyResult.stressLevel === "High" ? "bg-rose-100 text-rose-800" :
                      fuzzyResult.stressLevel === "Medium" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {fuzzyResult.stressLevel}
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, fuzzyResult.stressScore)}%` }}
                  />
                </div>
              </div>

              {/* Burnout Bar */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 flex-wrap gap-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Burnout Risk Score
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">{fuzzyResult.burnoutScore.toFixed(1)} / 100</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      fuzzyResult.burnoutRisk === "High" ? "bg-rose-100 text-rose-800" :
                      fuzzyResult.burnoutRisk === "Medium" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {fuzzyResult.burnoutRisk}
                    </span>
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-600 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, fuzzyResult.burnoutScore)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-4 text-[10px] sm:text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-1 border-t border-slate-100 font-mono">
            <span>&lt;40: Low</span>
            <span>40–64: Moderate</span>
            <span>&ge;65: Elevated Action</span>
          </div>
        </div>

        {/* 2. AVAILABLE STUDY TIME VS REQUIRED WORK (WORKLOAD GAP) */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-7 shadow-xs border border-slate-200 card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <h4 className="text-sm font-bold text-slate-900">2. Available Study Time vs Required Work</h4>
              </div>
              {workloadSummary.hasGap ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200 font-mono">
                  <AlertTriangle className="w-3 h-3 shrink-0" /> Gap: {workloadSummary.workloadGap}h
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-mono">
                  <CheckCircle2 className="w-3 h-3 shrink-0" /> Balanced
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-medium flex-wrap gap-1">
                  <span className="text-slate-600">Pending Academic Workload:</span>
                  <span className="font-bold font-mono text-slate-900">{reqHours} hrs</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${reqPct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-medium flex-wrap gap-1">
                  <span className="text-slate-600">Available Study Time (Before Deadlines):</span>
                  <span className="font-bold font-mono text-slate-900">{availHours} hrs</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                    style={{ width: `${availPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`p-3 mt-4 rounded-xl border text-xs leading-relaxed break-words ${
            workloadSummary.hasGap
              ? "bg-rose-50/70 border-rose-200 text-rose-800"
              : "bg-emerald-50/70 border-emerald-200 text-emerald-800"
          }`}>
            <p className="font-semibold mb-0.5 flex items-center gap-1.5">
              {workloadSummary.hasGap ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  Estimated Workload Deficit
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Manageable Time Budget
                </>
              )}
            </p>
            <p className="text-[11px] opacity-90 break-words">{workloadSummary.workloadGapExplanation}</p>
          </div>
        </div>

        {/* 3. SUBJECT WORKLOAD (HOURS PER SUBJECT) */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-7 shadow-xs border border-slate-200 card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600 shrink-0" />
                <h4 className="text-sm font-bold text-slate-900">3. Subject Workload (Pending Hours)</h4>
              </div>
              <span className="text-[11px] text-slate-500 font-mono font-bold">Total: {reqHours}h</span>
            </div>

            {analyzedSubjects.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">No subjects added yet.</p>
            ) : (
              <div className="space-y-3.5">
                {analyzedSubjects.map((s) => {
                  const pct = Math.min(100, (s.estimatedHours / maxSubjectHours) * 100);
                  return (
                    <div key={s.id}>
                      <div className="flex justify-between items-center text-xs mb-1 gap-2">
                        <span className="font-semibold text-slate-800 truncate min-w-0 flex-1">{s.name}</span>
                        <span className="font-mono font-bold text-slate-800 shrink-0">{s.estimatedHours} hrs</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span>Visualized proportionally</span>
            <span className="font-mono">Max: {maxSubjectHours}h</span>
          </p>
        </div>

        {/* 4. PRIORITY DISTRIBUTION */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-7 shadow-xs border border-slate-200 card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600 shrink-0" />
                <h4 className="text-sm font-bold text-slate-900">4. Priority Distribution</h4>
              </div>
              <span className="text-[11px] text-slate-500 font-mono font-bold">{totalSubjects} Subjects</span>
            </div>

            {totalSubjects === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">No subjects to classify.</p>
            ) : (
              <div>
                {/* Proportional Segmented Bar */}
                <div className="w-full h-4 min-h-[16px] rounded-xl overflow-hidden flex bg-slate-100 mb-4 p-0.5 border border-slate-200 shadow-2xs">
                  {(["Very High", "High", "Medium", "Low"] as PriorityLevel[]).map((level) => {
                    const count = priorityCounts[level];
                    if (count === 0) return null;
                    const pct = (count / totalSubjects) * 100;
                    return (
                      <div
                        key={level}
                        className={`h-full ${priorityColor(level)} first:rounded-l-lg last:rounded-r-lg transition-all`}
                        style={{ width: `${pct}%` }}
                        title={`${level}: ${count} subject(s)`}
                      />
                    );
                  })}
                </div>

                {/* Priority Count Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  {(["Very High", "High", "Medium", "Low"] as PriorityLevel[]).map((level) => {
                    const count = priorityCounts[level];
                    return (
                      <div
                        key={level}
                        className={`p-3 rounded-2xl border text-center ${priorityBadge(level)} card-hover`}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider">{level}</p>
                        <p className="text-lg sm:text-xl font-extrabold mt-0.5 font-mono">{count}</p>
                        <span className="text-[9px] opacity-75 font-medium font-mono">
                          {totalSubjects > 0 ? `${Math.round((count / totalSubjects) * 100)}%` : "0%"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <p className="text-[10.5px] sm:text-[11px] text-slate-400 pt-3 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1">
            <span>Derived via 5-factor scoring engine</span>
            <span className="text-indigo-600 font-medium flex items-center gap-0.5">
              Explainable <ArrowUpRight className="w-3 h-3" />
            </span>
          </p>
        </div>

        {/* 5. UPCOMING DEADLINES VISUALIZATION */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-7 shadow-xs border border-slate-200 card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <h4 className="text-sm font-bold text-slate-900">5. Upcoming Deadlines Timeline</h4>
              </div>
              <span className="text-[11px] text-slate-400">Sorted by Urgency</span>
            </div>

            {sortedByDeadline.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">No deadlines scheduled.</p>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {sortedByDeadline.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition text-xs gap-2"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm truncate">{s.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-200/70 text-slate-700">
                          {s.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        Due: {s.deadline} ({s.daysRemaining < 0 ? "Past" : s.daysRemaining === 0 ? "Today" : `${s.daysRemaining}d left`})
                      </p>
                    </div>
                    <div className="flex min-[420px]:flex-col items-center min-[420px]:items-end justify-between min-[420px]:justify-start gap-1 shrink-0">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${priorityBadge(s.priority)}`}>
                        {s.priority}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono font-semibold">{s.estimatedHours}h work</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 pt-3 mt-4 border-t border-slate-100">
            Chronological ranking ensuring imminent deadlines receive study priority.
          </p>
        </div>

        {/* 6. DAILY STUDY ALLOCATION */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-7 shadow-xs border border-slate-200 card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-indigo-600 shrink-0" />
                <h4 className="text-sm font-bold text-slate-900">6. Today's Planned Study Allocation</h4>
              </div>
              <span className="text-[11px] text-indigo-700 font-mono font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {dayPlan.totalStudyHours}h Scheduled Today
              </span>
            </div>

            {allocatedItems.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 italic">
                No study tasks currently scheduled for today. Check your daily routine and available study time.
              </div>
            ) : (
              <div className="space-y-3.5">
                {allocatedItems.map(([subjectName, hours]) => {
                  const pct = Math.min(100, (hours / maxAllocated) * 100);
                  return (
                    <div key={subjectName}>
                      <div className="flex justify-between items-center text-xs mb-1 gap-2">
                        <span className="font-semibold text-slate-800 truncate min-w-0 flex-1">{subjectName}</span>
                        <span className="font-mono font-bold text-indigo-700 shrink-0">{hours} hrs</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 mt-4 text-[10.5px] sm:text-[11px] text-slate-500 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-1">
            <span>Today's Total: <b>{dayPlan.totalStudyHours}h</b></span>
            <span>Unallocated Pending Work: <b>{dayPlan.unallocatedWorkloadHours}h</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}
