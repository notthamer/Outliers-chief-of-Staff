"use client";

const STEPS = [
  "Company context",
  "Operational pain",
  "Free-text prompts",
  "MENA context",
  "Review",
];

interface StepperProps {
  currentStep: number;
}

export function Stepper({ currentStep }: StepperProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between">
        {STEPS.map((label, index) => {
          const stepNum = index + 1;
          const isComplete = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          return (
            <li
              key={stepNum}
              className={`flex flex-1 items-center ${index < STEPS.length - 1 ? "pr-2" : ""}`}
            >
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors
                    ${isComplete ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]" : ""}
                    ${isCurrent ? "border-[var(--foreground)] bg-[var(--card)] text-[var(--foreground)]" : ""}
                    ${!isComplete && !isCurrent ? "border-[var(--border)] bg-[var(--card)] text-[var(--muted)]" : ""}
                  `}
                >
                  {isComplete ? (
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium hidden sm:block ${
                    isCurrent ? "text-[var(--foreground)]" : isComplete ? "text-[var(--muted)]" : "text-[var(--muted)]"
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 rounded ${
                    isComplete ? "bg-[var(--foreground)]" : "bg-[var(--border)]"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-center text-sm text-[var(--muted)]">
        Step {currentStep} of {STEPS.length}
      </p>
    </nav>
  );
}
