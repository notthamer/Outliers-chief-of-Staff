"use client";

interface Step4Props {
  menaContext: boolean;
  onChange: (menaContext: boolean) => void;
}

export function Step4({ menaContext, onChange }: Step4Props) {
  return (
    <div className="space-y-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">04</p>
      <h2 className="text-lg font-semibold text-[var(--foreground)]">MENA context</h2>
      <p className="text-sm text-[var(--muted)]">
        Optimize recommendations for Middle East and North Africa—titles, talent pools, and organizational norms.
      </p>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:bg-[var(--card-hover)]">
        <input
          type="checkbox"
          checked={menaContext}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)] text-[var(--foreground)] focus:ring-[var(--foreground-muted)]"
        />
        <span className="text-sm font-medium text-[var(--foreground)]">
          Optimize for MENA context
        </span>
      </label>
    </div>
  );
}
