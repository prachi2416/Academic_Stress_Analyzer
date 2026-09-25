import { LEVEL_COLORS } from '../lib/fuzzyEngine';
import type { Level } from './ui';

interface GaugeProps {
  score: number;
  level: Level;
  label: string;
  accent: string;
  size?: number;
}

export default function Gauge({
  score,
  level,
  label,
  accent,
  size = 220,
}: GaugeProps) {
  const r = 84;
  const cx = 105;
  const cy = 108;
  const startAngle = 135;
  const sweep = 270;
  const totalLen = 2 * Math.PI * r * (sweep / 360);
  const fraction = Math.max(0, Math.min(1, score / 100));

  const polar = (angle: number) => {
    const a = (angle * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };
  const [sx, sy] = polar(startAngle);
  const [ex, ey] = polar(startAngle + sweep);
  const largeArc = sweep > 180 ? 1 : 0;
  const arcPath = `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  const color = LEVEL_COLORS[level];

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 210 210" width={size} height={size}>
          <path
            d={arcPath}
            fill="none"
            stroke="#e8edf5"
            strokeWidth={14}
            strokeLinecap="round"
          />
          <path
            d={arcPath}
            fill="none"
            stroke={color}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={totalLen}
            strokeDashoffset={totalLen * (1 - fraction)}
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1)' }}
          />
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            fontSize={38}
            fontWeight={800}
            fill="#0f172a"
            fontFamily="'JetBrains Mono', monospace"
          >
            {score.toFixed(1)}
          </text>
          <text
            x={cx}
            y={cy + 22}
            textAnchor="middle"
            fontSize={12}
            fill="#94a3b8"
            fontWeight={600}
          >
            / 100
          </text>
        </svg>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: `${color}1a`, color }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
          {label}: {level}
        </span>
      </div>
      <style>{`.__gaccent { color: ${accent} }`}</style>
    </div>
  );
}
