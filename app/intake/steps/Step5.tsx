"use client";

import type { FounderIntake } from "@/lib/types";

const PAIN_LABELS: Record<string, string> = {
  "investor-chaos": "Investor/board chaos",
  "cross-functional-drift": "Cross-functional drift",
  "strategic-clarity": "Strategic clarity",
  "execution-bottleneck": "Execution bottleneck",
  "team-scaling": "Team scaling",
  "board-reporting": "Board reporting",
  "fundraising": "Fundraising",
  "operational-maturity": "Operational maturity",
  "founder-time": "Founder time allocation",
  other: "Other",
};

interface Step5Props {
  intake: FounderIntake;
}

export function Step5({ intake }: Step5Props) {
  const { companyContext, operationalPain, menaContext } = intake;

  return (
    <div className="space-y-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">05</p>
      <h2 className="text-lg font-semibold text-[var(--foreground)]">Review & submit</h2>
      <p className="text-sm text-[var(--muted)]">
        Confirm your inputs, then click Generate to run the AI analysis.
      </p>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-[var(--muted)]">Company context</h3>
          <p className="mt-1 text-sm text-[var(--foreground)]">
            {companyContext.stage || "—"}, {companyContext.teamSize || "—"} team,{" "}
            {companyContext.revenue || "—"} revenue, {companyContext.boardComplexity || "—"} board,{" "}
            {companyContext.founderType || "—"}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-[var(--muted)]">Operational pain</h3>
          <p className="mt-1 text-sm text-[var(--foreground)]">
            {operationalPain.length > 0
              ? operationalPain.map((p) => PAIN_LABELS[p] ?? p).join(", ")
              : "None selected"}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-[var(--muted)]">MENA context</h3>
          <p className="mt-1 text-sm text-[var(--foreground)]">
            {menaContext ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </div>
  );
}
