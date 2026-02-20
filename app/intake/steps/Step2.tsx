"use client";

import type { OperationalPain } from "@/lib/types";

interface Step2Props {
  selected: OperationalPain[];
  onChange: (selected: OperationalPain[]) => void;
}

const PAIN_OPTIONS: { value: OperationalPain; label: string }[] = [
  { value: "investor-chaos", label: "Investor/board chaos" },
  { value: "cross-functional-drift", label: "Cross-functional drift" },
  { value: "strategic-clarity", label: "Strategic clarity" },
  { value: "execution-bottleneck", label: "Execution bottleneck" },
  { value: "team-scaling", label: "Team scaling" },
  { value: "board-reporting", label: "Board reporting" },
  { value: "fundraising", label: "Fundraising" },
  { value: "operational-maturity", label: "Operational maturity" },
  { value: "founder-time", label: "Founder time allocation" },
  { value: "other", label: "Other" },
];

export function Step2({ selected, onChange }: Step2Props) {
  const toggle = (value: OperationalPain) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">02</p>
      <h2 className="text-lg font-semibold text-[var(--foreground)]">Operational pain</h2>
      <p className="text-sm text-[var(--muted)]">
        Select all areas that feel chaotic or under-resourced. You’ll elaborate in the next step.
      </p>
      <div className="flex flex-wrap gap-3">
        {PAIN_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`
              rounded-full px-4 py-2.5 text-sm font-medium transition-colors
              ${
                selected.includes(opt.value)
                  ? "bg-[var(--primary-muted)] text-[var(--foreground)] border border-[var(--foreground-muted)]"
                  : "bg-[var(--card)] text-[var(--foreground-muted)] border border-[var(--border)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
