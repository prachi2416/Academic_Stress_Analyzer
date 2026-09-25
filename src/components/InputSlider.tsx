import { trimf, type InputConfig, type Term } from '../lib/fuzzyEngine';

interface Props {
  cfg: InputConfig;
  value: number;
  onChange: (v: number) => void;
}

const TERM_COLORS: Record<Term, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

export default function InputSlider({ cfg, value, onChange }: Props) {
  const terms: Term[] = ['low', 'medium', 'high'];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-bold text-slate-800">{cfg.label}</label>
        <span className="font-mono text-lg font-extrabold text-indigo-600">
          {value}
          <span className="ml-0.5 text-xs font-medium text-slate-400">{cfg.unit}</span>
        </span>
      </div>

      <input
        type="range"
        min={cfg.min}
        max={cfg.max}
        step={cfg.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="mt-3"
        aria-label={cfg.label}
      />
      <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-400">
        <span>{cfg.min}</span>
        <span>{cfg.max}</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {terms.map((t) => {
          const m = trimf(value, cfg.terms[t]);
          return (
            <div key={t} className="rounded-lg bg-slate-50 px-2 py-1.5">
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-bold uppercase"
                  style={{ color: TERM_COLORS[t] }}
                >
                  {t}
                </span>
                <span className="font-mono text-[10px] text-slate-500">{m.toFixed(2)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{ width: `${m * 100}%`, backgroundColor: TERM_COLORS[t] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
