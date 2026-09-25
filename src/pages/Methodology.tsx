import { Container, Reveal, SectionHeading } from '../components/ui';
import { RULE_TEXT } from '../lib/fuzzyEngine';
import { FACTOR_THRESHOLDS } from '../lib/recommendations';
import { Cpu, FunctionSquare, Sigma, Layers, Crosshair, GitBranch, BookOpen } from 'lucide-react';

const MF_TABLE = [
  { input: 'Sleep Hours', range: '0–12', low: '[0, 0, 5]', medium: '[4, 7, 9]', high: '[8, 12, 12]' },
  { input: 'Study Hours', range: '0–15', low: '[0, 0, 4]', medium: '[3, 6, 9]', high: '[8, 15, 15]' },
  { input: 'Assignment Workload', range: '0–10', low: '[0, 0, 4]', medium: '[3, 5, 7]', high: '[6, 10, 10]' },
  { input: 'Attendance', range: '0–100', low: '[0, 0, 60]', medium: '[50, 75, 90]', high: '[80, 100, 100]' },
];

const OUTPUT_MF = [
  { term: 'Low', trimf: '[0, 0, 40]' },
  { term: 'Medium', trimf: '[30, 55, 70]' },
  { term: 'High', trimf: '[60, 100, 100]' },
];

export default function Methodology() {
  return (
    <div className="pt-24 pb-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={<>Soft Computing Techniques</>}
            title="Methodology — Mamdani Fuzzy Inference"
            subtitle="A complete walkthrough of the Scikit-Fuzzy pipeline the professor can verify step by step."
          />
        </Reveal>

        {/* The pipeline */}
        <Reveal delay={0.1}>
          <div className="mt-10 rounded-3xl border border-slate-200 bg-gradient-to-b from-[#0b1020] to-[#1a1f3a] p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-center justify-center gap-2 text-center text-xs font-semibold sm:text-sm">
              {['Inputs', 'Fuzzification', 'Rules', 'Implication', 'Aggregation', 'Defuzzification', 'Stress / Burnout'].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="rounded-lg bg-white/10 px-3 py-1.5 backdrop-blur">{step}</span>
                  {i < arr.length - 1 && <span className="text-indigo-300">→</span>}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Steps detail */}
        <div className="mt-12 space-y-8">
          <Step
            n={1}
            icon={<BookOpen size={20} />}
            title="Inputs & Antecedents"
          >
            <p>
              Four academic inputs are modelled as <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px] text-indigo-700">ctrl.Antecedent</code> objects.
              Each is described by three triangular membership functions (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px] text-indigo-700">fuzz.trimf</code>): Low, Medium, High.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                    <th className="py-2 pr-4 font-semibold">Input</th>
                    <th className="py-2 pr-4 font-semibold">Range</th>
                    <th className="py-2 pr-4 font-semibold">Low</th>
                    <th className="py-2 pr-4 font-semibold">Medium</th>
                    <th className="py-2 pr-4 font-semibold">High</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-[13px] text-slate-700">
                  {MF_TABLE.map((r) => (
                    <tr key={r.input} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-sans font-semibold text-slate-800">{r.input}</td>
                      <td className="py-2 pr-4 text-slate-500">{r.range}</td>
                      <td className="py-2 pr-4 text-emerald-600">{r.low}</td>
                      <td className="py-2 pr-4 text-amber-600">{r.medium}</td>
                      <td className="py-2 pr-4 text-rose-600">{r.high}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Step>

          <Step
            n={2}
            icon={<FunctionSquare size={20} />}
            title="Outputs & Consequents"
          >
            <p>
              Two outputs, <strong>Stress</strong> and <strong>Burnout</strong>, each range 0–100 and use
              the same three membership functions:
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="mb-2 font-bold text-slate-800">Output membership functions</div>
                <table className="w-full text-left text-sm">
                  <tbody className="font-mono text-[13px]">
                    {OUTPUT_MF.map((r) => (
                      <tr key={r.term} className="border-b border-slate-100">
                        <td className="py-1.5 pr-4 font-sans font-semibold text-slate-700">{r.term}</td>
                        <td className="py-1.5 text-indigo-600">{r.trimf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="mb-2 font-bold text-slate-800">Categories (consistent everywhere)</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Dot color="#10b981" /> <strong>&lt; 40</strong> → Low</li>
                  <li className="flex items-center gap-2"><Dot color="#f59e0b" /> <strong>40 – 69.99…</strong> → Medium</li>
                  <li className="flex items-center gap-2"><Dot color="#ef4444" /> <strong>≥ 70</strong> → High</li>
                </ul>
              </div>
            </div>
          </Step>

          <Step
            n={3}
            icon={<GitBranch size={20} />}
            title="Fuzzy Rules (ctrl.Rule)"
          >
            <p>
              Rules use the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[13px] text-indigo-700">&amp;</code> operator (AND = min). The
              required core rules are below; a small set of sensible coverage rules
              ensures every input region activates at least one rule.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <RuleList title="Stress rules" ids={['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12']} />
              <RuleList title="Burnout rules" ids={['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9']} />
            </div>
          </Step>

          <Step
            n={4}
            icon={<Layers size={20} />}
            title="Implication & Aggregation"
          >
            <p>
              For each fired rule, the consequent's output membership function is
              <strong> clipped at the rule's firing strength</strong> (Mamdani implication = min). All
              clipped output sets for a consequent are then combined with <strong>max</strong> into a
              single aggregated fuzzy set.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MiniCard label="Implication (Mamdani)" value="min(μ_out, firing)" />
              <MiniCard label="Aggregation" value="max over fired rules" />
            </div>
          </Step>

          <Step
            n={5}
            icon={<Sigma size={20} />}
            title="Defuzzification (Centroid)"
          >
            <p>
              The aggregated fuzzy set is converted to a crisp score using the
              <strong> centroid </strong> method — the center of gravity of the area under the
              aggregated membership function:
            </p>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-900 p-5 text-center">
              <code className="font-mono text-lg text-emerald-300">
                score = Σ(x · μ(x)) / Σ μ(x)
              </code>
            </div>
          </Step>

          <Step
            n={6}
            icon={<Crosshair size={20} />}
            title="Categorization & Advice"
          >
            <p>
              The crisp Stress/Burnout scores are classified Low / Medium / High using the
              thresholds above. Contributing factors and recommendations are then generated
              from the raw inputs using simple if/else heuristics (allowed) — they never
              replace the fuzzy prediction.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <MiniCard label="Sleep low" value={`< ${FACTOR_THRESHOLDS.SLEEP_LOW}h`} />
              <MiniCard label="Study high" value={`> ${FACTOR_THRESHOLDS.STUDY_HIGH}h`} />
              <MiniCard label="Workload high" value={`> ${FACTOR_THRESHOLDS.WORKLOAD_HIGH}/10`} />
              <MiniCard label="Attendance low" value={`< ${FACTOR_THRESHOLDS.ATTENDANCE_LOW}%`} />
            </div>
          </Step>
        </div>

        {/* Code identity */}
        <Reveal delay={0.1}>
          <div className="mt-14 rounded-3xl border border-indigo-200 bg-indigo-50/60 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-indigo-700">
              <Cpu size={20} />
              <h3 className="text-lg font-bold">One fuzzy system, three surfaces</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              <code className="rounded bg-white px-1.5 py-0.5 text-[13px] text-indigo-700">fuzzy_system.py</code> is the
              single source of truth. The Streamlit app (<code className="rounded bg-white px-1.5 py-0.5 text-[13px] text-indigo-700">app.py</code>) and
              the Google Colab notebook both import / re-implement the exact same membership functions
              and rules. The interactive demo on this site mirrors that math in TypeScript — there is
              only one fuzzy system.
            </p>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}

function Step({ n, icon, title, children }: { n: number; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            {icon}
          </span>
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">Step {n}</div>
            <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
          </div>
        </div>
        <div className="mt-4 text-sm leading-relaxed text-slate-600">{children}</div>
      </div>
    </Reveal>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 font-mono text-sm font-bold text-slate-800">{value}</div>
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />;
}

function RuleList({ title, ids }: { title: string; ids: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-2 font-bold text-slate-800">{title}</div>
      <ul className="space-y-1.5">
        {ids.map((id, i) => {
          const isCoverage = !['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6'].includes(id);
          return (
            <li key={id} className="font-mono text-[12px] leading-relaxed text-slate-600">
              <span className="mr-1.5 text-slate-400">{i + 1}.</span>
              {RULE_TEXT[id]}
              {isCoverage && (
                <span className="ml-1.5 rounded bg-slate-200 px-1 py-0.5 text-[9px] font-bold uppercase text-slate-500">coverage</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
