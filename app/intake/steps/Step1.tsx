"use client";

import type { CompanyContext, Stage, TeamSize, Revenue, BoardComplexity, FounderType, Industry, WorkModel, HiringTimeline } from "@/lib/types";

interface Step1Props {
  data: CompanyContext;
  onChange: (data: CompanyContext) => void;
}

const STAGES: { value: Stage; label: string }[] = [
  { value: "pre-seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "series-a", label: "Series A" },
  { value: "series-b", label: "Series B" },
  { value: "series-c-plus", label: "Series C+" },
];

const TEAM_SIZES: { value: TeamSize; label: string }[] = [
  { value: "1-5", label: "1–5" },
  { value: "6-15", label: "6–15" },
  { value: "16-30", label: "16–30" },
  { value: "31-50", label: "31–50" },
  { value: "50+", label: "50+" },
];

const REVENUES: { value: Revenue; label: string }[] = [
  { value: "pre-revenue", label: "Pre-revenue" },
  { value: "0-500k", label: "$0–500K" },
  { value: "500k-2m", label: "$500K–2M" },
  { value: "2m-10m", label: "$2M–10M" },
  { value: "10m+", label: "$10M+" },
];

const BOARD_COMPLEXITY: { value: BoardComplexity; label: string }[] = [
  { value: "none", label: "None" },
  { value: "informal", label: "Informal" },
  { value: "formal", label: "Formal" },
  { value: "complex", label: "Complex" },
];

const FOUNDER_TYPES: { value: FounderType; label: string }[] = [
  { value: "solo", label: "Solo founder" },
  { value: "co-founders", label: "Co-founders" },
  { value: "first-time", label: "First-time founder" },
  { value: "repeat", label: "Repeat founder" },
];

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: "fintech", label: "Fintech" },
  { value: "healthtech", label: "Healthtech" },
  { value: "saas", label: "SaaS" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "marketplace", label: "Marketplace" },
  { value: "ai-ml", label: "AI / ML" },
  { value: "climate", label: "Climate / Clean tech" },
  { value: "edtech", label: "Edtech" },
  { value: "proptech", label: "Proptech" },
  { value: "other", label: "Other" },
];

const WORK_MODELS: { value: WorkModel; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

const HIRING_TIMELINES: { value: HiringTimeline; label: string }[] = [
  { value: "urgent", label: "Urgent (ASAP)" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-6-months", label: "3–6 months" },
  { value: "6-plus-months", label: "6+ months" },
];

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--foreground)]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground-muted)]/20 transition-colors"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Step1({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">01</p>
      <h2 className="text-lg font-semibold text-[var(--foreground)]">Company context</h2>
      <p className="text-sm text-[var(--muted)]">
        Help us understand your company stage and structure.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        <Select
          label="Stage"
          value={data.stage}
          options={STAGES}
          onChange={(v) => onChange({ ...data, stage: v as Stage })}
        />
        <Select
          label="Team size"
          value={data.teamSize}
          options={TEAM_SIZES}
          onChange={(v) => onChange({ ...data, teamSize: v as TeamSize })}
        />
        <Select
          label="Revenue"
          value={data.revenue}
          options={REVENUES}
          onChange={(v) => onChange({ ...data, revenue: v as Revenue })}
        />
        <Select
          label="Board complexity"
          value={data.boardComplexity}
          options={BOARD_COMPLEXITY}
          onChange={(v) => onChange({ ...data, boardComplexity: v as BoardComplexity })}
        />
        <Select
          label="Founder type"
          value={data.founderType}
          options={FOUNDER_TYPES}
          onChange={(v) => onChange({ ...data, founderType: v as FounderType })}
        />
        <Select
          label="Industry"
          value={data.industry}
          options={INDUSTRIES}
          onChange={(v) => onChange({ ...data, industry: v as Industry })}
        />
        <Select
          label="Work model"
          value={data.workModel}
          options={WORK_MODELS}
          onChange={(v) => onChange({ ...data, workModel: v as WorkModel })}
        />
        <Select
          label="Hiring timeline"
          value={data.hiringTimeline}
          options={HIRING_TIMELINES}
          onChange={(v) => onChange({ ...data, hiringTimeline: v as HiringTimeline })}
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">Location (optional)</label>
        <input
          type="text"
          value={data.location}
          onChange={(e) => onChange({ ...data, location: e.target.value })}
          placeholder="e.g. Dubai, Riyadh, Remote-first"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground-muted)]/20 transition-colors"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--foreground)]">Key strategic initiatives (optional)</label>
        <textarea
          value={data.strategicInitiatives}
          onChange={(e) => onChange({ ...data, strategicInitiatives: e.target.value })}
          placeholder="e.g. Series B raise, international expansion, product launch, major hiring push"
          rows={3}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground-muted)]/20 transition-colors resize-y"
        />
        <p className="text-xs text-[var(--muted)]">What big things is the company working on? This helps tailor the role scope.</p>
      </div>
    </div>
  );
}
