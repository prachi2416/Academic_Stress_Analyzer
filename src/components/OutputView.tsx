import { trimf, type InferenceResult, type OutputConfig } from '../lib/fuzzyEngine';

interface Props {
  result: InferenceResult;
  output: OutputConfig;
}

const W = 360;
const H = 180;
const PAD = { l: 30, r: 14, t: 14, b: 28 };

const TERM_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
} as const;

export default function OutputView({ result, output }: Props) {
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const xScale = (x: number) => PAD.l + (x / 100) * innerW;
  const yScale = (y: number) => PAD.t + (1 - y) * innerH;

  const terms = ['low', 'medium', 'high'] as const;

  // build aggregated area path
  const aggPath =
    result.aggregated.length > 0
      ? result.universe
          .map((x, i) => {
            const px = xScale(x);
            const py = yScale(result.aggregated[i]);
            return `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`;
          })
          .join(' ')
      : '';

  // filled area down to baseline
  const lastX = xScale(result.universe[result.universe.length - 1] ?? 100);
  const fillPath = `${aggPath} L ${lastX.toFixed(1)} ${yScale(0).toFixed(1)} L ${xScale(
    result.universe[0] ?? 0
  ).toFixed(1)} ${yScale(0).toFixed(1)} Z`;

  const termPaths = terms.map((t) => {
    const pts: string[] = [];
    for (let x = 0; x <= 100; x += 1) {
      pts.push(`${x === 0 ? 'M' : 'L'} ${xScale(x).toFixed(1)} ${yScale(trimf(x, output.terms[t])).toFixed(1)}`);
    }
    return { t, d: pts.join(' ') };
  });

  const scoreX = xScale(Math.max(0, Math.min(100, result.score)));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-800">{output.label} output (0–100)</span>
        <span
          className="font-mono text-sm font-bold"
          style={{ color: output.color }}
        >
          {result.score.toFixed(2)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
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
        {/* category boundaries */}
        {[40, 70].map((b) => (
          <line
            key={b}
            x1={xScale(b)}
            x2={xScale(b)}
            y1={PAD.t}
            y2={H - PAD.b}
            stroke="#e2e8f0"
            strokeWidth={1}
            strokeDasharray="2 3"
          />
        ))}
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke="#cbd5e1" strokeWidth={1} />
        <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="#cbd5e1" strokeWidth={1} />

        {/* faint term MFs */}
        {termPaths.map((p) => (
          <path key={p.t} d={p.d} fill="none" stroke={TERM_COLORS[p.t]} strokeWidth={1.4} opacity={0.25} />
        ))}

        {/* aggregated area */}
        {aggPath && <path d={fillPath} fill={output.color} opacity={0.18} />}
        {aggPath && <path d={aggPath} fill="none" stroke={output.color} strokeWidth={2.4} />}

        {/* centroid marker */}
        <line
          x1={scoreX}
          x2={scoreX}
          y1={PAD.t}
          y2={H - PAD.b}
          stroke="#0f172a"
          strokeWidth={1.8}
        />
        <circle cx={scoreX} cy={H - PAD.b} r={3.5} fill="#0f172a" />
        <text x={scoreX} y={PAD.t + 10} fontSize={9} fontWeight={700} fill="#0f172a" textAnchor="middle">
          {result.score.toFixed(1)}
        </text>

        <text x={xScale(0)} y={H - 8} fontSize={9} fill="#94a3b8" textAnchor="start">0</text>
        <text x={xScale(40)} y={H - 8} fontSize={9} fill="#94a3b8" textAnchor="middle">40</text>
        <text x={xScale(70)} y={H - 8} fontSize={9} fill="#94a3b8" textAnchor="middle">70</text>
        <text x={xScale(100)} y={H - 8} fontSize={9} fill="#94a3b8" textAnchor="end">100</text>
      </svg>
      <p className="mt-1 px-1 text-[11px] leading-snug text-slate-500">
        Filled area = aggregated fuzzy set (max of clipped rule outputs). The
        vertical line is the crisp score after <strong>centroid defuzzification</strong>.
        Dashed lines mark the Low/Medium/High boundaries (40, 70).
      </p>
    </div>
  );
}
