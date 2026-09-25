import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Brain, Menu, X, Download } from 'lucide-react';
import { Container } from './ui';

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goSection = (id: string) => {
    setOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToId(id), 180);
    } else {
      scrollToId(id);
    }
  };

  const links: { label: string; action: () => void }[] = [
    { label: 'Analyzer', action: () => goSection('analyzer') },
    { label: 'How it works', action: () => goSection('methodology-preview') },
    { label: 'Code & Files', action: () => { setOpen(false); navigate('/code'); } },
    { label: 'Methodology', action: () => { setOpen(false); navigate('/methodology'); } },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-slate-200/70 bg-white/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <Brain size={18} />
          </span>
          <span className="hidden text-[15px] font-extrabold tracking-tight text-slate-900 sm:block">
            Smart Academic Stress Analyzer
          </span>
          <span className="text-[15px] font-extrabold tracking-tight text-slate-900 sm:hidden">
            SASA
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <button
              key={l.label}
              onClick={l.action}
              className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {l.label}
            </button>
          ))}
          <a
            href="/project/Smart_Academic_Stress_Analyzer.ipynb"
            download
            className="ml-1 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <Download size={15} />
            Colab
          </a>
        </nav>

        <button
          className="rounded-lg p-2 text-slate-700 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <Container className="flex flex-col py-3">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={l.action}
                className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {l.label}
              </button>
            ))}
            <a
              href="/project/Smart_Academic_Stress_Analyzer.ipynb"
              download
              className="mt-1 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-3 text-sm font-semibold text-white"
            >
              <Download size={15} />
              Download Colab Notebook
            </a>
          </Container>
        </div>
      )}
    </header>
  );
}
