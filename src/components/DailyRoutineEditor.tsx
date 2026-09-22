import { useState } from "react";
import {
  Clock, Moon, School, Car, ShieldCheck,
  AlertTriangle, Plus, Trash2, CalendarClock, Sparkles
} from "lucide-react";
import type { DailyRoutine, FixedCommitment } from "../types/academic.ts";
import { calculateRoutineSummary } from "../lib/routine_engine.ts";
import { validateRoutine } from "../lib/validation.ts";

interface Props {
  routine: DailyRoutine;
  onChange: (routine: DailyRoutine) => void;
}

export default function DailyRoutineEditor({ routine, onChange }: Props) {
  const summary = calculateRoutineSummary(routine);
  const errors = validateRoutine(routine);

  const [newCommitmentName, setNewCommitmentName] = useState("");
  const [newCommitmentStart, setNewCommitmentStart] = useState("18:00");
  const [newCommitmentEnd, setNewCommitmentEnd] = useState("19:00");
  const [showAddCommitment, setShowAddCommitment] = useState(false);

  const updateField = <K extends keyof DailyRoutine>(field: K, value: DailyRoutine[K]) => {
    onChange({ ...routine, [field]: value });
  };

  const handleAddCommitment = () => {
    if (!newCommitmentName.trim()) return;
    const item: FixedCommitment = {
      id: "fc-" + Date.now(),
      name: newCommitmentName.trim(),
      start: newCommitmentStart,
      end: newCommitmentEnd,
    };
    onChange({
      ...routine,
      fixedCommitments: [...routine.fixedCommitments, item],
    });
    setNewCommitmentName("");
    setShowAddCommitment(false);
  };

  const handleRemoveCommitment = (id: string) => {
    onChange({
      ...routine,
      fixedCommitments: routine.fixedCommitments.filter((c) => c.id !== id),
    });
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-7 shadow-sm border border-slate-200 reveal-on-scroll">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Daily Routine &amp; Protected Hours</h3>
            <p className="text-xs text-slate-500">
              Protects your sleep, college, travel, and meals before calculating realistic study time.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {summary.isValid ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Sleep &amp; Commitments Protected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> Schedule Conflict
            </span>
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-5 sm:mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1 reveal-on-scroll">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Please resolve the following routine conflicts:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-5">
            {errors.map((e, idx) => (
              <li key={idx} className="break-words">{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Routine Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mb-6">
        {/* Wake-up Time */}
        <div className="card-hover p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all duration-200 reveal-on-scroll stagger-1">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Wake-up Time
          </label>
          <input
            type="time"
            value={routine.wakeTime}
            onChange={(e) => updateField("wakeTime", e.target.value)}
            className="w-full px-3 py-2 text-sm min-h-[40px] font-semibold font-mono rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Morning wake-up time</p>
        </div>

        {/* Sleep Time */}
        <div className="card-hover p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all duration-200 reveal-on-scroll stagger-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
            <Moon className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> Sleep Time
          </label>
          <input
            type="time"
            value={routine.sleepTime}
            onChange={(e) => updateField("sleepTime", e.target.value)}
            className="w-full px-3 py-2 text-sm min-h-[40px] font-semibold font-mono rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Bedtime ({summary.sleepHours}h protected)</p>
        </div>

        {/* College Hours */}
        <div className="card-hover p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all duration-200 reveal-on-scroll stagger-3">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
            <School className="w-3.5 h-3.5 text-blue-500 shrink-0" /> College Window
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="time"
              value={routine.collegeStart}
              onChange={(e) => updateField("collegeStart", e.target.value)}
              className="w-full px-2 py-2 text-xs min-h-[40px] font-semibold font-mono rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <input
              type="time"
              value={routine.collegeEnd}
              onChange={(e) => updateField("collegeEnd", e.target.value)}
              className="w-full px-2 py-2 text-xs min-h-[40px] font-semibold font-mono rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{summary.collegeHours}h college attendance</p>
        </div>

        {/* Travel & Meals */}
        <div className="card-hover p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all duration-200 reveal-on-scroll stagger-4">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
            <Car className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Travel &amp; Meals
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5 font-medium">Travel (min)</span>
              <input
                type="number"
                min={0}
                max={240}
                step={15}
                value={routine.travelMinutes}
                onChange={(e) => updateField("travelMinutes", Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 text-xs min-h-[38px] font-mono font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block mb-0.5 font-medium">Meals (min)</span>
              <input
                type="number"
                min={0}
                max={240}
                step={15}
                value={routine.mealMinutes}
                onChange={(e) => updateField("mealMinutes", Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 text-xs min-h-[38px] font-mono font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">{((routine.travelMinutes + routine.mealMinutes) / 60).toFixed(1)}h protected</p>
        </div>
      </div>

      {/* Fixed Commitments List */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50/50 reveal-on-scroll stagger-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600 shrink-0" />
            <h4 className="text-sm font-bold text-slate-800">Fixed Commitments</h4>
            <span className="text-xs text-slate-400 font-medium">({routine.fixedCommitments.length})</span>
          </div>
          {!showAddCommitment && (
            <button
              onClick={() => setShowAddCommitment(true)}
              className="btn-press inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 px-3 py-1.5 rounded-xl transition cursor-pointer border border-indigo-100 min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5" /> Add Commitment
            </button>
          )}
        </div>

        {showAddCommitment && (
          <div className="mb-3 p-3.5 bg-white rounded-xl border border-indigo-200 shadow-sm flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5">
            <input
              type="text"
              placeholder="Commitment name (e.g. Gym, Coaching)"
              value={newCommitmentName}
              onChange={(e) => setNewCommitmentName(e.target.value)}
              className="w-full sm:flex-1 sm:min-w-[160px] text-xs px-3 py-2 min-h-[40px] rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <div className="flex items-center justify-between sm:justify-start gap-1.5 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">From</span>
              <input
                type="time"
                value={newCommitmentStart}
                onChange={(e) => setNewCommitmentStart(e.target.value)}
                className="text-xs px-2.5 py-2 min-h-[40px] rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 flex-1 sm:flex-initial"
              />
              <span className="text-xs text-slate-500 font-medium">To</span>
              <input
                type="time"
                value={newCommitmentEnd}
                onChange={(e) => setNewCommitmentEnd(e.target.value)}
                className="text-xs px-2.5 py-2 min-h-[40px] rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 flex-1 sm:flex-initial"
              />
            </div>
            <div className="flex items-center gap-2 justify-end w-full sm:w-auto pt-1 sm:pt-0">
              <button
                onClick={handleAddCommitment}
                className="btn-press text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 min-h-[40px] rounded-lg transition shadow-xs cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => setShowAddCommitment(false)}
                className="btn-press text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3.5 py-2 min-h-[40px] rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {routine.fixedCommitments.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No custom fixed commitments added yet (e.g. gym, part-time work, sports).</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {routine.fixedCommitments.map((c) => (
              <div
                key={c.id}
                className="card-hover inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-2xs transition-all duration-200"
              >
                <span className="font-semibold text-slate-800 break-words">{c.name}</span>
                <span className="text-slate-400 font-mono font-medium whitespace-nowrap">
                  {c.start} – {c.end}
                </span>
                <button
                  onClick={() => handleRemoveCommitment(c.id)}
                  className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer rounded-md hover:bg-rose-50 min-w-[28px] min-h-[28px] flex items-center justify-center"
                  title="Remove commitment"
                  aria-label={`Remove ${c.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Routine Breakdown Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5 pt-5 border-t border-slate-100 text-center reveal-on-scroll stagger-6">
        <div className="card-hover p-2.5 sm:p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 transition-all duration-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Sleep</p>
          <p className="text-sm sm:text-base font-extrabold text-indigo-950 mt-0.5">{summary.sleepHours}h</p>
          <span className="text-[9px] text-indigo-500 font-medium">Protected</span>
        </div>
        <div className="card-hover p-2.5 sm:p-3 rounded-2xl bg-blue-50/70 border border-blue-100/80 transition-all duration-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">College</p>
          <p className="text-sm sm:text-base font-extrabold text-blue-950 mt-0.5">{summary.collegeHours}h</p>
          <span className="text-[9px] text-blue-500 font-medium">Protected</span>
        </div>
        <div className="card-hover p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 transition-all duration-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Travel</p>
          <p className="text-sm sm:text-base font-extrabold text-slate-800 mt-0.5">{summary.travelHours}h</p>
          <span className="text-[9px] text-slate-400 font-medium">Protected</span>
        </div>
        <div className="card-hover p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 transition-all duration-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Meals</p>
          <p className="text-sm sm:text-base font-extrabold text-slate-800 mt-0.5">{summary.mealHours}h</p>
          <span className="text-[9px] text-slate-400 font-medium">Protected</span>
        </div>
        <div className="card-hover p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 transition-all duration-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fixed</p>
          <p className="text-sm sm:text-base font-extrabold text-slate-800 mt-0.5">{summary.fixedCommitmentHours}h</p>
          <span className="text-[9px] text-slate-400 font-medium">Protected</span>
        </div>
        <div className="card-hover p-2.5 sm:p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 transition-all duration-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Total Bound</p>
          <p className="text-sm sm:text-base font-extrabold text-amber-900 mt-0.5">{summary.totalProtectedHours}h</p>
          <span className="text-[9px] text-amber-600 font-medium">of 24h</span>
        </div>
        <div className="card-hover p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 col-span-2 sm:col-span-1 border border-emerald-400/30 transition-all duration-200 ring-2 ring-emerald-400/20">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-200" /> Available Study
          </p>
          <p className="text-lg sm:text-xl font-extrabold mt-0.5 text-white drop-shadow-xs">{summary.availableStudyHours}h</p>
          <span className="text-[9px] text-emerald-100 font-semibold inline-block px-1.5 py-0.2 bg-white/20 rounded-full mt-0.5">Realistic / day</span>
        </div>
      </div>
    </div>
  );
}
