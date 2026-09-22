import {
  Calendar, Clock, ShieldCheck, AlertCircle, Coffee,
  BookOpen, Moon, School, Car, CheckCircle2
} from "lucide-react";
import type { DayPlanResult, DailyScheduleBlock, ScheduleBlockType } from "../types/academic.ts";

interface Props {
  dayPlan: DayPlanResult;
}

export default function DailyPlanTimeline({ dayPlan }: Props) {
  const getBlockStyle = (type: ScheduleBlockType) => {
    switch (type) {
      case "sleep":
        return {
          icon: Moon,
          color: "border-indigo-200 bg-indigo-50/70 text-indigo-900",
          badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
        };
      case "college":
        return {
          icon: School,
          color: "border-blue-200 bg-blue-50/70 text-blue-900",
          badge: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "travel":
        return {
          icon: Car,
          color: "border-slate-200 bg-slate-50 text-slate-800",
          badge: "bg-slate-200/70 text-slate-700 border-slate-300",
        };
      case "meal":
        return {
          icon: Coffee,
          color: "border-amber-200 bg-amber-50/70 text-amber-900",
          badge: "bg-amber-100 text-amber-800 border-amber-200",
        };
      case "commitment":
        return {
          icon: Clock,
          color: "border-purple-200 bg-purple-50/70 text-purple-900",
          badge: "bg-purple-100 text-purple-800 border-purple-200",
        };
      case "study":
        return {
          icon: BookOpen,
          color: "border-emerald-200 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500/20",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold",
        };
      case "break":
        return {
          icon: Coffee,
          color: "border-slate-200 bg-white text-slate-600 border-dashed",
          badge: "bg-slate-100 text-slate-600 border-slate-200",
        };
    }
  };

  const priorityBadge = (p?: string) => {
    switch (p) {
      case "Very High":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Medium":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Low":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-7 shadow-sm border border-slate-200 reveal-on-scroll">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Today's Priority-Based Academic Plan</h3>
            <p className="text-xs text-slate-500">
              Realistic, conflict-free study allocations based on your actual available time blocks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Sleep &amp; Routine Protected
          </span>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className={`p-3.5 sm:p-4 rounded-2xl mb-5 sm:mb-6 border text-xs leading-relaxed flex items-start gap-3 shadow-2xs reveal-on-scroll ${
        dayPlan.hasWorkloadGap
          ? "bg-amber-50/70 border-amber-200 text-amber-900"
          : "bg-emerald-50/70 border-emerald-200 text-emerald-900"
      }`}>
        {dayPlan.hasWorkloadGap ? (
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        )}
        <div>
          <p className="font-semibold break-words">{dayPlan.explanation}</p>
          <p className="text-[11px] opacity-80 mt-1">
            Note: Study sessions are never scheduled into your sleep hours or class commitments.
          </p>
        </div>
      </div>

      {/* Timeline Blocks */}
      {dayPlan.blocks.length === 0 ? (
        <p className="text-xs text-slate-400 italic text-center py-8">
          Unable to generate a schedule. Please check that your daily routine inputs leave realistic study windows.
        </p>
      ) : (
        <div className="space-y-3 relative before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100">
          {dayPlan.blocks.map((b: DailyScheduleBlock, index: number) => {
            const style = getBlockStyle(b.type);
            const Icon = style.icon;
            // Cap stagger classes up to 7, else fallback
            const staggerClass = `stagger-${Math.min(index + 1, 7)}`;

            return (
              <div
                key={b.id}
                className={`card-hover relative flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${style.color} ml-1 reveal-on-scroll ${staggerClass}`}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/95 border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 break-words">{b.title}</span>
                      {b.priority && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-2xs ${priorityBadge(b.priority)}`}>
                          {b.priority} Priority
                        </span>
                      )}
                      <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md border ${style.badge}`}>
                        {b.type === "study" ? "Study Session" : b.type}
                      </span>
                    </div>

                    <div className="text-left sm:text-right shrink-0 mt-0.5 sm:mt-0">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {b.startTime} – {b.endTime}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1.5 font-medium">
                        ({b.durationMinutes} min)
                      </span>
                    </div>
                  </div>

                  {b.subtitle && (
                    <p className="text-xs text-slate-600 mt-1.5 leading-normal font-medium break-words">
                      {b.subtitle}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
