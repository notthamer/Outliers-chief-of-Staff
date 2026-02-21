import type { FounderIntake } from "./types";

export const SYSTEM_PROMPT = `You are an expert organizational advisor specializing in founder offices and Chief of Staff roles at startups. Your role is to analyze founder context and determine whether a Chief of Staff is appropriate, and if so, define the correct scope and archetype.

## Archetypes you may recommend:
- Strategic Partner: High strategic input, board/investor liaison, OKR ownership
- Execution Lead: Operational cadence, cross-functional coordination, PMO-light
- Founder Extension: Calendar, communications, gatekeeper, EA-plus
- Scale Architect: Team scaling, process design, hiring support
- Hybrid: Combination based on context

## Alternative roles (when CoS is NOT appropriate):
- Executive Assistant
- COO
- Head of Ops
- PMO
- Founder Office Associate

## Guardrails - Flag these situations:
- Team < 5 people
- No defined strategic initiatives
- No operational baseline
- Role inflation risk
- Premature executive hire risk
- Founder dependency risk

## Output format:
Respond with valid JSON only. No markdown, no explanation outside JSON.`;

export function buildUserPrompt(intake: FounderIntake): string {
  const { companyContext, operationalPain, freeText, menaContext } = intake;

  const painLabels: Record<string, string> = {
    "investor-chaos": "Investor/board chaos",
    "cross-functional-drift": "Cross-functional drift",
    "strategic-clarity": "Strategic clarity",
    "execution-bottleneck": "Execution bottleneck",
    "team-scaling": "Team scaling",
    "board-reporting": "Board reporting",
    "fundraising": "Fundraising",
    "operational-maturity": "Operational maturity",
    "founder-time": "Founder time allocation",
    other: "Other",
  };

  const painList = operationalPain
    .map((p) => painLabels[p] ?? p)
    .join(", ");

  const industryLabels: Record<string, string> = {
    fintech: "Fintech",
    healthtech: "Healthtech",
    saas: "SaaS",
    ecommerce: "E-commerce",
    marketplace: "Marketplace",
    "ai-ml": "AI / ML",
    climate: "Climate / Clean tech",
    edtech: "Edtech",
    proptech: "Proptech",
    other: "Other",
  };
  const workModelLabels: Record<string, string> = {
    remote: "Remote",
    hybrid: "Hybrid",
    onsite: "On-site",
  };
  const timelineLabels: Record<string, string> = {
    urgent: "Urgent (ASAP)",
    "1-3-months": "1–3 months",
    "3-6-months": "3–6 months",
    "6-plus-months": "6+ months",
  };

  return `## Company Context
- Company name: ${companyContext.companyName || "Not specified"}
- Stage: ${companyContext.stage || "Not specified"}
- Team size: ${companyContext.teamSize || "Not specified"}
- Revenue: ${companyContext.revenue || "Not specified"}
- Board complexity: ${companyContext.boardComplexity || "Not specified"}
- Founder type: ${companyContext.founderType || "Not specified"}
- Industry: ${companyContext.industry ? industryLabels[companyContext.industry] || companyContext.industry : "Not specified"}
- Work model: ${companyContext.workModel ? workModelLabels[companyContext.workModel] || companyContext.workModel : "Not specified"}
- Location: ${companyContext.location || "Not specified"}
- Hiring timeline: ${companyContext.hiringTimeline ? timelineLabels[companyContext.hiringTimeline] || companyContext.hiringTimeline : "Not specified"}
${companyContext.strategicInitiatives ? `- Key strategic initiatives: ${companyContext.strategicInitiatives}` : ""}

## Operational Pain Areas
${painList || "None specified"}

## Founder Free-Text Responses

### What is your startup about?
${freeText.startupDescription}

### What problem is your company trying to solve?
${freeText.problemSolving}

### What's your vision for the company?
${freeText.companyVision}

### Describe your typical week
${freeText.typicalWeek}

### What feels chaotic right now?
${freeText.chaoticNow}

### If you hired someone tomorrow, what would they immediately fix?
${freeText.immediateFix}

### What conversations do you dread?
${freeText.dreadedConversations}

### Where do you feel you are the bottleneck?
${freeText.bottleneck}

${menaContext ? "\n## Regional Context: Optimize for MENA (Middle East and North Africa) - consider local talent pools, titles, and organizational norms.\n" : ""}

Analyze this founder's context and return a JSON object with exactly these keys (all strings; risk_warnings and primary_focus and secondary_focus are arrays of strings):
{
  "recommended_title": "Chief of Staff" or alternative (e.g. "Executive Assistant", "Head of Ops"),
  "archetype": "one of the archetypes or alternatives",
  "confidence_score": "1-10",
  "role_exists_reason": "2-3 sentences on why this role should exist",
  "risk_warnings": ["warning1", "warning2"],
  "primary_focus": ["focus1", "focus2", "focus3"],
  "secondary_focus": ["focus1", "focus2"],
  "founder_dependency_risk": "low/medium/high and brief explanation",
  "organizational_maturity_score": "1-10",
  "recommended_job_posting_title": "When NOT Chief of Staff: the exact job title to POST (e.g. 'Executive Assistant to Founder', 'Operations Manager') to attract the right candidate pool. Empty string when Chief of Staff is recommended.",
  "alternative_posting_titles": "When NOT Chief of Staff: array of 2-4 alternative titles that work in MENA/local market. Empty array when Chief of Staff.",
  "reframe_for_mena": "When NOT Chief of Staff: 2-3 sentences on how to frame this role for MENA talent pools—why 'Chief of Staff' may not resonate, what titles do, where to post. Empty string when Chief of Staff."
}`;
}

export const OUTPUT_GENERATION_SYSTEM = `You are an expert at writing Chief of Staff job materials. Generate clear, professional, stage-appropriate content. Be specific and actionable. Avoid generic filler.

When the founder describes what their startup does, what problem they solve, and their vision—use this to make outputs specific to their business and mission, not generic. When company context includes industry, work model (remote/hybrid/onsite), location, or hiring timeline—use these to tailor the outputs. For example:
- Job Description: Include work model and location when specified.
- 90-Day Plan: Adjust pace and milestones based on hiring timeline (urgent vs 6+ months).
- Candidate Fit: Consider industry experience and location preferences when relevant.`;
