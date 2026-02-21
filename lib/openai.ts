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
  const cc = intake.companyContext;
  const context = `
Company: ${cc.companyName ? `${cc.companyName} — ` : ""}${cc.stage}, ${cc.teamSize} team, ${cc.revenue} revenue
Industry: ${cc.industry || "Not specified"} | Work model: ${cc.workModel || "Not specified"} | Location: ${cc.location || "Not specified"}
Hiring timeline: ${cc.hiringTimeline || "Not specified"}
${cc.strategicInitiatives ? `Strategic initiatives: ${cc.strategicInitiatives}` : ""}

Recommended title: ${analysis.recommended_title}
Archetype: ${analysis.archetype}
Primary focus: ${(analysis.primary_focus ?? []).join(", ")}
Secondary focus: ${(analysis.secondary_focus ?? []).join(", ")}
Risk warnings: ${(analysis.risk_warnings ?? []).join("; ")}
Role exists because: ${analysis.role_exists_reason}

Startup: ${(intake.freeText.startupDescription || "").slice(0, 150)}${(intake.freeText.startupDescription || "").length > 150 ? "..." : ""}
Problem solving: ${(intake.freeText.problemSolving || "").slice(0, 150)}${(intake.freeText.problemSolving || "").length > 150 ? "..." : ""}
Vision: ${(intake.freeText.companyVision || "").slice(0, 150)}${(intake.freeText.companyVision || "").length > 150 ? "..." : ""}

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

export type OutputKey = keyof GeneratedOutputs;

export async function* generateOutputsStreaming(
  intake: FounderIntake,
  analysis: AIAnalysis
): AsyncGenerator<{ key: OutputKey; content: string }> {
  const cc = intake.companyContext;
  const context = `
Company: ${cc.companyName ? `${cc.companyName} — ` : ""}${cc.stage}, ${cc.teamSize} team, ${cc.revenue} revenue
Industry: ${cc.industry || "Not specified"} | Work model: ${cc.workModel || "Not specified"} | Location: ${cc.location || "Not specified"}
Hiring timeline: ${cc.hiringTimeline || "Not specified"}
${cc.strategicInitiatives ? `Strategic initiatives: ${cc.strategicInitiatives}` : ""}

Recommended title: ${analysis.recommended_title}
Archetype: ${analysis.archetype}
Primary focus: ${(analysis.primary_focus ?? []).join(", ")}
Secondary focus: ${(analysis.secondary_focus ?? []).join(", ")}
Risk warnings: ${(analysis.risk_warnings ?? []).join("; ")}
Role exists because: ${analysis.role_exists_reason}

Startup: ${(intake.freeText.startupDescription || "").slice(0, 150)}${(intake.freeText.startupDescription || "").length > 150 ? "..." : ""}
Problem solving: ${(intake.freeText.problemSolving || "").slice(0, 150)}${(intake.freeText.problemSolving || "").length > 150 ? "..." : ""}
Vision: ${(intake.freeText.companyVision || "").slice(0, 150)}${(intake.freeText.companyVision || "").length > 150 ? "..." : ""}

Founder pain points:
- Typical week: ${intake.freeText.typicalWeek.slice(0, 300)}...
- Chaotic: ${intake.freeText.chaoticNow.slice(0, 300)}...
- Immediate fix: ${intake.freeText.immediateFix.slice(0, 300)}...
- Dreaded conversations: ${intake.freeText.dreadedConversations.slice(0, 200)}...
- Bottleneck: ${intake.freeText.bottleneck.slice(0, 200)}...
`;

  const isChiefOfStaff =
    analysis.recommended_title.toLowerCase().includes("chief of staff");

  const tasks: { key: OutputKey; fn: () => AsyncGenerator<string> }[] = [
    { key: "roleBrief", fn: () => streamRoleBrief(context) },
    { key: "jobDescription", fn: () => streamJobDescription(context) },
    { key: "ninetyDayPlan", fn: () => streamNinetyDayPlan(context, analysis, intake) },
    { key: "interviewFramework", fn: () => streamInterviewFramework(context) },
    { key: "candidateFit", fn: () => streamCandidateFit(context) },
  ];
  if (!isChiefOfStaff) {
    tasks.push({
      key: "jobPostingReframe",
      fn: () => streamJobPostingReframe(context, analysis, intake),
    });
  }

  for (const { key, fn } of tasks) {
    let fullContent = "";
    for await (const chunk of fn()) {
      fullContent += chunk;
      yield { key, chunk };
    }
    yield { key, content: fullContent };
  }
}

async function* streamCompletion(
  systemContent: string,
  userContent: string
): AsyncGenerator<string> {
  const stream = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: userContent },
    ],
    stream: true,
    temperature: 0.5,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}

async function* streamRoleBrief(context: string): AsyncGenerator<string> {
  yield* streamCompletion(
    OUTPUT_GENERATION_SYSTEM,
    `${context}

Write a concise 1-page Role Brief (founder-facing) with these sections:
1. Why this role should exist
2. Why now
3. What success looks like
4. What it is NOT

Use clear headings. Be specific. ~400-600 words.`
  );
}

async function* streamJobDescription(context: string): AsyncGenerator<string> {
  yield* streamCompletion(
    OUTPUT_GENERATION_SYSTEM,
    `${context}

Write a full Job Description including:
- Company summary (placeholder)
- Role mandate
- Key responsibilities (8-12 bullets)
- Success metrics
- Scope of authority
- Reporting structure
- Non-fits (what this role is NOT)

Tone should match stage and archetype. ~600-900 words.`
  );
}

async function* streamNinetyDayPlan(
  context: string,
  analysis: AIAnalysis,
  intake: FounderIntake
): AsyncGenerator<string> {
  const painContext = `
Specific founder pain: ${intake.freeText.immediateFix}
Chaos areas: ${intake.freeText.chaoticNow}
Bottleneck: ${intake.freeText.bottleneck}
`;
  yield* streamCompletion(
    OUTPUT_GENERATION_SYSTEM,
    `${context}${painContext}

Generate a 90-Day Plan with specific initiatives based on the founder's pain. NOT generic.
- Month 1: 3-4 specific initiatives (e.g. "Build investor reporting system" if they mentioned investor chaos)
- Month 2: 3-4 initiatives
- Month 3: 3-4 initiatives

Each initiative should be actionable and tied to their stated pain. ~400-600 words.`
  );
}

async function* streamInterviewFramework(context: string): AsyncGenerator<string> {
  yield* streamCompletion(
    OUTPUT_GENERATION_SYSTEM,
    `${context}

Create an Interview Framework with:
1. 8 behavioral questions
2. 5 execution simulation tasks
3. 3 strategic case prompts
4. A simple scoring matrix (1-5 scale, criteria)

Format clearly with sections. ~500-700 words.`
  );
}

async function* streamCandidateFit(context: string): AsyncGenerator<string> {
  yield* streamCompletion(
    OUTPUT_GENERATION_SYSTEM,
    `${context}

Define the ideal candidate profile. Consider:
- Consulting-heavy vs operator-heavy vs ex-scaleup vs startup generalist
- Years of experience
- Key skills
- Red flags to avoid

Produce a structured "Ideal Profile" section. ~300-400 words.`
  );
}

async function* streamJobPostingReframe(
  context: string,
  analysis: AIAnalysis,
  intake: FounderIntake
): AsyncGenerator<string> {
  const postingTitle = analysis.recommended_job_posting_title ?? analysis.recommended_title;
  const altTitles = analysis.alternative_posting_titles ?? [];
  const menaReframe = analysis.reframe_for_mena ?? "";
  const menaNote = intake.menaContext
    ? "\n\nFocus on MENA: 'Chief of Staff' is rare and often misrepresented in the region. Suggest titles that resonate locally (e.g. Founder Office Associate, EA to Founder, Operations Lead) and where to post (LinkedIn, local job boards, Outliers network)."
    : "";

  yield* streamCompletion(
    `You help founders post the RIGHT job to attract the right candidate pool. When a founder needs support but "Chief of Staff" isn't the right title, you suggest what to actually post and how to reframe it—especially for MENA where CoS is rare.`,
    `${context}

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

Format with clear headings. ~400-500 words. Be specific and actionable.`
  );
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
