import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Chief of Staff Structuring Engine | Outliers",
  description:
    "GenAI-powered role reasoning for founders. Define the right Chief of Staff scope and generate stage-appropriate outputs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bricolage.variable} ${serif.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
