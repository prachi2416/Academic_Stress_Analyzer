import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";

interface Props {
  code: string;
  filename: string;
  language?: string;
  downloadHref?: string;
}

export default function CodeBlock({ code, filename, language = "python", downloadHref }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-[#0f172a] shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1e293b] border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-400/70" />
          <span className="w-3 h-3 rounded-full bg-amber-400/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-400/70" />
          <span className="ml-3 text-xs font-mono text-slate-300">{filename}</span>
          <span className="ml-2 text-[10px] uppercase tracking-wider text-slate-500">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          {downloadHref && (
            <a
              href={downloadHref}
              download
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          )}
          <button
            onClick={copy}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto text-[12.5px] leading-relaxed p-4 text-slate-200 font-mono max-h-[520px]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
