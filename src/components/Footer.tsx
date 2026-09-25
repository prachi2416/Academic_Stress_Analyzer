import { Brain, Github, GraduationCap } from 'lucide-react';
import { Container } from './ui';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container className="py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                <Brain size={18} />
              </span>
              <span className="text-[15px] font-extrabold tracking-tight text-slate-900">
                Smart Academic Stress Analyzer
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              A Scikit-Fuzzy (Mamdani) fuzzy-inference system that predicts
              student Stress &amp; Burnout and recommends personalised actions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Engine
              </h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>scikit-fuzzy</li>
                <li>Mamdani inference</li>
                <li>Centroid defuzz</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-sm text-slate-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <GraduationCap size={15} />
            Inputs → Fuzzy Logic → Stress → Burnout → Factors → Solutions
          </div>
        </div>
      </Container>
    </footer>
  );
}
