import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Copy, Download } from 'lucide-react';

interface Props {
  code: string;
  filename: string;
  downloadUrl: string;
  language?: string;
}

type TokType = 'comment' | 'string' | 'number' | 'keyword' | 'builtin' | 'ident' | 'punct' | 'plain';

interface Tok {
  t: TokType;
  v: string;
}

const KEYWORDS = new Set([
  'def', 'class', 'import', 'from', 'as', 'if', 'elif', 'else', 'for', 'while',
  'return', 'in', 'is', 'not', 'and', 'or', 'with', 'try', 'except', 'finally',
  'raise', 'pass', 'break', 'continue', 'lambda', 'global', 'yield', 'del',
  'assert', 'async', 'await', 'True', 'False', 'None',
]);

const BUILTINS = new Set([
  'float', 'int', 'str', 'len', 'range', 'round', 'dict', 'list', 'set',
  'tuple', 'min', 'max', 'sum', 'enumerate', 'zip', 'map', 'filter', 'print',
  'abs', 'sorted', 'open', 'super', 'self', 'cls',
]);

function tokenizePython(code: string): Tok[] {
  const out: Tok[] = [];
  const n = code.length;
  let i = 0;
  const isIdStart = (c: string) => /[A-Za-z_]/.test(c);
  const isId = (c: string) => /[A-Za-z0-9_]/.test(c);
  const isDigit = (c: string) => /[0-9]/.test(c);

  while (i < n) {
    const c = code[i];
    // triple-quoted string
    if (code.startsWith('"""', i) || code.startsWith("'''", i)) {
      const q = code.slice(i, i + 3);
      const end = code.indexOf(q, i + 3);
      const stop = end === -1 ? n : end + 3;
      out.push({ t: 'string', v: code.slice(i, stop) });
      i = stop;
      continue;
    }
    // single/double quoted string
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && code[j] !== c) {
        if (code[j] === '\\') j++;
        j++;
      }
      j = Math.min(j + 1, n);
      out.push({ t: 'string', v: code.slice(i, j) });
      i = j;
      continue;
    }
    // comment
    if (c === '#') {
      let j = i;
      while (j < n && code[j] !== '\n') j++;
      out.push({ t: 'comment', v: code.slice(i, j) });
      i = j;
      continue;
    }
    // number
    if (isDigit(c)) {
      let j = i;
      while (j < n && /[0-9.]/.test(code[j])) j++;
      out.push({ t: 'number', v: code.slice(i, j) });
      i = j;
      continue;
    }
    // identifier / keyword
    if (isIdStart(c)) {
      let j = i;
      while (j < n && isId(code[j])) j++;
      const word = code.slice(i, j);
      let type: TokType = 'ident';
      if (KEYWORDS.has(word)) type = 'keyword';
      else if (BUILTINS.has(word)) type = 'builtin';
      out.push({ t: type, v: word });
      i = j;
      continue;
    }
    // other (whitespace, punctuation)
    let j = i;
    while (
      j < n &&
      !isIdStart(code[j]) &&
      code[j] !== '"' &&
      code[j] !== "'" &&
      code[j] !== '#' &&
      !isDigit(code[j])
    ) {
      j++;
    }
    if (j === i) j++;
    out.push({ t: 'punct', v: code.slice(i, j) });
  }
  return out;
}

function tokenizeJson(code: string): Tok[] {
  const out: Tok[] = [];
  const n = code.length;
  let i = 0;
  const isIdStart = (c: string) => /[A-Za-z_]/.test(c);
  while (i < n) {
    const c = code[i];
    if (c === '"') {
      // string; detect if it's a key (followed by optional ws then :)
      let j = i + 1;
      while (j < n && code[j] !== '"') {
        if (code[j] === '\\') j++;
        j++;
      }
      j = Math.min(j + 1, n);
      const strVal = code.slice(i, j);
      let k = j;
      while (k < n && /\s/.test(code[k])) k++;
      out.push({ t: code[k] === ':' ? 'builtin' : 'string', v: strVal });
      i = j;
      continue;
    }
    if (/[0-9-]/.test(c)) {
      let j = i;
      while (j < n && /[0-9.eE+-]/.test(code[j])) j++;
      out.push({ t: 'number', v: code.slice(i, j) });
      i = j;
      continue;
    }
    if (isIdStart(c)) {
      let j = i;
      while (j < n && /[A-Za-z]/.test(code[j])) j++;
      out.push({ t: 'keyword', v: code.slice(i, j) });
      i = j;
      continue;
    }
    let j = i;
    while (j < n && code[j] !== '"' && !/[0-9-]/.test(code[j]) && !isIdStart(code[j])) j++;
    if (j === i) j++;
    out.push({ t: 'punct', v: code.slice(i, j) });
  }
  return out;
}

const COLORS: Record<TokType, string> = {
  comment: '#64748b',
  string: '#34d399',
  number: '#fb923c',
  keyword: '#c084fc',
  builtin: '#60a5fa',
  ident: '#e2e8f0',
  punct: '#94a3b8',
  plain: '#e2e8f0',
};

function renderTokens(code: string, language: string): ReactNode {
  let tokens: Tok[];
  try {
    if (language === 'python') tokens = tokenizePython(code);
    else if (language === 'json') tokens = tokenizeJson(code);
    else tokens = [{ t: 'plain', v: code }];
  } catch {
    tokens = [{ t: 'plain', v: code }];
  }
  return tokens.map((tok, idx) => (
    <span key={idx} style={{ color: COLORS[tok.t] }}>
      {tok.v}
    </span>
  ));
}

export default function CodeBlock({ code, filename, downloadUrl, language = 'python' }: Props) {
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [content, setContent] = useState(code);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    // Try to fetch the live file so displayed code == downloadable file.
    fetch(downloadUrl)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error('not found'))))
      .then((txt) => {
        if (active) {
          setContent(txt);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [downloadUrl]);

  const lineCount = content.split('\n').length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1020] shadow-lg">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          <span className="ml-2 font-mono text-xs font-semibold text-slate-300">{filename}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={copy}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700/60 hover:text-white"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/90 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
          >
            <Download size={13} />
            Download
          </a>
        </div>
      </div>
      <div ref={scrollRef} className="max-h-[560px] overflow-auto">
        <div className="flex min-h-full text-[12.5px] leading-[1.65]">
          <div className="select-none border-r border-slate-800 bg-slate-900/40 px-3 py-3 text-right font-mono text-slate-600">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <pre className="flex-1 overflow-x-auto px-4 py-3 font-mono">
            <code className="whitespace-pre">
              {loaded ? renderTokens(content, language) : content}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
