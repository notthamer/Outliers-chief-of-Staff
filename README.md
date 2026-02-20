# Chief of Staff Structuring Engine

A GenAI-powered role reasoning engine for founders. Understand your context, define the right Chief of Staff scope, and generate stage-appropriate outputs.

## Features

- **5-step intake flow**: Company context, operational pain, free-text prompts, MENA toggle, review
- **AI reasoning layer**: OpenAI GPT-4o analyzes founder context and recommends role/title/archetype
- **Guardrails**: Warns when team is too small or strategic baseline is missing; founder can override
- **5 outputs**: Role Brief, Job Description, 90-Day Plan, Interview Framework, Candidate Fit
- **Export**: PDF and DOCX per section or all at once

## Setup

```bash
bun install
cp .env.example .env
# Add your OPENAI_API_KEY to .env
bun run dev
```

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- OpenAI GPT-4o
- docx, jspdf, html2canvas for export

## Project Structure

```
app/
  page.tsx           # Landing → Begin
  intake/            # Stepper flow
  results/[id]/      # Output dashboard
  api/
    analyze/         # OpenAI reasoning + guardrails
    results/[id]/    # Fetch session by UUID
lib/
  openai.ts          # GPT-4o integration
  prompts.ts         # System + user prompts
  guardrails.ts      # Rule-based checks
  store.ts           # In-memory session store (MVP)
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add `OPENAI_API_KEY` in Vercel → Project Settings → Environment Variables
4. Deploy

## MVP Notes

- Anonymous sessions; no auth
- File-based session store in `data/sessions/` (ephemeral on Vercel serverless)
- Desktop-first
