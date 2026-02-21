"use client";

import type { FounderIntake } from "@/lib/types";

const INDUSTRY_LABELS: Record<string, string> = {
  fintech: "Fintech",
  healthtech: "Healthtech",
  saas: "SaaS",
  ecommerce: "E-commerce",
  marketplace: "Marketplace",
  "ai-ml": "AI / ML",
  climate: "Climate",
  edtech: "Edtech",
  proptech: "Proptech",
  other: "Other",
};
const TIMELINE_LABELS: Record<string, string> = {
  urgent: "ASAP",
  "1-3-months": "1–3 months",
  "3-6-months": "3–6 months",
  "6-plus-months": "6+ months",
};

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
            {companyContext.companyName && `${companyContext.companyName} · `}
            {companyContext.stage || "—"}, {companyContext.teamSize || "—"} team,{" "}
            {companyContext.revenue || "—"} revenue, {companyContext.boardComplexity || "—"} board,{" "}
            {companyContext.founderType || "—"}
          </p>
          {(companyContext.industry || companyContext.workModel || companyContext.location || companyContext.hiringTimeline) && (
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              {[
                companyContext.industry ? INDUSTRY_LABELS[companyContext.industry] || companyContext.industry : null,
                companyContext.workModel ? companyContext.workModel.charAt(0).toUpperCase() + companyContext.workModel.slice(1) : null,
                companyContext.location || null,
                companyContext.hiringTimeline ? `Hire ${TIMELINE_LABELS[companyContext.hiringTimeline] || companyContext.hiringTimeline}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          {companyContext.strategicInitiatives && (
            <p className="mt-1 text-sm text-[var(--foreground-muted)]">
              Initiatives: {companyContext.strategicInitiatives}
            </p>
          )}
        </div>
        {(intake.freeText.startupDescription || intake.freeText.problemSolving || intake.freeText.companyVision) && (
          <div>
            <h3 className="text-sm font-medium text-[var(--muted)]">Startup & vision</h3>
            {intake.freeText.startupDescription && (
              <p className="mt-1 text-sm text-[var(--foreground)]">
                {intake.freeText.startupDescription.slice(0, 80)}
                {intake.freeText.startupDescription.length > 80 ? "…" : ""}
              </p>
            )}
            {intake.freeText.problemSolving && (
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Problem: {intake.freeText.problemSolving.slice(0, 80)}
                {intake.freeText.problemSolving.length > 80 ? "…" : ""}
              </p>
            )}
            {intake.freeText.companyVision && (
              <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                Vision: {intake.freeText.companyVision.slice(0, 80)}
                {intake.freeText.companyVision.length > 80 ? "…" : ""}
              </p>
            )}
          </div>
        )}
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
