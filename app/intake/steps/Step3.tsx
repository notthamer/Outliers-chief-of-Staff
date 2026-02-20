"use client";

import { FreeTextPrompt } from "@/components/FreeTextPrompt";
import type { FreeTextAnswers } from "@/lib/types";

interface Step3Props {
  data: FreeTextAnswers;
  onChange: (data: FreeTextAnswers) => void;
}

const PROMPTS: { key: keyof FreeTextAnswers; label: string; placeholder: string }[] = [
  {
    key: "typicalWeek",
    label: "Describe your typical week.",
    placeholder: "What does a normal week look like? Meetings, decisions, fires to put out…",
  },
  {
    key: "chaoticNow",
    label: "What feels chaotic right now?",
    placeholder: "What’s the biggest source of stress or disorder?",
  },
  {
    key: "immediateFix",
    label: "If you hired someone tomorrow, what would they immediately fix?",
    placeholder: "Be specific. What’s the first thing they’d own or unblock?",
  },
  {
    key: "dreadedConversations",
    label: "What conversations do you dread?",
    placeholder: "Board updates, performance reviews, investor asks, team conflicts…",
  },
  {
    key: "bottleneck",
    label: "Where do you feel you are the bottleneck?",
    placeholder: "What decisions or processes stall when they hit your desk?",
  },
];

export function Step3({ data, onChange }: Step3Props) {
  const update = (key: keyof FreeTextAnswers, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">03</p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Free-text prompts</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          More detail = better recommendations. Answer as fully as you can.
        </p>
      </div>
      <div className="space-y-8">
        {PROMPTS.map((p) => (
          <FreeTextPrompt
            key={p.key}
            label={p.label}
            value={data[p.key]}
            onChange={(v) => update(p.key, v)}
            placeholder={p.placeholder}
          />
        ))}
      </div>
    </div>
  );
}
