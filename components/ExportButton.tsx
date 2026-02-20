"use client";

interface ExportButtonProps {
  onExportAllPDF: () => void;
  onExportAllDOCX: () => void;
  disabled?: boolean;
}

export function ExportButton({
  onExportAllPDF,
  onExportAllDOCX,
  disabled = false,
}: ExportButtonProps) {
  return (
    <div className="flex gap-3">
      <button
        onClick={onExportAllPDF}
        disabled={disabled}
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--card-hover)] disabled:opacity-50"
      >
        Export all as PDF
      </button>
      <button
        onClick={onExportAllDOCX}
        disabled={disabled}
        className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--card-hover)] disabled:opacity-50"
      >
        Export all as DOCX
      </button>
    </div>
  );
}
