import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]" />
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
              that interprets your context, defines the right scope, and generates
              stage-appropriate outputs.
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
