import { inputMembershipSeries, trimf, type InputConfig, type Term } from '../lib/fuzzyEngine';

interface Props {
  cfg: InputConfig;
  value: number;
}

const TERM_COLORS: Record<Term, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

const W = 320;
const H = 160;
const PAD = { l: 28, r: 12, t: 12, b: 26 };

export default function MembershipPlot({ cfg, value }: Props) {
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const xScale = (x: number) =>
    PAD.l + ((x - cfg.min) / (cfg.max - cfg.min)) * innerW;
  const yScale = (y: number) => PAD.t + (1 - y) * innerH;

  const terms: Term[] = ['low', 'medium', 'high'];

  const buildPath = (term: Term) => {
    const series = inputMembershipSeries(cfg, term, 120);
    return series
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${xScale(x).toFixed(1)} ${yScale(y).toFixed(1)}`)
      .join(' ');
  };

  const valX = xScale(Math.max(cfg.min, Math.min(cfg.max, value)));

  // membership of current value
  const activeTerms = terms
    .map((t) => ({ t, m: trimf(value, cfg.terms[t]) }))
    .filter((o) => o.m > 0.001);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-1 flex items-center justify-between px-1">
        <span className="text-sm font-bold text-slate-800">{cfg.label}</span>
        <span className="font-mono text-xs text-slate-500">
          {cfg.min}–{cfg.max} {cfg.unit}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1={PAD.l}
            x2={W - PAD.r}
            y1={yScale(g)}
            y2={yScale(g)}
            stroke="#eef2f7"
            strokeWidth={1}
          />
        ))}
        {/* axes */}
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="#cbd5e1" strokeWidth={1} />

        {/* membership curves */}
        {terms.map((t) => (
          <path
            key={t}
            d={buildPath(t)}
            fill="none"
            stroke={TERM_COLORS[t]}
            strokeWidth={2.2}
            opacity={0.85}
          />
        ))}

        {/* value marker */}
        <line
          x1={valX}
          x2={valX}
          y1={PAD.t}
          y2={H - PAD.b}
          stroke="#0f172a"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
        <circle cx={valX} cy={H - PAD.b} r={3} fill="#0f172a" />

        {/* x labels */}
        <text x={PAD.l} y={H - 8} fontSize={9} fill="#94a3b8" textAnchor="middle">
          {cfg.min}
        </text>
        <text x={W - PAD.r} y={H - 8} fontSize={9} fill="#94a3b8" textAnchor="end">
          {cfg.max}
        </text>

        {/* legend */}
        {terms.map((t, i) => (
          <g key={t} transform={`translate(${PAD.l + 4 + i * 56}, ${PAD.t + 2})`}>
            <rect width={9} height={9} rx={2} fill={TERM_COLORS[t]} opacity={0.85} />
            <text x={13} y={8} fontSize={9} fill="#64748b" fontWeight={600}>
              {t}
            </text>
          </g>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap items-center gap-1.5 px-1">
        <span className="font-mono text-xs text-slate-500">value = {value}{cfg.unit}</span>
        {activeTerms.length > 0 ? (
          activeTerms.map((a) => (
            <span
              key={a.t}
              className="rounded px-1.5 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: `${TERM_COLORS[a.t]}1a`, color: TERM_COLORS[a.t] }}
            >
              {a.t}: {a.m.toFixed(2)}
            </span>
          ))
        ) : (
          <span className="text-[10px] text-slate-400">no term active</span>
        )}
      </div>
    </div>
  );
}
