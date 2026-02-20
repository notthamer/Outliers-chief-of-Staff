"use client";

interface FreeTextPromptProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FreeTextPrompt({
  label,
  value,
  onChange,
  placeholder = "Share your thoughts in detail. More detail = better recommendations.",
}: FreeTextPromptProps) {
  const charCount = value.length;
  const wordEstimate = Math.round(charCount / 6);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--foreground)]">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground-muted)]/20 resize-y min-h-[140px] transition-colors"
      />
      <div className="flex justify-between items-center">
        <span className="text-sm text-[var(--muted)]">
          {charCount > 0 ? `~${wordEstimate} words` : ""}
        </span>
      </div>
    </div>
  );
}
