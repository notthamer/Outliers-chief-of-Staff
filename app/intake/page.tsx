"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stepper } from "@/components/Stepper";
import { GuardrailModal } from "@/components/GuardrailModal";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { Step1 } from "./steps/Step1";
import { Step2 } from "./steps/Step2";
import { Step3 } from "./steps/Step3";
import { Step4 } from "./steps/Step4";
import { Step5 } from "./steps/Step5";
import type { FounderIntake, SessionResult } from "@/lib/types";

const INITIAL_INTAKE: FounderIntake = {
  companyContext: {
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
    stage: "series-a",
    teamSize: "16-30",
    revenue: "2m-10m",
    boardComplexity: "formal",
    founderType: "co-founders",
    industry: "saas",
    workModel: "hybrid",
    location: "Dubai",
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
  const [analysisStep, setAnalysisStep] = useState(0);
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

  const handleGenerate = async (overrideGuardrail = false) => {
    if (guardrail.open && !overrideGuardrail) return;
    if (guardrail.open) setGuardrail({ open: false, reason: "" });

    setIsAnalyzing(true);
    setAnalysisStep(0);

    try {
      const stepInterval = setInterval(() => {
        setAnalysisStep((s) => Math.min(s + 1, 3));
      }, 8000);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake, overrideGuardrail }),
      });

      clearInterval(stepInterval);
      setAnalysisStep(3);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Analysis failed");
      }

      const { id, guardrailTriggered, reason, result } = await res.json();
      if (guardrailTriggered && !overrideGuardrail) {
        setGuardrail({
          open: true,
          reason:
            reason ||
            "The AI recommends caution. Your company may not be ready for a Chief of Staff. Consider an Executive Assistant or building foundational operations first.",
        });
        setIsAnalyzing(false);
        return;
      }

      if (result && typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`cos-result-${id}`, JSON.stringify(result));
          (window as unknown as { __COS_PENDING_RESULT__?: unknown }).__COS_PENDING_RESULT__ = result;
        } catch {
          // storage may be full
        }
      }
      // Small delay so storage and state are flushed before navigation
      await new Promise((r) => setTimeout(r, 100));
      router.push(`/results/${id}`);
    } catch (e) {
      setIsAnalyzing(false);
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      if (typeof window !== "undefined" && window.confirm(`${msg}\n\nShow demo results instead?`)) {
        const demoId = "demo-" + Date.now();
        const demoResult: SessionResult = {
          id: demoId,
          intake: SAMPLE_INTAKE,
          analysis: {
            recommended_title: "Chief of Staff",
            archetype: "Strategic Partner",
            confidence_score: "8",
            role_exists_reason: "Founder is bottleneck on strategic and operational work. Board/investor chaos and cross-functional drift indicate need for a strategic partner.",
            risk_warnings: ["Ensure clear scope to avoid founder dependency"],
            primary_focus: ["Investor/board reporting", "OKR cadence", "Leadership alignment"],
            secondary_focus: ["Decision log", "Operational cadence"],
            founder_dependency_risk: "Medium – mitigate with clear ownership boundaries",
            organizational_maturity_score: "6",
          },
          outputs: {
            roleBrief: "## Role Brief\n\n**Why this role exists:** The founder is the bottleneck for strategic decisions, investor relations, and cross-functional alignment. A Chief of Staff can own the operational layer and free the founder for product and strategy.\n\n**Why now:** Series A stage with formal board, 16–30 team, and clear pain around investor chaos and execution drift.\n\n**What success looks like:** Board packs ready on time. Weekly leadership sync in place. OKR cadence running. Founder reclaims 20%+ of time.\n\n**What it is NOT:** Not an EA. Not a COO. Strategic partner with execution ownership.",
            jobDescription: "## Chief of Staff – Job Description\n\n**Company:** Series A startup, 16–30 team.\n\n**Role mandate:** Own investor reporting, board prep, leadership cadence, and cross-functional alignment. Report to founder.\n\n**Key responsibilities:**\n- Build and maintain investor reporting system\n- Own board pack process and materials\n- Run weekly leadership sync\n- Implement OKR cadence\n- Create decision log\n\n**Success metrics:** Board satisfaction, meeting cadence adherence, founder time reclaimed.",
            ninetyDayPlan: "## 90-Day Plan\n\n**Month 1:** Build investor reporting system. Implement board pack template. Establish weekly leadership sync.\n\n**Month 2:** Launch OKR cadence. Create decision log. Refine board process.\n\n**Month 3:** Hand off routine investor comms. Optimize cadences. Measure founder time reclaimed.",
            interviewFramework: "## Interview Framework\n\n**Behavioral:** Tell me about a time you built a process from scratch. How do you handle conflicting priorities? Describe a difficult stakeholder conversation.\n\n**Execution:** Draft a board pack outline. Design a weekly leadership meeting agenda.\n\n**Strategic:** How would you approach OKR implementation at a 20-person company?",
            candidateFit: "## Ideal Candidate Profile\n\n**Background:** Consulting or operator with 5–8 years experience. Ex-scaleup or startup generalist. Strong on process and stakeholder management.\n\n**Skills:** Board reporting, OKRs, meeting design, executive communication.\n\n**Red flags:** Pure EA background. No strategic work. Needs heavy direction.",
          },
          guardrailTriggered: false,
          createdAt: new Date().toISOString(),
        };
        try {
          sessionStorage.setItem(`cos-result-${demoId}`, JSON.stringify(demoResult));
          (window as unknown as { __COS_PENDING_RESULT__?: unknown }).__COS_PENDING_RESULT__ = demoResult;
        } catch {}
        router.push(`/results/${demoId}`);
      } else {
        alert(msg);
      }
    }
  };

  if (isAnalyzing) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <AnalysisProgress currentStep={analysisStep} />
      </div>
    );
  }

  const fillSample = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIntake(JSON.parse(JSON.stringify(SAMPLE_INTAKE)));
    setStep(1);
    setFormKey((k) => k + 1);
  };

  const skipToDemoResults = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const demoId = "demo-" + Date.now();
    const demoResult: SessionResult = {
      id: demoId,
      intake: SAMPLE_INTAKE,
      analysis: {
        recommended_title: "Chief of Staff",
        archetype: "Strategic Partner",
        confidence_score: "8",
        role_exists_reason: "Founder is bottleneck on strategic and operational work.",
        risk_warnings: [],
        primary_focus: ["Investor/board reporting", "OKR cadence"],
        secondary_focus: ["Decision log", "Operational cadence"],
        founder_dependency_risk: "Medium",
        organizational_maturity_score: "6",
      },
      outputs: {
        roleBrief: "## Role Brief\n\n**Why this role exists:** The founder is the bottleneck for strategic decisions and cross-functional alignment.\n\n**Why now:** Series A stage with clear pain around investor chaos and execution drift.\n\n**What success looks like:** Board packs ready. Weekly leadership sync. OKR cadence running.\n\n**What it is NOT:** Not an EA. Strategic partner with execution ownership.",
        jobDescription: "## Chief of Staff – Job Description\n\n**Role mandate:** Own investor reporting, board prep, leadership cadence. Report to founder.\n\n**Key responsibilities:** Build investor reporting system, run weekly leadership sync, implement OKR cadence.\n\n**Success metrics:** Board satisfaction, meeting cadence adherence.",
        ninetyDayPlan: "## 90-Day Plan\n\n**Month 1:** Build investor reporting system. Establish weekly leadership sync.\n\n**Month 2:** Launch OKR cadence. Create decision log.\n\n**Month 3:** Optimize cadences. Measure founder time reclaimed.",
        interviewFramework: "## Interview Framework\n\n**Behavioral:** Tell me about a time you built a process from scratch. How do you handle conflicting priorities?\n\n**Execution:** Draft a board pack outline. Design a weekly leadership meeting agenda.",
        candidateFit: "## Ideal Candidate Profile\n\n**Background:** Consulting or operator, 5–8 years. Ex-scaleup or startup generalist.\n\n**Skills:** Board reporting, OKRs, meeting design, executive communication.",
      },
      guardrailTriggered: false,
      createdAt: new Date().toISOString(),
    };
    try {
      sessionStorage.setItem(`cos-result-${demoId}`, JSON.stringify(demoResult));
      (window as unknown as { __COS_PENDING_RESULT__?: unknown }).__COS_PENDING_RESULT__ = demoResult;
    } catch {}
    router.push(`/results/${demoId}`);
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
        <div className="mb-6 space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-[var(--foreground-muted)]">Testing</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fillSample}
                className="rounded-lg bg-[var(--foreground)] px-3 py-1.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--foreground-muted)]"
              >
                Fill: Chief of Staff
              </button>
              <button
                type="button"
                onClick={skipToDemoResults}
                className="rounded-lg border border-[var(--foreground-muted)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card-hover)]"
              >
                Skip to demo results
              </button>
            </div>
          </div>
          <p className="text-xs text-[var(--foreground-muted)]">
            &quot;Fill&quot; populates the form. &quot;Skip to demo&quot; bypasses the API and shows sample results immediately.
          </p>
        </div>
        <Stepper currentStep={step} />
        <div key={formKey} className="mt-14">
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
