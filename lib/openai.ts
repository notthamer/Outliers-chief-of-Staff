import OpenAI from "openai";
import { buildUserPrompt, SYSTEM_PROMPT, OUTPUT_GENERATION_SYSTEM } from "./prompts";
import type { FounderIntake, AIAnalysis, GeneratedOutputs } from "./types";

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: key });
}

export async function analyzeFounderContext(
  intake: FounderIntake
): Promise<AIAnalysis> {
  const userPrompt = buildUserPrompt(intake);

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  return JSON.parse(content) as AIAnalysis;
}

export async function generateOutputs(
  intake: FounderIntake,
  analysis: AIAnalysis
): Promise<GeneratedOutputs> {
  const context = `
Company: ${intake.companyContext.stage}, ${intake.companyContext.teamSize} team, ${intake.companyContext.revenue} revenue
Recommended title: ${analysis.recommended_title}
Archetype: ${analysis.archetype}
Primary focus: ${(analysis.primary_focus ?? []).join(", ")}
Secondary focus: ${(analysis.secondary_focus ?? []).join(", ")}
Risk warnings: ${(analysis.risk_warnings ?? []).join("; ")}
Role exists because: ${analysis.role_exists_reason}

Founder pain points:
- Typical week: ${intake.freeText.typicalWeek.slice(0, 300)}...
- Chaotic: ${intake.freeText.chaoticNow.slice(0, 300)}...
- Immediate fix: ${intake.freeText.immediateFix.slice(0, 300)}...
- Dreaded conversations: ${intake.freeText.dreadedConversations.slice(0, 200)}...
- Bottleneck: ${intake.freeText.bottleneck.slice(0, 200)}...
`;

  const isChiefOfStaff =
    analysis.recommended_title.toLowerCase().includes("chief of staff");

  const [roleBrief, jobDescription, ninetyDayPlan, interviewFramework, candidateFit, jobPostingReframe] =
    await Promise.all([
      generateRoleBrief(context),
      generateJobDescription(context),
      generateNinetyDayPlan(context, analysis, intake),
      generateInterviewFramework(context),
      generateCandidateFit(context),
      isChiefOfStaff
        ? Promise.resolve("")
        : generateJobPostingReframe(context, analysis, intake),
    ]);

  return {
    roleBrief,
    jobDescription,
    ninetyDayPlan,
    interviewFramework,
    candidateFit,
    ...(jobPostingReframe && { jobPostingReframe }),
  };
}

async function generateRoleBrief(context: string): Promise<string> {
  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: OUTPUT_GENERATION_SYSTEM },
      {
        role: "user",
        content: `${context}

Write a concise 1-page Role Brief (founder-facing) with these sections:
1. Why this role should exist
2. Why now
3. What success looks like
4. What it is NOT

Use clear headings. Be specific. ~400-600 words.`,
      },
    ],
    temperature: 0.5,
  });
  return res.choices[0]?.message?.content ?? "";
}

async function generateJobDescription(context: string): Promise<string> {
  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: OUTPUT_GENERATION_SYSTEM },
      {
        role: "user",
        content: `${context}

Write a full Job Description including:
- Company summary (placeholder)
- Role mandate
- Key responsibilities (8-12 bullets)
- Success metrics
- Scope of authority
- Reporting structure
- Non-fits (what this role is NOT)

Tone should match stage and archetype. ~600-900 words.`,
      },
    ],
    temperature: 0.5,
  });
  return res.choices[0]?.message?.content ?? "";
}

async function generateNinetyDayPlan(
  context: string,
  analysis: AIAnalysis,
  intake: FounderIntake
): Promise<string> {
  const painContext = `
Specific founder pain: ${intake.freeText.immediateFix}
Chaos areas: ${intake.freeText.chaoticNow}
Bottleneck: ${intake.freeText.bottleneck}
`;
  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: OUTPUT_GENERATION_SYSTEM },
      {
        role: "user",
        content: `${context}${painContext}

Generate a 90-Day Plan with specific initiatives based on the founder's pain. NOT generic.
- Month 1: 3-4 specific initiatives (e.g. "Build investor reporting system" if they mentioned investor chaos)
- Month 2: 3-4 initiatives
- Month 3: 3-4 initiatives

Each initiative should be actionable and tied to their stated pain. ~400-600 words.`,
      },
    ],
    temperature: 0.5,
  });
  return res.choices[0]?.message?.content ?? "";
}

async function generateInterviewFramework(context: string): Promise<string> {
  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: OUTPUT_GENERATION_SYSTEM },
      {
        role: "user",
        content: `${context}

Create an Interview Framework with:
1. 8 behavioral questions
2. 5 execution simulation tasks
3. 3 strategic case prompts
4. A simple scoring matrix (1-5 scale, criteria)

Format clearly with sections. ~500-700 words.`,
      },
    ],
    temperature: 0.5,
  });
  return res.choices[0]?.message?.content ?? "";
}

async function generateCandidateFit(context: string): Promise<string> {
  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: OUTPUT_GENERATION_SYSTEM },
      {
        role: "user",
        content: `${context}

Define the ideal candidate profile. Consider:
- Consulting-heavy vs operator-heavy vs ex-scaleup vs startup generalist
- Years of experience
- Key skills
- Red flags to avoid

Produce a structured "Ideal Profile" section. ~300-400 words.`,
      },
    ],
    temperature: 0.5,
  });
  return res.choices[0]?.message?.content ?? "";
}

async function generateJobPostingReframe(
  context: string,
  analysis: AIAnalysis,
  intake: FounderIntake
): Promise<string> {
  const postingTitle = analysis.recommended_job_posting_title ?? analysis.recommended_title;
  const altTitles = analysis.alternative_posting_titles ?? [];
  const menaReframe = analysis.reframe_for_mena ?? "";
  const menaNote = intake.menaContext
    ? "\n\nFocus on MENA: 'Chief of Staff' is rare and often misrepresented in the region. Suggest titles that resonate locally (e.g. Founder Office Associate, EA to Founder, Operations Lead) and where to post (LinkedIn, local job boards, Outliers network)."
    : "";

  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You help founders post the RIGHT job to attract the right candidate pool. When a founder needs support but "Chief of Staff" isn't the right title, you suggest what to actually post and how to reframe it—especially for MENA where CoS is rare.`,
      },
      {
        role: "user",
        content: `${context}

The founder was recommended: ${analysis.recommended_title} (not Chief of Staff).

Suggested posting title from analysis: ${postingTitle}
Alternative titles: ${altTitles.join(", ") || "none"}
MENA reframe note: ${menaReframe}
${menaNote}

Create a "Job Posting Reframe" document with:

1. **Post This Title** – The exact job title to use when posting (and why it attracts the right pool)
2. **Alternative Titles for MENA** – 2-4 titles that work locally if the primary doesn't resonate
3. **How to Frame the Role** – 2-3 sentences for the job posting summary that captures the scope without inflating the title
4. **Where to Post** – Suggested channels (LinkedIn, local boards, Outliers/VC network)
5. **What to Avoid** – Common mistakes (e.g. posting "Chief of Staff" when you need an EA; underselling when you need strategic support)

Format with clear headings. ~400-500 words. Be specific and actionable.`,
      },
    ],
    temperature: 0.5,
  });
  return res.choices[0]?.message?.content ?? "";
}
