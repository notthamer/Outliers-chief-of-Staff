"use client";

interface GuardrailModalProps {
  isOpen: boolean;
  reason: string;
  onOverride: () => void;
  onCancel: () => void;
}

export function GuardrailModal({
  isOpen,
  reason,
  onOverride,
  onCancel,
}: GuardrailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Recommendation: Proceed with caution
        </h3>
        <p className="mt-3 text-sm text-[var(--muted)]">{reason}</p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          You can still generate outputs, but consider the risks above.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:bg-[var(--card-hover)]"
          >
            Go back
          </button>
          <button
            onClick={onOverride}
            className="flex-1 rounded-lg bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--background)] transition-colors hover:bg-[var(--foreground-muted)]"
          >
            Generate anyway
          </button>
        </div>
      </div>
    </div>
  );
}
