"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0a0a0a", color: "#fafaf9", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ marginTop: 8, fontSize: "0.875rem", color: "#a8a29e" }}>{error.message}</p>
        <div style={{ marginTop: 32, display: "flex", gap: 16 }}>
          <button
            onClick={reset}
            style={{
              padding: "10px 16px",
              fontSize: "0.875rem",
              fontWeight: 500,
              background: "#fafaf9",
              color: "#0a0a0a",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              padding: "10px 16px",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#fafaf9",
              border: "1px solid #27272a",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            Go home
          </a>
        </div>
      </body>
    </html>
  );
}
