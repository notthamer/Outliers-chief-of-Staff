"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { OutputCard } from "@/components/OutputCard";
import { ExportButton } from "@/components/ExportButton";
import type { SessionResult } from "@/lib/types";

const OUTPUT_SECTIONS = [
  { id: "role-brief", title: "Role Brief", key: "roleBrief" as const },
  { id: "job-description", title: "Job Description", key: "jobDescription" as const },
  { id: "ninety-day-plan", title: "90-Day Plan", key: "ninetyDayPlan" as const },
  { id: "interview-framework", title: "Interview Framework", key: "interviewFramework" as const },
  { id: "candidate-fit", title: "Candidate Fit", key: "candidateFit" as const },
] as const;

const JOB_POSTING_REFrame = { id: "job-posting-reframe", title: "Job Posting Reframe", key: "jobPostingReframe" as const };

export default function ResultsPage() {
  const params = useParams();
  const id = params.id as string;
  const [result, setResult] = useState<SessionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const win = typeof window !== "undefined" ? window : null;
    const pending = win && (win as unknown as { __COS_PENDING_RESULT__?: SessionResult }).__COS_PENDING_RESULT__;
    if (pending && pending.id === id && pending.outputs && pending.analysis) {
      delete (win as unknown as { __COS_PENDING_RESULT__?: SessionResult }).__COS_PENDING_RESULT__;
      setResult(pending);
      return;
    }

    try {
      const stored = sessionStorage.getItem(`cos-result-${id}`);
      if (stored) {
        const parsed = JSON.parse(stored) as SessionResult;
        if (parsed.outputs && parsed.analysis) {
          setResult(parsed);
          return;
        }
      }
    } catch {
      // sessionStorage parse failed
    }

    const fetchResult = () =>
      fetch(`/api/results/${id}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Not found"))))
        .then((data) => {
          setResult(data);
          return data;
        });

    fetchResult().catch(() => {
      // Retry once after 2s (file may still be writing)
      setTimeout(() => {
        fetchResult().catch(() => setError("Results not found. They may have expired."));
      }, 2000);
    });
  }, [id]);

  const handleExportPDF = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    import("html2canvas").then(({ default: html2canvas }) => {
      import("jspdf").then(({ default: jsPDF }) => {
        html2canvas(el).then((canvas) => {
          const pdf = new jsPDF({ format: "a4" });
          const img = canvas.toDataURL("image/png");
          const ratio = canvas.height / canvas.width;
          const w = 190;
          const h = w * ratio;
          pdf.addImage(img, "PNG", 10, 10, w, Math.min(h, 270));
          pdf.save(`${sectionId}.pdf`);
        });
      });
    });
  };

  const handleExportDOCX = (sectionId: string) => {
    if (!result) return;
    const section = OUTPUT_SECTIONS.find((s) => s.id === sectionId);
    if (!section) return;
    const text = result.outputs[section.key] ?? "";
    if (!text) return;
    import("docx").then((docx) => {
      const children: InstanceType<typeof docx.Paragraph>[] = [
        new docx.Paragraph({
          text: section.title,
          heading: docx.HeadingLevel.HEADING_1,
        }),
      ];
      for (const p of text.split("\n\n")) {
        const clean = p.replace(/^#+\s*/, "").replace(/^[-*]\s*/, "• ");
        if (clean) children.push(new docx.Paragraph({ text: clean, spacing: { after: 200 } }));
      }
      const doc = new docx.Document({
        sections: [{ properties: {}, children }],
      });
      docx.Packer.toBlob(doc).then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${sectionId}.docx`;
        a.click();
        URL.revokeObjectURL(url);
      });
    });
  };

  const handleExportAllPDF = () => {
    const sectionsToExport = (result?.outputs.jobPostingReframe ?? "").trim()
      ? [JOB_POSTING_REFrame, ...OUTPUT_SECTIONS]
      : OUTPUT_SECTIONS;
    sectionsToExport.forEach((s) => handleExportPDF(s.id));
  };

  const handleExportAllDOCX = async () => {
    if (!result) return;
    const docx = await import("docx");
    const children: InstanceType<typeof docx.Paragraph>[] = [];
    const sectionsToExport = (result.outputs.jobPostingReframe ?? "").trim()
      ? [JOB_POSTING_REFrame, ...OUTPUT_SECTIONS]
      : OUTPUT_SECTIONS;
    for (const section of sectionsToExport) {
      const text = (result.outputs as unknown as Record<string, string>)[section.key] ?? "";
      children.push(
        new docx.Paragraph({
          text: section.title,
          heading: docx.HeadingLevel.HEADING_1,
        })
      );
      for (const p of text.split("\n\n")) {
        const clean = p.replace(/^#+\s*/, "").replace(/^[-*]\s*/, "• ");
        if (clean) children.push(new docx.Paragraph({ text: clean, spacing: { after: 200 } }));
      }
      children.push(new docx.Paragraph({ text: "", spacing: { after: 400 } }));
    }
    const doc = new docx.Document({
      sections: [{ properties: {}, children }],
    });
    const blob = await docx.Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chief-of-staff-outputs.docx";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-[var(--muted)]">{error}</p>
        <Link
          href="/intake"
          className="mt-4 inline-block text-[var(--foreground)] hover:underline"
        >
          Start over
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)]" />
        <p className="mt-4 text-[var(--muted)]">Loading results…</p>
        <p className="mt-2 text-xs text-[var(--muted)]">If this takes too long, the server may have restarted. Try generating again.</p>
      </div>
    );
  }

  const hasJobPostingReframe = (result.outputs.jobPostingReframe ?? "").trim().length > 0;
  const isChiefOfStaff = result.analysis.recommended_title.toLowerCase().includes("chief of staff");
  const hasContent = OUTPUT_SECTIONS.some((s) => (result.outputs[s.key] ?? "").trim().length > 0) || hasJobPostingReframe;
  if (!hasContent) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-[var(--muted)]">Results were generated but the content is empty. This can happen if the AI request failed partway through.</p>
        <Link href="/intake" className="mt-4 inline-block text-[var(--foreground)] hover:underline">Try again</Link>
      </div>
    );
  }

  const allSections = hasJobPostingReframe
    ? [JOB_POSTING_REFrame, ...OUTPUT_SECTIONS]
    : OUTPUT_SECTIONS;

  return (
    <div className="mx-auto max-w-[720px] px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:text-[var(--foreground)]"
        >
        ← Outliers
      </Link>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            {isChiefOfStaff ? "Your Chief of Staff Outputs" : "Your Founder Office Outputs"}
          </h1>
          <p className="mt-1 text-sm text-white/90">
            Recommended: {result.analysis.recommended_title} • {result.analysis.archetype}
          </p>
          {hasJobPostingReframe && (
            <p className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-white/90">
              Post as <strong>{result.analysis.recommended_job_posting_title || result.analysis.recommended_title}</strong> — not &quot;Chief of Staff&quot;. Use the Job Posting Reframe below to attract the right candidate pool.
            </p>
          )}
        </div>
        <ExportButton
          onExportAllPDF={handleExportAllPDF}
          onExportAllDOCX={handleExportAllDOCX}
        />
      </div>
      <div className="space-y-12">
        {allSections.map((section) => (
          <OutputCard
            key={section.id}
            id={section.id}
            title={section.title}
            content={(result.outputs as unknown as Record<string, string>)[section.key] ?? ""}
            onExportPDF={handleExportPDF}
            onExportDOCX={handleExportDOCX}
          />
        ))}
      </div>
      <div className="mt-12 flex justify-center">
        <Link
          href="/intake"
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
        >
          Create another
        </Link>
      </div>
    </div>
  );
}
