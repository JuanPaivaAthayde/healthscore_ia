import { healthscoreInputSchema } from "./schemas.js";
import type {
  DeliveryInput,
  DimensionId,
  DimensionScore,
  FinalHealthscoreReport,
  FinancialCap,
  FinancialInput,
  HealthscoreInput,
  HealthStatus,
  NpsInput,
  RelationshipInput,
  ResultImpactInput,
  TrafficOperationInput
} from "./types.js";

const DIMENSION_WEIGHTS: Record<DimensionId, number> = {
  D1: 0.25,
  D2: 0.2,
  D3: 0.2,
  D4: 0.15,
  D5: 0.12,
  D6: 0.08
};

const DIMENSION_NAMES: Record<DimensionId, string> = {
  D1: "Resultado / Impacto Racional",
  D2: "Relacionamento & Engajamento",
  D3: "Operação de Tráfego",
  D4: "Entregas no Prazo",
  D5: "Satisfação / NPS",
  D6: "Saúde Financeira"
};

type ScoreDetails = {
  score: number;
  reason: string;
  flags: string[];
  missingData: string[];
  evidenceRefs: string[];
};

export function calculateHealthscore(input: HealthscoreInput, now = new Date()): FinalHealthscoreReport {
  const parsed = healthscoreInputSchema.parse(input) as HealthscoreInput;

  const dimensions = [
    toDimensionScore("D1", scoreResultImpact(parsed.result)),
    toDimensionScore("D2", scoreRelationship(parsed.relationship)),
    toDimensionScore("D3", scoreTrafficOperation(parsed.trafficOperation)),
    toDimensionScore("D4", scoreDelivery(parsed.delivery)),
    toDimensionScore("D5", scoreNps(parsed.nps)),
    toDimensionScore("D6", scoreFinancialHealth(parsed.financial))
  ];

  const rawScore = roundScore(dimensions.reduce((total, dimension) => total + dimension.weightedScore, 0));
  const cap = getFinancialCap(parsed.financial);
  const cappedScore = cap.value === null ? rawScore : Math.min(rawScore, cap.value);
  const finalScore = Math.round(cappedScore);
  const status = cap.value === 39 ? "Critico" : getStatus(finalScore);
  const flags = unique([
    ...dimensions.flatMap((dimension) => dimension.flags),
    ...(cap.applied ? ["financial_cap_applied"] : [])
  ]);
  const missingData = unique(dimensions.flatMap((dimension) => dimension.flags.filter((flag) => flag.startsWith("missing_"))));

  return {
    accountId: parsed.account.accountId,
    accountName: parsed.account.accountName,
    period: parsed.period,
    rawScore,
    finalScore,
    status,
    financialCap: cap,
    dimensions,
    flags,
    missingData,
    generatedAt: now.toISOString()
  };
}

export function scoreResultImpact(input: ResultImpactInput | undefined): ScoreDetails {
  const evidenceRefs = input?.evidenceRefs ?? [];

  if (!input) {
    return details(10, "Dados de resultado ausentes.", ["missing_result_signal"], ["missing_result_signal"], evidenceRefs);
  }

  const targetValue = input.targetValue ?? null;
  const actualValue = input.actualValue ?? null;
  const pacingRate = input.pacingRate ?? calculateRate(actualValue, targetValue);

  if (input.clientReported === false || targetValue === null || actualValue === null || pacingRate === null) {
    return details(
      10,
      "Cliente ou fonte não reportou meta/resultado suficiente para calcular pacing.",
      ["missing_result_data"],
      ["missing_result_data"],
      evidenceRefs
    );
  }

  if (pacingRate >= 1) {
    return details(100, "Meta atingida em 100% ou mais.", ["target_achieved"], [], evidenceRefs);
  }

  if (pacingRate >= 0.8) {
    return details(75, "Pacing entre 80% e 99% da meta.", [], [], evidenceRefs);
  }

  if (pacingRate >= 0.6) {
    return details(50, "Pacing entre 60% e 79% da meta.", [], [], evidenceRefs);
  }

  return details(25, "Pacing abaixo de 60% da meta.", ["result_below_60_percent"], [], evidenceRefs);
}

export function scoreRelationship(input: RelationshipInput | undefined): ScoreDetails {
  const evidenceRefs = input?.evidenceRefs ?? [];

  if (!input) {
    return details(20, "Dados de relacionamento ausentes.", ["missing_relationship_signal"], ["missing_relationship_signal"], evidenceRefs);
  }

  const flags: string[] = [];
  const missingData: string[] = [];
  const checkinDone = input.monthlyCheckinDone ?? null;
  const stakeholderMood = input.stakeholderMood ?? "unknown";
  const coordinatorMood = input.coordinatorMoodRating ?? null;

  if (checkinDone === false) {
    return details(
      applyRelationshipAbsenceCap(20, input, flags),
      "Nenhum check-in registrado no mês.",
      [...flags, "no_monthly_checkin", "automatic_relationship_risk"],
      missingData,
      evidenceRefs
    );
  }

  if (checkinDone === null) {
    flags.push("missing_monthly_checkin");
    missingData.push("missing_monthly_checkin");
  }

  let score = 65;
  let reason = "Check-in realizado com humor neutro ou sinal insuficiente para classificação positiva.";

  if (coordinatorMood === null) {
    score = 50;
    reason = "Check-in realizado, mas coordenador não preencheu avaliação.";
    flags.push("missing_coordinator_mood_rating");
    missingData.push("missing_coordinator_mood_rating");
  } else if (stakeholderMood === "negative" || coordinatorMood === "Infeliz") {
    score = 35;
    reason = "Humor negativo identificado pelo agent ou avaliação Infeliz do coordenador.";
    flags.push("negative_relationship_signal");
  } else if (stakeholderMood === "positive" && coordinatorMood === "Feliz" && checkinDone === true) {
    score = 100;
    reason = "Humor positivo, coordenador Feliz e check-in realizado.";
    flags.push("positive_relationship_signal");
  } else if (stakeholderMood === "unknown") {
    flags.push("unknown_stakeholder_mood");
  }

  const cappedScore = applyRelationshipAbsenceCap(score, input, flags);
  if (cappedScore < score) {
    reason = `${reason} Cliente ausente em 2+ reuniões consecutivas, aplicando teto 40 na dimensão.`;
  }

  return details(cappedScore, reason, flags, missingData, evidenceRefs);
}

export function scoreTrafficOperation(input: TrafficOperationInput | undefined): ScoreDetails {
  const evidenceRefs = input?.evidenceRefs ?? [];
  const flags: string[] = [];
  const missingData: string[] = [];

  if (!input) {
    return details(0, "Dados de operação de tráfego ausentes.", ["missing_traffic_operation_signal"], ["missing_traffic_operation_signal"], evidenceRefs);
  }

  if (input.hasStructuredFunnel === false) {
    return details(0, "Funil não estruturado; dimensão zerada.", ["unstructured_funnel"], [], evidenceRefs);
  }

  let score = 0;

  if (input.hasStructuredFunnel === true) {
    score += 40;
  } else {
    flags.push("missing_structured_funnel");
    missingData.push("missing_structured_funnel");
  }

  if (input.kuriTrackingActive === true) {
    score += 40;
  } else if (input.kuriTrackingActive === false) {
    score -= 20;
    flags.push("tracking_inactive");
  } else {
    flags.push("missing_tracking_status");
    missingData.push("missing_tracking_status");
  }

  if (input.mediaBudgetMeetsMinimum === true) {
    score += 20;
  } else if (input.mediaBudgetMeetsMinimum === false) {
    score -= 20;
    flags.push("media_budget_below_minimum");
  } else {
    flags.push("missing_media_budget_status");
    missingData.push("missing_media_budget_status");
  }

  const clampedScore = clampScore(score);
  return details(clampedScore, "Pontuação calculada por funil, tracking e verba mínima.", flags, missingData, evidenceRefs);
}

export function scoreDelivery(input: DeliveryInput | undefined): ScoreDetails {
  const evidenceRefs = input?.evidenceRefs ?? [];

  if (!input) {
    return details(0, "Dados de entregas ausentes.", ["missing_delivery_signal"], ["missing_delivery_signal"], evidenceRefs);
  }

  const tasksTotal = input.tasksTotal ?? null;
  const tasksOnTime = input.tasksOnTime ?? null;
  const onTimeRate = input.onTimeRate ?? calculateRate(tasksOnTime, tasksTotal);

  if (tasksTotal === null || tasksOnTime === null || onTimeRate === null) {
    return details(0, "Dados insuficientes para calcular entregas no prazo.", ["missing_delivery_data"], ["missing_delivery_data"], evidenceRefs);
  }

  if (tasksTotal === 0) {
    return details(0, "Sem tasks registradas no período.", ["no_tasks_registered"], [], evidenceRefs);
  }

  if (onTimeRate >= 1) {
    return details(100, "100% das tasks entregues no prazo.", [], [], evidenceRefs);
  }

  if (onTimeRate >= 0.85) {
    return details(80, "85% a 99% das tasks entregues no prazo.", [], [], evidenceRefs);
  }

  if (onTimeRate >= 0.7) {
    return details(50, "70% a 84% das tasks entregues no prazo.", ["delivery_attention"], [], evidenceRefs);
  }

  return details(20, "Abaixo de 70% das tasks entregues no prazo.", ["delivery_below_70_percent"], [], evidenceRefs);
}

export function scoreNps(input: NpsInput | undefined): ScoreDetails {
  const evidenceRefs = input?.evidenceRefs ?? [];

  if (!input) {
    return details(45, "Sinal de NPS ausente; tratado como não resposta.", ["missing_nps_signal", "nps_not_responded"], ["missing_nps_signal"], evidenceRefs);
  }

  if (input.responded === false) {
    return details(45, "Cliente não respondeu ao NPS.", ["nps_not_responded"], [], evidenceRefs);
  }

  const npsScore = input.npsScore ?? null;
  if (npsScore === null) {
    return details(45, "NPS sem nota válida; tratado como não resposta.", ["missing_nps_score", "nps_not_responded"], ["missing_nps_score"], evidenceRefs);
  }

  if (npsScore >= 9) {
    if (input.commentSentiment === "negative") {
      return details(65, "NPS promotor com comentário negativo; sinal tratado com cautela.", ["nps_sentiment_conflict"], [], evidenceRefs);
    }

    return details(100, "NPS promotor.", ["nps_promoter"], [], evidenceRefs);
  }

  if (npsScore >= 7) {
    return details(65, "NPS neutro.", ["nps_neutral"], [], evidenceRefs);
  }

  if (input.commentSentiment === "negative") {
    return details(10, "NPS detrator com comentário negativo confirmado.", ["nps_detractor", "negative_nps_comment"], [], evidenceRefs);
  }

  return details(20, "NPS detrator.", ["nps_detractor"], [], evidenceRefs);
}

export function scoreFinancialHealth(input: FinancialInput | undefined): ScoreDetails {
  const evidenceRefs = input?.evidenceRefs ?? [];

  if (!input || input.overdueDays === undefined || input.overdueDays === null) {
    return details(0, "Dados financeiros ausentes.", ["missing_financial_signal"], ["missing_financial_signal"], evidenceRefs);
  }

  const overdueDays = input.overdueDays;
  if (input.isRecurringOverdue === true || overdueDays > 15) {
    return details(0, "Acima de 15 dias de atraso ou inadimplência recorrente.", ["financial_health_zero"], [], evidenceRefs);
  }

  if (overdueDays === 0) {
    return details(100, "Cliente em dia.", [], [], evidenceRefs);
  }

  if (overdueDays <= 2) {
    return details(80, "1 a 2 dias de atraso.", ["financial_minor_delay"], [], evidenceRefs);
  }

  if (overdueDays <= 7) {
    return details(50, "3 a 7 dias de atraso.", ["financial_delay_3_to_7_days"], [], evidenceRefs);
  }

  return details(25, "8 a 15 dias de atraso.", ["financial_delay_8_to_15_days"], [], evidenceRefs);
}

export function getFinancialCap(input: FinancialInput | undefined): FinancialCap {
  if (!input || input.overdueDays === undefined || input.overdueDays === null) {
    return {
      applied: false,
      value: null,
      reason: null
    };
  }

  const overdueDays = input.overdueDays;

  if (input.isRecurringOverdue === true || overdueDays > 45) {
    return {
      applied: true,
      value: 39,
      reason: "Acima de 45 dias ou inadimplência recorrente."
    };
  }

  if (overdueDays >= 21) {
    return {
      applied: true,
      value: 59,
      reason: "21 a 45 dias de atraso."
    };
  }

  if (overdueDays >= 8) {
    return {
      applied: true,
      value: 79,
      reason: "8 a 20 dias de atraso."
    };
  }

  return {
    applied: false,
    value: null,
    reason: null
  };
}

export function getStatus(score: number): HealthStatus {
  if (score >= 80) {
    return "Saudavel";
  }

  if (score >= 60) {
    return "Atencao";
  }

  if (score >= 40) {
    return "Risco";
  }

  return "Critico";
}

function toDimensionScore(dimension: DimensionId, detailsForDimension: ScoreDetails): DimensionScore {
  const weight = DIMENSION_WEIGHTS[dimension];
  const score = clampScore(detailsForDimension.score);

  return {
    dimension,
    name: DIMENSION_NAMES[dimension],
    score,
    weight,
    weightedScore: roundScore(score * weight),
    reason: detailsForDimension.reason,
    flags: unique(detailsForDimension.flags),
    evidenceRefs: unique(detailsForDimension.evidenceRefs)
  };
}

function details(score: number, reason: string, flags: string[], missingData: string[], evidenceRefs: string[]): ScoreDetails {
  return {
    score: clampScore(score),
    reason,
    flags: unique([...flags, ...missingData]),
    missingData: unique(missingData),
    evidenceRefs: unique(evidenceRefs)
  };
}

function applyRelationshipAbsenceCap(score: number, input: RelationshipInput, flags: string[]): number {
  if ((input.clientAbsencesConsecutive ?? 0) >= 2) {
    flags.push("client_absent_two_or_more_meetings");
    return Math.min(score, 40);
  }

  return score;
}

function calculateRate(numerator: number | null | undefined, denominator: number | null | undefined): number | null {
  if (numerator === null || numerator === undefined || denominator === null || denominator === undefined || denominator <= 0) {
    return null;
  }

  return numerator / denominator;
}

function clampScore(score: number): number {
  return Math.min(100, Math.max(0, score));
}

function roundScore(score: number): number {
  return Math.round(score * 100) / 100;
}

function unique(values: string[]): string[] {
  return [...new Set(values)].filter(Boolean);
}
