"use client";

import { useState } from "react";
import Link from "next/link";

const HOW_IT_WORKS = [
  {
    title: "01 — Input",
    content: "Share your company context (stage, team, revenue), operational pain points, and what your startup is about. The more detail, the better the outputs.",
  },
  {
    title: "02 — Engine",
    content: "Our AI analyzes your context, determines if Chief of Staff is the right role (or suggests alternatives like EA/Ops), and defines the right scope and archetype.",
  },
  {
    title: "03 — Output",
    content: "Get a Role Brief, Job Description, 90-Day Plan, Interview Framework, and Candidate Fit—all tailored to your stage and situation. Export as PDF or DOCX.",
  },
];

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]" />
      <div className="relative flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-6 font-mono md:px-12">
          <span className="text-sm font-medium tracking-[0.2em] text-white/70">
            Outliers
          </span>
          <nav className="flex gap-8 text-sm text-white/60">
            <span className="hidden sm:inline">Chief of Staff Engine</span>
          </nav>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 md:px-12">
          <div className="mx-auto max-w-4xl font-mono">
            <p className="mb-6 text-sm font-medium tracking-[0.2em] text-[var(--primary-light)]">
              &gt; Introducing
            </p>
            <h1 className="text-5xl font-normal tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
              Chief of Staff
              <br />
              <span className="text-white/80">Structuring Engine</span>
              <span className="ml-1 inline-block h-[0.9em] w-0.5 animate-cursor-blink bg-[var(--primary-light)] align-middle" aria-hidden />
            </h1>
            <p className="mt-12 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
              This is not a template tool.
              <br />
              It&apos;s a{" "}
              <span className="font-semibold text-white">
                role reasoning engine
              </span>{" "}
              that interprets your context, defines the right scope, and
              generates stage-appropriate outputs.
            </p>
            <div className="mt-16">
              <Link
                href="/intake"
                className="group inline-flex items-center gap-2 rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-10 py-4 text-base font-medium text-[var(--background)] transition-all hover:bg-[var(--foreground-muted)] hover:border-[var(--foreground-muted)]"
              >
                Begin
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
            <p className="mt-12 text-sm text-white/60">
              Understand your context · Define the role · Generate outputs
            </p>

            <div className="mt-24 w-full max-w-3xl border-t border-[var(--border)] pt-12">
              <h2 className="mb-8 text-sm font-medium uppercase tracking-[0.2em] text-white/70">
                How it works
              </h2>
              <div className="flex flex-col gap-0 sm:flex-row sm:items-stretch sm:gap-0">
                {HOW_IT_WORKS.map((item, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      aria-pressed={activeIndex === i}
                      aria-label={`Show ${item.title.replace(/^\d+ — /, "")} details`}
                      className={`group flex w-full flex-1 cursor-pointer select-none flex-col items-center gap-3 rounded-xl border px-5 py-5 transition-all duration-300 sm:min-h-[120px] sm:justify-center ${
                        activeIndex === i
                          ? "border-[var(--primary-light)]/50 bg-[var(--primary-muted)]/30"
                          : "border-[var(--border)] bg-[var(--card)]/50 hover:border-white/20 hover:bg-[var(--card-hover)]/50"
                      }`}
                    >
                      <span className="text-xs font-medium uppercase tracking-wider text-white/50">
                        Step {i + 1}
                      </span>
                      <span className="text-center text-sm font-medium text-white">
                        {item.title.replace(/^\d+ — /, "")}
                      </span>
                      <span
                        className={`mt-1 h-1.5 w-8 rounded-full transition-all duration-300 ${
                          activeIndex === i ? "bg-[var(--primary-light)]" : "bg-white/20"
                        }`}
                      />
                    </button>
                    {i < HOW_IT_WORKS.length - 1 && (
                      <div className="hidden flex-1 items-center justify-center px-1 sm:flex">
                        <span className="text-white/30">→</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 min-h-[120px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)]/50 px-5 py-5">
                {HOW_IT_WORKS.map((item, i) =>
                  activeIndex === i ? (
                    <div key={i} className="animate-slide-up">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--primary-light)]">
                        {item.title}
                      </p>
                      <p className="text-sm leading-relaxed text-white/80">
                        {item.content}
                      </p>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </main>
        <footer className="px-6 py-8 font-mono md:px-12">
          <p className="text-xs text-white/50">
            Shipped for founders building the future
          </p>
        </footer>
      </div>
    </div>
  );
}
