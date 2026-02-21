"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface OutputCardProps {
  title: string;
  content: string;
  id: string;
  onExportPDF?: (id: string) => void;
  onExportDOCX?: (id: string) => void;
  /** When true, hides export buttons and shows streaming indicator */
  streaming?: boolean;
}

export function OutputCard({
  title,
  content,
  id,
  onExportPDF,
  onExportDOCX,
  streaming = false,
}: OutputCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API failed
    }
  };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 transition-colors hover:border-[var(--card-hover)]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">{title}</h2>
        <div className="flex items-center gap-2">
          {streaming && (
            <span className="text-xs text-[var(--foreground-muted)]">Generating…</span>
          )}
          <button
            onClick={handleCopy}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] disabled:opacity-50"
            disabled={streaming && !content}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          {!streaming && onExportPDF && onExportDOCX && (
            <>
              <button
                onClick={() => onExportPDF(id)}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
              >
                PDF
              </button>
              <button
                onClick={() => onExportDOCX(id)}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
              >
                DOCX
              </button>
            </>
          )}
        </div>
      </div>
      <div
        id={id}
        className="output-content font-mono text-sm leading-relaxed prose prose-invert max-w-none text-white prose-headings:text-white prose-headings:font-semibold prose-p:leading-relaxed prose-ul:list-disc prose-li:my-0.5 prose-li:text-white prose-p:mb-3 prose-p:text-white prose-strong:text-white prose-li:marker:text-white/70"
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </section>
  );
}
