"use client";

const STEPS = [
  "Analyzing stage…",
  "Assessing maturity…",
  "Determining archetype…",
  "Generating outputs…",
];

interface AnalysisProgressProps {
  currentStep: number;
}

export function AnalysisProgress({ currentStep }: AnalysisProgressProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-8 h-12 w-12 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--foreground)]" />
      <p className="text-lg font-medium text-[var(--foreground)]">
        {STEPS[Math.min(currentStep, STEPS.length - 1)]}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        This usually takes 30–60 seconds
      </p>
      <div className="mt-8 flex gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-12 rounded-full transition-colors ${
              i <= currentStep ? "bg-[var(--foreground)]" : "bg-[var(--border)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
