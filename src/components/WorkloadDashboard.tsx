import {
  BookOpen, Clock, AlertTriangle, CheckCircle2,
  ShieldCheck, Sparkles, ChevronRight, Target,
  Brain, Flame, Calendar, Layers, ArrowUpRight
} from "lucide-react";
import type { FuzzyResult } from "../lib/fuzzy.ts";
import type {
  DayPlanResult, PriorityLevel, SubjectWithAnalysis,
  TaskRecommendation, WorkloadSummary
} from "../types/academic.ts";
import type { EnhancedRecommendations } from "../lib/recommendation_engine.ts";

interface Props {
  fuzzyResult: FuzzyResult;
  workloadSummary: WorkloadSummary;
  analyzedSubjects: SubjectWithAnalysis[];
  recommendations: TaskRecommendation;
  enhancedInsights: EnhancedRecommendations;
  dayPlan: DayPlanResult;
}

export default function WorkloadDashboard({
  fuzzyResult,
  workloadSummary,
  analyzedSubjects,
  recommendations,
  enhancedInsights,
  dayPlan,
}: Props) {
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

  const severityBadge = (s: "High" | "Medium" | "Low") => {
    switch (s) {
      case "High":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Low":
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* 7 SUMMARY CARDS */}
      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-3.5 reveal-on-scroll">
        {/* 1. Stress Score */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs card-hover relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-700" />
          <div>
            <div className="flex items-center justify-between text-indigo-600 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Stress Score</span>
              <Brain className="w-3.5 h-3.5 shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-indigo-700 font-mono tracking-tight">
              {fuzzyResult.stressScore.toFixed(1)}
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              fuzzyResult.stressLevel === "High" ? "bg-rose-100 text-rose-800" :
              fuzzyResult.stressLevel === "Medium" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
            }`}>
              {fuzzyResult.stressLevel}
            </span>
            <span className="text-[9px] text-slate-400 font-mono">/100</span>
          </div>
        </div>

        {/* 2. Burnout Risk Score */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs card-hover relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-600" />
          <div>
            <div className="flex items-center justify-between text-purple-600 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Burnout Risk</span>
              <Flame className="w-3.5 h-3.5 shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-purple-700 font-mono tracking-tight">
              {fuzzyResult.burnoutScore.toFixed(1)}
            </p>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              fuzzyResult.burnoutRisk === "High" ? "bg-rose-100 text-rose-800" :
              fuzzyResult.burnoutRisk === "Medium" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
            }`}>
              {fuzzyResult.burnoutRisk}
            </span>
            <span className="text-[9px] text-slate-400 font-mono">/100</span>
          </div>
        </div>

        {/* 3. Total Subjects */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Courses</span>
              <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {workloadSummary.totalSubjects}
            </p>
          </div>
          <div className="mt-2">
            <span className="text-[10px] text-slate-500 font-medium">Active courses</span>
          </div>
        </div>

        {/* 4. Estimated Pending Work */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pending Work</span>
              <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {workloadSummary.totalPendingHours}h
            </p>
          </div>
          <div className="mt-2">
            <span className="text-[10px] text-slate-500 font-medium">Estimated hours</span>
          </div>
        </div>

        {/* 5. Upcoming Deadlines */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Deadlines &le;7d</span>
              <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-orange-600 font-mono tracking-tight">
              {workloadSummary.upcomingDeadlinesCount}
            </p>
          </div>
          <div className="mt-2">
            <span className="text-[10px] text-orange-700/80 font-medium font-mono">Due this week</span>
          </div>
        </div>

        {/* 6. Available Study Hours */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Available Study</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-mono tracking-tight">
              {workloadSummary.totalAvailableStudyHours}h
            </p>
          </div>
          <div className="mt-2">
            <span className="text-[10px] text-emerald-700/80 font-medium">
              {dayPlan.totalStudyHours}h planned today
            </span>
          </div>
        </div>

        {/* 7. Estimated Workload Deficit */}
        <div className={`rounded-2xl p-3.5 sm:p-4 border shadow-xs card-hover col-span-1 min-[380px]:col-span-2 sm:col-span-1 flex flex-col justify-between ${
          workloadSummary.hasGap
            ? "bg-rose-50/70 border-rose-200 text-rose-900"
            : "bg-emerald-50/70 border-emerald-200 text-emerald-900"
        }`}>
          <div>
            <div className="flex items-center justify-between opacity-80 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">Workload Gap</span>
              {workloadSummary.hasGap ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
            </div>
            <p className="text-xl sm:text-2xl font-extrabold font-mono tracking-tight">
              {workloadSummary.workloadGap}h
            </p>
          </div>
          <div className="mt-2">
            <span className="text-[10px] font-semibold">
              {workloadSummary.hasGap ? "Deficit exists" : "Workable balance"}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION: "WHAT SHOULD I DO NOW?" */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden border border-indigo-900/60 reveal-on-scroll">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/15 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                What Should I Do Now?
              </h3>
              <p className="text-xs text-indigo-200">
                Actionable focus derived from deadline urgency, preparation gap, and remaining workload.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-indigo-200 bg-white/10 border border-white/15 px-3 py-1 rounded-full self-start sm:self-auto backdrop-blur-xs">
            Recommended focus
          </span>
        </div>

        {recommendations.currentTopTask ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Priority Task */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 flex flex-col justify-between card-hover hover:border-indigo-400/40">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" /> Primary Focus
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    recommendations.currentTopTask.priority === "Very High"
                      ? "bg-rose-500/90 text-white border border-rose-400/40"
                      : "bg-orange-500/90 text-white border border-orange-400/40"
                  }`}>
                    {recommendations.currentTopTask.priority} Priority
                  </span>
                </div>

                <h4 className="text-lg sm:text-xl font-bold text-white mt-1 break-words">
                  {recommendations.currentTopTask.subjectName}
                </h4>

                <div className="mt-2 p-2.5 rounded-xl bg-black/20 border border-white/5">
                  <p className="text-xs text-indigo-200 font-medium break-words">
                    Task / Topic: <span className="text-white font-semibold underline decoration-indigo-400 underline-offset-2">{recommendations.currentTopTask.taskDescription}</span>
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-indigo-200 font-mono">
                  <Clock className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                  <span>Suggested duration: <b className="text-white">~{recommendations.currentTopTask.estimatedMinutes} minutes</b></span>
                </div>
              </div>

              {/* Explicit "WHY THIS IS PRIORITIZED" Header */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300/90 mb-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 shrink-0" /> Why This Is Prioritized
                </p>
                <p className="text-xs text-indigo-100/90 leading-relaxed font-sans break-words">
                  {recommendations.currentTopTask.reason}
                </p>
              </div>
            </div>

            {/* Next Recommended Task */}
            {recommendations.nextRecommendedTask ? (
              <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col justify-between card-hover hover:border-white/20">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                      Suggested Next Task (Optional)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-indigo-200 border border-white/10">
                      {recommendations.nextRecommendedTask.priority} Priority
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-white mt-1 break-words">
                    {recommendations.nextRecommendedTask.subjectName}
                  </h4>

                  <div className="mt-2 p-2.5 rounded-xl bg-black/15 border border-white/5">
                    <p className="text-xs text-indigo-200 font-medium break-words">
                      Task / Topic: <span className="text-white font-semibold">{recommendations.nextRecommendedTask.taskDescription}</span>
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-indigo-300 font-mono">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Duration: ~{recommendations.nextRecommendedTask.estimatedMinutes} minutes</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300/80 mb-1">
                    Context &amp; Priority Rationale
                  </p>
                  <p className="text-xs text-indigo-200/90 leading-relaxed font-sans break-words">
                    {recommendations.nextRecommendedTask.reason}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10 flex items-center justify-center text-center">
                <p className="text-xs text-indigo-300 italic">
                  Once your primary task is completed, you can take a scheduled rest break or review upcoming tasks.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-indigo-200 italic py-4">
            No pending academic subjects. Add courses and deadlines to activate priority recommendations.
          </p>
        )}
      </div>

      {/* SECTION: MAIN CONTRIBUTORS & EXPLAINABLE INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 reveal-on-scroll">
        {/* Main Contributors */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 card-hover">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Main Academic Stress Contributors</h4>
              <p className="text-xs text-slate-500">Key pressure drivers identified across your workload and routine.</p>
            </div>
          </div>

          {enhancedInsights.mainContributors.length === 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 flex items-center gap-2 mt-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>No severe stress contributors detected. Your current routine and workload are balanced!</span>
            </div>
          ) : (
            <div className="space-y-2.5 mt-4">
              {enhancedInsights.mainContributors.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-200 transition flex items-start justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{c.factor}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${severityBadge(c.severity)}`}>
                        {c.severity} Impact
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed text-[11.5px] break-words">{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Context-Aware Personalized Insights */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-slate-50 rounded-3xl p-5 sm:p-6 border border-indigo-100 shadow-sm card-hover flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Personalized Insights</h4>
                <p className="text-xs text-slate-500">Explainable recommendations based on your current inputs.</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed mt-4">
              {enhancedInsights.contextAwareInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-white/90 p-3 rounded-2xl border border-indigo-100/70 shadow-2xs">
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span className="break-words">{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sleep Protection Guarantee */}
          <div className="mt-4 pt-3.5 border-t border-indigo-100/80 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-relaxed font-medium">{enhancedInsights.sleepProtectionMessage}</span>
          </div>
        </div>
      </div>

      {/* SECTION: ACADEMIC WORKLOAD & PRIORITY LIST */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 card-hover reveal-on-scroll">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Priority Rankings &amp; Deadline Details</h4>
              <p className="text-xs text-slate-500">Deterministic 5-factor priority calculation with explainable rationales.</p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono self-start sm:self-auto">
            {analyzedSubjects.length} Subject{analyzedSubjects.length !== 1 ? "s" : ""} Analyzed
          </span>
        </div>

        {analyzedSubjects.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-6">No subjects available.</p>
        ) : (
          <div>
            <p className="text-[11px] text-slate-400 sm:hidden mb-2 font-medium">
              &larr; Swipe horizontally to view full table &rarr;
            </p>
            <div className="overflow-x-auto -mx-1 sm:mx-0 px-1 sm:px-0">
              <table className="w-full text-left text-xs min-w-[560px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="pb-2.5">Subject &amp; Type</th>
                    <th className="pb-2.5">Deadline</th>
                    <th className="pb-2.5">Pending Work</th>
                    <th className="pb-2.5">Prep</th>
                    <th className="pb-2.5">Priority</th>
                    <th className="pb-2.5">Explainable Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {analyzedSubjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pr-3">
                        <p className="font-bold text-slate-900 text-[13px]">{s.name}</p>
                        <span className="text-[10.5px] text-slate-500 font-normal">{s.type} &bull; {s.tasksRemaining}</span>
                      </td>
                      <td className="py-3.5 pr-3 font-mono text-slate-700 whitespace-nowrap">
                        {s.deadline}
                        <span className="block text-[10px] text-slate-400 font-sans">
                          {s.daysRemaining < 0 ? "Past" : s.daysRemaining === 0 ? "Due today" : `${s.daysRemaining}d left`}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 font-mono text-slate-800 whitespace-nowrap font-bold">
                        {s.estimatedHours}h
                      </td>
                      <td className="py-3.5 pr-3 whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${
                          s.preparation === "Low" ? "bg-rose-50 text-rose-700 border-rose-200" :
                          s.preparation === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {s.preparation}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityBadge(s.priority)}`}>
                          {s.priority}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600 text-[11.5px] leading-relaxed max-w-sm">
                        {s.priorityReason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
