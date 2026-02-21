// Founder intake types
export type Stage =
  | "pre-seed"
  | "seed"
  | "series-a"
  | "series-b"
  | "series-c-plus";

export type TeamSize = "1-5" | "6-15" | "16-30" | "31-50" | "50+";

export type Revenue =
  | "pre-revenue"
  | "0-500k"
  | "500k-2m"
  | "2m-10m"
  | "10m+";

export type BoardComplexity = "none" | "informal" | "formal" | "complex";

export type FounderType =
  | "solo"
  | "co-founders"
  | "first-time"
  | "repeat";

export type Industry =
  | "fintech"
  | "healthtech"
  | "saas"
  | "ecommerce"
  | "marketplace"
  | "ai-ml"
  | "climate"
  | "edtech"
  | "proptech"
  | "other";

export type WorkModel = "remote" | "hybrid" | "onsite";

export type HiringTimeline = "urgent" | "1-3-months" | "3-6-months" | "6-plus-months";

export type OperationalPain =
  | "investor-chaos"
  | "cross-functional-drift"
  | "strategic-clarity"
  | "execution-bottleneck"
  | "team-scaling"
  | "board-reporting"
  | "fundraising"
  | "operational-maturity"
  | "founder-time"
  | "other";

export interface CompanyContext {
  stage: Stage | "";
  teamSize: TeamSize | "";
  revenue: Revenue | "";
  boardComplexity: BoardComplexity | "";
  founderType: FounderType | "";
  industry: Industry | "";
  workModel: WorkModel | "";
  location: string;
  hiringTimeline: HiringTimeline | "";
  strategicInitiatives: string;
}

export interface FreeTextAnswers {
  startupDescription: string;
  problemSolving: string;
  companyVision: string;
  typicalWeek: string;
  chaoticNow: string;
  immediateFix: string;
  dreadedConversations: string;
  bottleneck: string;
}

export interface FounderIntake {
  companyContext: CompanyContext;
  operationalPain: OperationalPain[];
  freeText: FreeTextAnswers;
  menaContext: boolean;
}

// AI output types
export interface AIAnalysis {
  recommended_title: string;
  archetype: string;
  confidence_score: string;
  role_exists_reason: string;
  risk_warnings: string[];
  primary_focus: string[];
  secondary_focus: string[];
  founder_dependency_risk: string;
  organizational_maturity_score: string;
  /** When NOT Chief of Staff: suggested job posting title to attract the right pool */
  recommended_job_posting_title?: string;
  /** Alternative titles that work in MENA / local market */
  alternative_posting_titles?: string[];
  /** Brief reframe guidance for posting in MENA */
  reframe_for_mena?: string;
}

export interface GeneratedOutputs {
  roleBrief: string;
  jobDescription: string;
  ninetyDayPlan: string;
  interviewFramework: string;
  candidateFit: string;
  /** When recommended role is NOT Chief of Staff: how to post and reframe for candidate pool */
  jobPostingReframe?: string;
}

export interface SessionResult {
  id: string;
  intake: FounderIntake;
  analysis: AIAnalysis;
  outputs: GeneratedOutputs;
  guardrailTriggered: boolean;
  createdAt: string;
}
