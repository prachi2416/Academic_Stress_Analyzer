import { useState } from "react";
import {
  BookOpen, Plus, Edit2, Trash2, Calendar, Clock,
  CheckCircle2, AlertCircle, X, Layers
} from "lucide-react";
import type { Subject, SubjectType, Level } from "../types/academic.ts";
import { validateSubject } from "../lib/validation.ts";
import { getFutureDateStr } from "../lib/storage.ts";

interface Props {
  subjects: Subject[];
  onChange: (subjects: Subject[]) => void;
}

const EMPTY_FORM: Omit<Subject, "id"> = {
  name: "",
  deadline: getFutureDateStr(7),
  type: "Exam",
  tasksRemaining: "",
  estimatedHours: 6,
  difficulty: "Medium",
  preparation: "Medium",
  importance: "High",
};

export default function SubjectManager({ subjects, onChange }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Subject, "id">>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      ...EMPTY_FORM,
      deadline: getFutureDateStr(7),
    });
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setFormData({
      name: sub.name,
      deadline: sub.deadline,
      type: sub.type,
      tasksRemaining: sub.tasksRemaining,
      estimatedHours: sub.estimatedHours,
      difficulty: sub.difficulty,
      preparation: sub.preparation,
      importance: sub.importance,
    });
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    onChange(subjects.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    const candidate: Partial<Subject> = {
      ...formData,
      name: formData.name.trim(),
      tasksRemaining: formData.tasksRemaining.trim(),
      estimatedHours: Number(formData.estimatedHours),
    };

    const errors = validateSubject(candidate);
    if (errors.length > 0) {
      setFormErrors(errors.map((e) => e.message));
      return;
    }

    if (editingId) {
      // Edit existing
      onChange(
        subjects.map((s) =>
          s.id === editingId
            ? { ...s, ...candidate } as Subject
            : s
        )
      );
    } else {
      // Add new
      const newSubject: Subject = {
        id: "sub-" + Date.now(),
        ...candidate,
        createdAt: Date.now(),
      } as Subject;
      onChange([...subjects, newSubject]);
    }

    setIsModalOpen(false);
  };

  const levelColor = (lvl: Level) => {
    switch (lvl) {
      case "High":
        return "text-rose-700 bg-rose-50 border-rose-200";
      case "Medium":
        return "text-amber-700 bg-amber-50 border-amber-200";
      case "Low":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
    }
  };

  const typeBadgeColor = (type: SubjectType) => {
    switch (type) {
      case "Exam":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Assignment":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Project":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-7 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Academic Subjects &amp; Deadlines</h3>
            <p className="text-xs text-slate-500">
              Manage all subjects, pending topics, deadlines, difficulty, and preparation levels.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-purple-500/20 transition cursor-pointer w-full sm:w-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* Subjects Cards Grid */}
      {subjects.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 reveal-on-scroll">
          <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-slate-700">No Academic Subjects Added</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add your courses, upcoming exams, or assignments to calculate your pending workload and priority ranking.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-lg transition btn-press cursor-pointer min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5" /> Add First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 reveal-on-scroll">
          {subjects.map((sub) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dDate = new Date(`${sub.deadline}T00:00:00`);
            const daysLeft = Math.ceil((dDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={sub.id}
                className="relative bg-white border border-slate-200 hover:border-indigo-300 rounded-3xl p-4 sm:p-6 shadow-xs card-hover flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: [TYPE] and [X DAYS LEFT] + Actions */}
                  <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${typeBadgeColor(sub.type)}`}>
                        {sub.type}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border font-mono ${
                        daysLeft <= 2
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : daysLeft <= 5
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {daysLeft < 0 ? "Past due" : daysLeft === 0 ? "Due today" : `${daysLeft} days left`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(sub)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition btn-press cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                        title="Edit subject"
                        aria-label={`Edit ${sub.name}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition btn-press cursor-pointer min-w-[38px] min-h-[38px] flex items-center justify-center"
                        title="Delete subject"
                        aria-label={`Delete ${sub.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subject Name */}
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug break-words">
                    {sub.name}
                  </h4>

                  {/* Pending Tasks with subtle divider */}
                  <div className="my-3 pt-2.5 border-t border-slate-100">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                      Pending Tasks / Topics
                    </p>
                    <p className="text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 leading-relaxed font-medium break-words">
                      {sub.tasksRemaining}
                    </p>
                  </div>
                </div>

                <div>
                  {/* Estimated Work and Deadline */}
                  <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2 sm:gap-3 py-2.5 border-t border-slate-100 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Estimated Work: <b className="text-slate-900 font-mono">{sub.estimatedHours}h</b></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Deadline: <span className="font-mono text-slate-800">{sub.deadline}</span></span>
                    </div>
                  </div>

                  {/* Difficulty, Preparation, Importance Pill Row */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2.5 border-t border-slate-100 text-center text-[10px] sm:text-[11px]">
                    <div className={`py-1 px-1 rounded-lg border font-semibold ${levelColor(sub.difficulty)}`}>
                      <span className="text-[9px] uppercase tracking-wider opacity-70 block">Difficulty</span>
                      {sub.difficulty}
                    </div>
                    <div className={`py-1 px-1 rounded-lg border font-semibold ${levelColor(sub.preparation)}`}>
                      <span className="text-[9px] uppercase tracking-wider opacity-70 block">Preparation</span>
                      {sub.preparation}
                    </div>
                    <div className={`py-1 px-1 rounded-lg border font-semibold ${levelColor(sub.importance)}`}>
                      <span className="text-[9px] uppercase tracking-wider opacity-70 block">Importance</span>
                      {sub.importance}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-2xl border border-slate-200 overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? "Edit Academic Subject" : "Add New Subject"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Please check the form:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5">
                  {formErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subject Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Machine Learning, DBMS, Applied Statistics"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm min-h-[42px] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SubjectType })}
                    className="w-full px-3 py-2 text-sm min-h-[42px] rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Exam">Exam</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Project">Project</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Deadline Date *</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 text-sm min-h-[42px] rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Topics / Tasks Remaining *</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Chapters 3 & 4, Practice Problem Set 2, Code documentation"
                  value={formData.tasksRemaining}
                  onChange={(e) => setFormData({ ...formData, tasksRemaining: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Estimated Hours Required *</label>
                <input
                  type="number"
                  min={0.5}
                  max={200}
                  step={0.5}
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm min-h-[42px] font-semibold font-mono rounded-xl border border-slate-200"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">Estimated focused study time required to complete remaining work</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Level })}
                    className="w-full px-2.5 py-2 text-xs min-h-[40px] rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Preparation</label>
                  <select
                    value={formData.preparation}
                    onChange={(e) => setFormData({ ...formData, preparation: e.target.value as Level })}
                    className="w-full px-2.5 py-2 text-xs min-h-[40px] rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Low">Low (Behind)</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High (Ready)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Importance</label>
                  <select
                    value={formData.importance}
                    onChange={(e) => setFormData({ ...formData, importance: e.target.value as Level })}
                    className="w-full px-2.5 py-2 text-xs min-h-[40px] rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High (Core)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 mt-5 sm:mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer min-h-[44px] text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition cursor-pointer min-h-[44px] text-center"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {editingId ? "Update Subject" : "Add Subject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
