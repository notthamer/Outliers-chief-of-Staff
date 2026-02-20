import type { AIAnalysis, FounderIntake } from "./types";

export interface GuardrailResult {
  triggered: boolean;
  reason: string;
}

const MIN_TEAM_SIZE = 5;
const TEAM_SIZE_MAP: Record<string, number> = {
  "1-5": 5,
  "6-15": 15,
  "16-30": 30,
  "31-50": 50,
  "50+": 100,
};

export function checkGuardrails(
  intake: FounderIntake,
  analysis: AIAnalysis
): GuardrailResult {
  const teamSizeStr = intake.companyContext.teamSize;
  const teamSize = teamSizeStr ? TEAM_SIZE_MAP[teamSizeStr] ?? 0 : 0;

  if (teamSize > 0 && teamSize < MIN_TEAM_SIZE) {
    return {
      triggered: true,
      reason: `Team size (${teamSizeStr}) is below the recommended minimum of ${MIN_TEAM_SIZE} for a Chief of Staff role. Consider an Executive Assistant or fractional support first.`,
    };
  }

  const hasStrategicInitiatives =
    intake.operationalPain.length > 0 ||
    intake.operationalPain.includes("strategic-clarity") ||
    intake.operationalPain.includes("execution-bottleneck") ||
    intake.freeText.chaoticNow.length > 100 ||
    intake.freeText.immediateFix.length > 100;

  if (!hasStrategicInitiatives) {
    return {
      triggered: true,
      reason:
        "No clear strategic initiatives or operational baseline detected. A Chief of Staff typically needs defined strategic work to execute. Consider clarifying your priorities first.",
    };
  }

  const maturityScore = parseInt(analysis.organizational_maturity_score, 10);
  if (!isNaN(maturityScore) && maturityScore < 3) {
    return {
      triggered: true,
      reason:
        "Organizational maturity appears low. A Chief of Staff may be premature—consider building foundational operations first.",
    };
  }

  if (analysis.risk_warnings.some((w) => w.toLowerCase().includes("premature"))) {
    return {
      triggered: true,
      reason:
        "The analysis suggests this hire may be premature. Review the risk warnings before proceeding.",
    };
  }

  return { triggered: false, reason: "" };
}
