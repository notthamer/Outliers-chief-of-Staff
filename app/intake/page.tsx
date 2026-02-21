"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stepper } from "@/components/Stepper";
import { GuardrailModal } from "@/components/GuardrailModal";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { OutputCard } from "@/components/OutputCard";
import { Step1 } from "./steps/Step1";
import { Step2 } from "./steps/Step2";
import { Step3 } from "./steps/Step3";
import { Step4 } from "./steps/Step4";
import { Step5 } from "./steps/Step5";
import type { FounderIntake, SessionResult } from "@/lib/types";

const INITIAL_INTAKE: FounderIntake = {
  companyContext: {
    companyName: "",
    stage: "",
    teamSize: "",
    revenue: "",
    boardComplexity: "",
    founderType: "",
    industry: "",
    workModel: "",
    location: "",
    hiringTimeline: "",
    strategicInitiatives: "",
  },
  operationalPain: [],
  freeText: {
    startupDescription: "",
    problemSolving: "",
    companyVision: "",
    typicalWeek: "",
    chaoticNow: "",
    immediateFix: "",
    dreadedConversations: "",
    bottleneck: "",
  },
  menaContext: false,
};

const SAMPLE_INTAKE: FounderIntake = {
  companyContext: {
    companyName: "RevOps AI",
    stage: "series-a",
    teamSize: "16-30",
    revenue: "2m-10m",
    boardComplexity: "formal",
    founderType: "co-founders",
    industry: "saas",
    workModel: "hybrid",
    location: "Riyadh",
    hiringTimeline: "1-3-months",
    strategicInitiatives: "Series B raise, MENA expansion, product-market fit scaling",
  },
  operationalPain: [
    "investor-chaos",
    "cross-functional-drift",
    "strategic-clarity",
    "execution-bottleneck",
    "board-reporting",
  ],
  freeText: {
    startupDescription:
      "B2B SaaS platform for revenue operations. We help Series A–B companies automate their sales ops, pipeline management, and forecasting. 50+ customers, mostly in fintech and healthtech.",
    problemSolving:
      "Revenue teams waste 20+ hours a week on manual pipeline updates and broken forecasts. We automate the data flow so they can focus on selling.",
    companyVision:
      "Become the default revenue operations layer for mid-market B2B. Expand to 500+ customers and establish category leadership in MENA.",
    typicalWeek:
      "Monday is usually back-to-back meetings—investor updates, team 1:1s, and board prep. Tuesday I focus on product and strategy. Wednesday is often fundraising or partnership calls. Thursday I try to block for deep work but it rarely happens. Friday is catch-up and firefighting. I'm in the weeds on everything—hiring, ops, product decisions, investor relations. No real structure.",
    chaoticNow:
      "Investor reporting is ad hoc. Every board meeting we scramble to pull together metrics. Cross-functional teams don't align—product, eng, and go-to-market are on different pages. I'm the bottleneck for too many decisions. Fundraising is distracting from execution. No clear OKR cadence. Strategic initiatives slip because we're reactive.",
    immediateFix:
      "Build a proper investor reporting system and board pack process. Implement a weekly leadership sync so we're aligned. Create a decision log so we're not rehashing the same topics. Someone to own the operational cadence—OKRs, all-hands, board prep. Take investor and board comms off my plate so I can focus on product and strategy.",
    dreadedConversations:
      "Board updates—I never feel prepared and we always get surprised by questions. Performance conversations with underperformers. Saying no to investors who want more of my time. Delivering bad news to the team about runway or pivots. Mediating conflicts between co-founders or senior hires.",
    bottleneck:
      "Every strategic decision flows through me. Hiring approvals, partnership terms, product direction, pricing. I'm the only one who can synthesize across functions. Investor relations and board management take 20% of my time. No one else owns the 'glue' work between teams. I can't delegate because there's no one trusted to run the operational layer.",
  },
  menaContext: true,
};

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [intake, setIntake] = useState<FounderIntake>(INITIAL_INTAKE);
  const [formKey, setFormKey] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [streamingLabel, setStreamingLabel] = useState<string | undefined>();
  const [streamingOutputs, setStreamingOutputs] = useState<Record<string, string>>({});
  const [guardrail, setGuardrail] = useState<{ open: boolean; reason: string }>({
    open: false,
    reason: "",
  });

  const canProceed = () => {
    if (step === 1) {
      const c = intake.companyContext;
      return c.stage && c.teamSize && c.revenue && c.boardComplexity && c.founderType;
    }
    return true;
  };

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else handleGenerate();
  };

  const OUTPUT_LABELS: Record<string, string> = {
    roleBrief: "Role Brief",
    jobDescription: "Job Description",
    ninetyDayPlan: "90-Day Plan",
    interviewFramework: "Interview Framework",
    candidateFit: "Candidate Fit",
    jobPostingReframe: "Job Posting Reframe",
  };

  const handleGenerate = async (overrideGuardrail = false) => {
    if (guardrail.open && !overrideGuardrail) return;
    if (guardrail.open) setGuardrail({ open: false, reason: "" });

    setIsAnalyzing(true);
    setAnalysisStep(0);
    setStreamingLabel(undefined);
    setStreamingOutputs({});

    try {
      const res = await fetch("/api/analyze/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake, overrideGuardrail }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Analysis failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let lastResult: SessionResult | null = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const msg = JSON.parse(line) as {
                type: string;
                reason?: string;
                key?: string;
                chunk?: string;
                id?: string;
                result?: SessionResult;
              };
              if (msg.type === "output_chunk" && msg.key && msg.chunk) {
                setStreamingOutputs((prev) => ({
                  ...prev,
                  [msg.key!]: (prev[msg.key!] ?? "") + msg.chunk,
                }));
              }
              if (msg.type === "guardrail") {
                setGuardrail({
                  open: true,
                  reason:
                    msg.reason ||
                    "The AI recommends caution. Your company may not be ready for a Chief of Staff.",
                });
                setIsAnalyzing(false);
                return;
              }
              if (msg.type === "analysis") {
                setStreamingLabel("Role Brief");
              }
              if (msg.type === "output" && msg.key) {
                setStreamingLabel(OUTPUT_LABELS[msg.key] ?? msg.key);
              }
              if (msg.type === "done" && msg.id && msg.result) {
                lastResult = msg.result;
              }
            } catch {
              // skip malformed lines
            }
          }
        }
      }

      if (lastResult && typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`cos-result-${lastResult.id}`, JSON.stringify(lastResult));
          (window as unknown as { __COS_PENDING_RESULT__?: unknown }).__COS_PENDING_RESULT__ = lastResult;
        } catch {
          // storage may be full
        }
        await new Promise((r) => setTimeout(r, 100));
        router.push(`/results/${lastResult.id}`);
      } else {
        throw new Error("No result received");
      }
    } catch (e) {
      setIsAnalyzing(false);
      setStreamingLabel(undefined);
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      alert(msg);
    }
  };

  const STREAMING_SECTIONS = [
    { id: "role-brief", title: "Role Brief", key: "roleBrief" },
    { id: "job-description", title: "Job Description", key: "jobDescription" },
    { id: "ninety-day-plan", title: "90-Day Plan", key: "ninetyDayPlan" },
    { id: "interview-framework", title: "Interview Framework", key: "interviewFramework" },
    { id: "candidate-fit", title: "Candidate Fit", key: "candidateFit" },
    { id: "job-posting-reframe", title: "Job Posting Reframe", key: "jobPostingReframe" },
  ];

  if (isAnalyzing) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
        >
          ← Outliers
        </Link>
        <AnalysisProgress currentStep={analysisStep} streamingLabel={streamingLabel} />
        <div className="mt-12 space-y-8">
          {STREAMING_SECTIONS.map((section) => {
            const content = streamingOutputs[section.key] ?? "";
            if (!content && streamingLabel !== OUTPUT_LABELS[section.key]) return null;
            return (
              <OutputCard
                key={section.id}
                id={section.id}
                title={section.title}
                content={content}
                streaming={streamingLabel === OUTPUT_LABELS[section.key]}
              />
            );
          })}
        </div>
      </div>
    );
  }

  const fillSample = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sample = JSON.parse(JSON.stringify(SAMPLE_INTAKE)) as FounderIntake;
    setIntake(sample);
    setStep(1);
    setFormKey((k) => k + 1);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <>
      <div className="mx-auto max-w-[720px] px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
        >
          ← Outliers
        </Link>
        <div
          id="testing-section"
          className="mb-6 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-[var(--foreground)]">Testing</span>
            <button
              type="button"
              onClick={fillSample}
              className="cursor-pointer rounded-lg bg-[var(--foreground)] px-3 py-1.5 text-sm font-medium text-[var(--background)] transition-colors hover:bg-[var(--foreground-muted)]"
            >
              Fill: Chief of Staff
            </button>
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            &quot;Fill&quot; populates the form with sample data.
          </p>
        </div>
        <Stepper currentStep={step} />
        <div ref={formRef} key={formKey} className="mt-14">
          {step === 1 && (
            <Step1
              data={intake.companyContext}
              onChange={(c) => setIntake({ ...intake, companyContext: c })}
            />
          )}
          {step === 2 && (
            <Step2
              selected={intake.operationalPain}
              onChange={(p) => setIntake({ ...intake, operationalPain: p })}
            />
          )}
          {step === 3 && (
            <Step3
              data={intake.freeText}
              onChange={(f) => setIntake({ ...intake, freeText: f })}
            />
          )}
          {step === 4 && (
            <Step4
              menaContext={intake.menaContext}
              onChange={(m) => setIntake({ ...intake, menaContext: m })}
            />
          )}
          {step === 5 && <Step5 intake={intake} />}
        </div>
        <div className="mt-14 flex justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="rounded-lg bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--background)] transition-colors hover:bg-[var(--foreground-muted)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 5 ? "Generate" : "Next"}
          </button>
        </div>
      </div>
      <GuardrailModal
        isOpen={guardrail.open}
        reason={guardrail.reason}
        onOverride={() => handleGenerate(true)}
        onCancel={() => setGuardrail({ open: false, reason: "" })}
      />
    </>
  );
}
