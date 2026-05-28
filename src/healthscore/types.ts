export type HealthStatus = "Saudavel" | "Atencao" | "Risco" | "Critico" | "Incompleto";

export type DimensionId = "D1" | "D2" | "D3" | "D4" | "D5" | "D6";

export type SourceName =
  | "kuri_insights"
  | "v4corp"
  | "ekyte"
  | "nps"
  | "financial"
  | "meeting_transcript"
  | "pic_future";

export type AccountSegment = "ecommerce" | "inside_sales" | "b2b" | "institutional" | "unknown";

export type AccountInput = {
  accountId: string;
  accountName: string;
  period: string;
  coordinatorId?: string;
  coordinatorName?: string;
  amId?: string;
  amName?: string;
  segment: AccountSegment;
  metadata?: Record<string, string | number | boolean | null>;
};

export type Evidence = {
  externalId: string;
  url?: string;
  notes: string;
};

export type DimensionScore = {
  dimension: DimensionId;
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  reason: string;
  flags: string[];
  evidenceRefs: string[];
};

export type ResultImpactInput = {
  targetMetric?: string;
  targetValue?: number | null;
  actualValue?: number | null;
  pacingRate?: number | null;
  clientReported?: boolean | null;
  evidenceRefs?: string[];
};

export type RelationshipInput = {
  stakeholderMood?: "positive" | "neutral" | "negative" | "unknown" | null;
  coordinatorMoodRating?: "Feliz" | "Neutro" | "Infeliz" | null;
  monthlyCheckinDone?: boolean | null;
  clientAbsencesConsecutive?: number | null;
  evidenceRefs?: string[];
};

export type TrafficOperationInput = {
  hasStructuredFunnel?: boolean | null;
  kuriTrackingActive?: boolean | null;
  mediaBudgetMeetsMinimum?: boolean | null;
  evidenceRefs?: string[];
};

export type DeliveryInput = {
  tasksTotal?: number | null;
  tasksOnTime?: number | null;
  tasksLate?: number | null;
  onTimeRate?: number | null;
  evidenceRefs?: string[];
};

export type NpsInput = {
  responded?: boolean | null;
  npsScore?: number | null;
  commentSentiment?: "positive" | "neutral" | "negative" | "unknown" | null;
  sentimentConfidence?: number | null;
  evidenceRefs?: string[];
};

export type FinancialInput = {
  overdueDays?: number | null;
  isRecurringOverdue?: boolean | null;
  evidenceRefs?: string[];
};

export type HealthscoreInput = {
  account: AccountInput;
  period: string;
  result?: ResultImpactInput;
  relationship?: RelationshipInput;
  trafficOperation?: TrafficOperationInput;
  delivery?: DeliveryInput;
  nps?: NpsInput;
  financial?: FinancialInput;
};

export type FinancialCap = {
  applied: boolean;
  value: number | null;
  reason: string | null;
};

export type FinalHealthscoreReport = {
  accountId: string;
  accountName: string;
  period: string;
  rawScore: number;
  finalScore: number;
  status: HealthStatus;
  financialCap: FinancialCap;
  dimensions: DimensionScore[];
  flags: string[];
  missingData: string[];
  generatedAt: string;
};

