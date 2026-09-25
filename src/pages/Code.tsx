import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Reveal, SectionHeading } from '../components/ui';
import CodeBlock from '../components/CodeBlock';
import { PROJECT_FILES, type ProjectFile } from '../lib/projectFiles';
import { FileCode2, Download, ExternalLink, NotebookPen, Github } from 'lucide-react';

export default function Code() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fileParam = searchParams.get('file');

  const active = (fileParam ? PROJECT_FILES.find((f) => f.name === fileParam) : null) ?? PROJECT_FILES[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const selectFile = (f: ProjectFile) => {
    setSearchParams({ file: f.name });
  };

  return (
    <div className="pt-24 pb-20">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={<>Source files</>}
            title="Project Code & Downloads"
            subtitle="Browse every file, copy it, or download it. fuzzy_system.py is the single source of truth for the Scikit-Fuzzy engine."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50/60 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <NotebookPen className="mt-0.5 shrink-0 text-amber-600" size={20} />
                <div>
                  <div className="font-bold text-slate-900">Run in Google Colab</div>
                  <p className="text-sm text-slate-600">
                    Download the notebook and open it in Colab (Run all) to see the
                    full pipeline live.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://colab.research.google.com/drive/1vo_7fIjZCt87ixUbFESxih2sB5LPZBIN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700"
                >
                  🚀 Open in Google Colab
                </a>
                <a
                  href="https://github.com/prachi2416/Academic_Stress_Analyzer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
                >
                  <Github size={16} /> GitHub Repository
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <Reveal>
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="px-2 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                Files
              </div>
              <div className="space-y-1">
                {PROJECT_FILES.map((f) => (
                  <button
                    key={f.name}
                    onClick={() => selectFile(f)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition ${
                      active.name === f.name
                        ? 'bg-indigo-50 ring-1 ring-indigo-200'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{f.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`truncate font-mono text-[13px] font-semibold ${
                          active.name === f.name ? 'text-indigo-700' : 'text-slate-700'
                        }`}
                      >
                        {f.name}
                      </div>
                      <div className="truncate text-[11px] text-slate-400">{f.description.split('.')[0]}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <a
                  href="/project/requirements.txt"
                  download
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700"
                >
                  <Download size={14} /> Download all requirements
                </a>
              </div>
            </div>
          </Reveal>

          {/* Code panel */}
          <Reveal delay={0.1}>
            <div>
              <div className="mb-3 flex items-center gap-2">
                <FileCode2 size={16} className="text-indigo-600" />
                <h3 className="font-mono text-sm font-bold text-slate-800">{active.name}</h3>
                <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                  {active.language}
                </span>
                {active.name === 'Smart_Academic_Stress_Analyzer.ipynb' && (
                  <a
                    href="https://colab.research.google.com/drive/1vo_7fIjZCt87ixUbFESxih2sB5LPZBIN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
                  >
                    🚀 Open in Google Colab
                  </a>
                )}
              </div>
              <p className="mb-3 text-sm leading-relaxed text-slate-500">{active.description}</p>
              <CodeBlock
                key={active.name}
                code={active.content}
                filename={active.name}
                downloadUrl={active.downloadUrl}
                language={active.language === 'markdown' ? 'text' : active.language === 'text' ? 'text' : active.language}
              />
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <ExternalLink size={13} />
                File served from <code className="font-mono text-slate-500">{active.path}</code>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Run instructions */}
        <Reveal delay={0.15}>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-bold text-slate-900">Run the Streamlit app</h3>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-200">
{`pip install -r requirements.txt
streamlit run app.py`}
              </pre>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="font-bold text-slate-900">Run the Colab notebook</h3>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-200">
{`# Open Smart_Academic_Stress_Analyzer.ipynb
# in Google Colab, then Run all cells.
!pip install scikit-fuzzy`}
              </pre>
            </div>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
