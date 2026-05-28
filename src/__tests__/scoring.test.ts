import { describe, expect, it } from "vitest";
import { healthscoreFixtures } from "../fixtures/healthscore-fixtures.js";
import {
  calculateHealthscore,
  getFinancialCap,
  getStatus,
  scoreDelivery,
  scoreFinancialHealth,
  scoreNps,
  scoreRelationship,
  scoreResultImpact,
  scoreTrafficOperation
} from "../healthscore/scoring.js";

describe("calculateHealthscore", () => {
  it("classifica a fixture saudável como Saudavel", () => {
    const fixture = healthscoreFixtures.find((item) => item.name === "conta-saudavel");
    expect(fixture).toBeDefined();

    const report = calculateHealthscore(fixture!.input, new Date("2026-05-27T12:00:00-03:00"));

    expect(report.finalScore).toBe(100);
    expect(report.status).toBe("Saudavel");
    expect(report.financialCap.applied).toBe(false);
  });

  it("classifica a fixture de atenção como Atencao", () => {
    const fixture = healthscoreFixtures.find((item) => item.name === "conta-atencao");
    expect(fixture).toBeDefined();

    const report = calculateHealthscore(fixture!.input, new Date("2026-05-27T12:00:00-03:00"));

    expect(report.finalScore).toBe(77);
    expect(report.status).toBe("Atencao");
    expect(report.flags).toContain("nps_not_responded");
    expect(report.missingData).toEqual([]);
  });

  it("classifica a fixture crítica como Critico e aplica trava financeira 39", () => {
    const fixture = healthscoreFixtures.find((item) => item.name === "conta-critica");
    expect(fixture).toBeDefined();

    const report = calculateHealthscore(fixture!.input, new Date("2026-05-27T12:00:00-03:00"));

    expect(report.status).toBe("Critico");
    expect(report.financialCap).toEqual({
      applied: true,
      value: 39,
      reason: "Acima de 45 dias ou inadimplência recorrente."
    });
  });
});

describe("dimension scoring rules", () => {
  it("pontua D1 por pacing", () => {
    expect(scoreResultImpact({ targetValue: 100, actualValue: 100, clientReported: true }).score).toBe(100);
    expect(scoreResultImpact({ targetValue: 100, actualValue: 85, clientReported: true }).score).toBe(75);
    expect(scoreResultImpact({ targetValue: 100, actualValue: 65, clientReported: true }).score).toBe(50);
    expect(scoreResultImpact({ targetValue: 100, actualValue: 50, clientReported: true }).score).toBe(25);
    expect(scoreResultImpact({ targetValue: 100, actualValue: null, clientReported: false }).score).toBe(10);
    expect(scoreResultImpact({ pacingRate: 0.95, clientReported: true }).score).toBe(75);
    expect(scoreResultImpact({ pacingRate: 1.1 }).score).toBe(100);
  });

  it("pontua D2 priorizando sinais de risco relacional", () => {
    expect(
      scoreRelationship({
        stakeholderMood: "positive",
        coordinatorMoodRating: "Feliz",
        monthlyCheckinDone: true,
        clientAbsencesConsecutive: 0
      }).score
    ).toBe(100);

    expect(
      scoreRelationship({
        stakeholderMood: "neutral",
        coordinatorMoodRating: "Neutro",
        monthlyCheckinDone: true,
        clientAbsencesConsecutive: 0
      }).score
    ).toBe(65);

    const negativeWithoutCoordinatorRating = scoreRelationship({
      stakeholderMood: "negative",
      coordinatorMoodRating: null,
      monthlyCheckinDone: true,
      clientAbsencesConsecutive: 0
    });

    expect(negativeWithoutCoordinatorRating.score).toBe(35);
    expect(negativeWithoutCoordinatorRating.flags).toContain("negative_relationship_signal");
    expect(negativeWithoutCoordinatorRating.missingData).toContain("missing_coordinator_mood_rating");

    expect(
      scoreRelationship({
        stakeholderMood: "neutral",
        coordinatorMoodRating: "Infeliz",
        monthlyCheckinDone: true,
        clientAbsencesConsecutive: 0
      }).score
    ).toBe(35);

    expect(
      scoreRelationship({
        stakeholderMood: "positive",
        coordinatorMoodRating: "Feliz",
        monthlyCheckinDone: true,
        clientAbsencesConsecutive: 2
      }).score
    ).toBe(40);

    expect(scoreRelationship({ monthlyCheckinDone: false, clientAbsencesConsecutive: 0 }).score).toBe(20);
  });

  it("pontua D3 por operação de tráfego", () => {
    expect(scoreTrafficOperation({ hasStructuredFunnel: true, kuriTrackingActive: true, mediaBudgetMeetsMinimum: true }).score).toBe(100);
    expect(scoreTrafficOperation({ hasStructuredFunnel: false, kuriTrackingActive: true, mediaBudgetMeetsMinimum: true }).score).toBe(0);
    expect(scoreTrafficOperation({ hasStructuredFunnel: true, kuriTrackingActive: false, mediaBudgetMeetsMinimum: false }).score).toBe(0);
  });

  it("pontua D4 por percentual de entregas no prazo", () => {
    expect(scoreDelivery({ tasksTotal: 10, tasksOnTime: 10 }).score).toBe(100);
    expect(scoreDelivery({ tasksTotal: 100, tasksOnTime: 85 }).score).toBe(80);
    expect(scoreDelivery({ tasksTotal: 100, tasksOnTime: 70 }).score).toBe(50);
    expect(scoreDelivery({ tasksTotal: 100, tasksOnTime: 69 }).score).toBe(20);
    expect(scoreDelivery({ tasksTotal: 0, tasksOnTime: 0 }).score).toBe(0);
  });

  it("pontua D5 por NPS", () => {
    expect(scoreNps({ responded: true, npsScore: 10, commentSentiment: "positive" }).score).toBe(100);
    expect(scoreNps({ responded: true, npsScore: 10 }).score).toBe(100);
    expect(scoreNps({ responded: true, npsScore: 10, commentSentiment: "negative" }).score).toBe(65);
    expect(scoreNps({ responded: true, npsScore: 8 }).score).toBe(65);
    expect(scoreNps({ responded: true, npsScore: 6 }).score).toBe(20);
    expect(scoreNps({ responded: true, npsScore: 4, commentSentiment: "negative" }).score).toBe(10);
    expect(scoreNps({ responded: false }).score).toBe(45);
  });

  it("pontua D6 e calcula travas financeiras", () => {
    expect(scoreFinancialHealth({ overdueDays: 0, isRecurringOverdue: false }).score).toBe(100);
    expect(scoreFinancialHealth({ overdueDays: 2, isRecurringOverdue: false }).score).toBe(80);
    expect(scoreFinancialHealth({ overdueDays: 7, isRecurringOverdue: false }).score).toBe(50);
    expect(scoreFinancialHealth({ overdueDays: 15, isRecurringOverdue: false }).score).toBe(25);
    expect(scoreFinancialHealth({ overdueDays: 16, isRecurringOverdue: false }).score).toBe(0);

    expect(getFinancialCap({ overdueDays: 7, isRecurringOverdue: false })).toEqual({ applied: false, value: null, reason: null });
    expect(getFinancialCap({ overdueDays: 8, isRecurringOverdue: false }).value).toBe(79);
    expect(getFinancialCap({ overdueDays: 21, isRecurringOverdue: false }).value).toBe(59);
    expect(getFinancialCap({ overdueDays: 46, isRecurringOverdue: false }).value).toBe(39);
    expect(getFinancialCap({ overdueDays: 0, isRecurringOverdue: true }).value).toBe(39);
  });

  it("mapeia status por faixa", () => {
    expect(getStatus(80)).toBe("Saudavel");
    expect(getStatus(79)).toBe("Atencao");
    expect(getStatus(60)).toBe("Atencao");
    expect(getStatus(59)).toBe("Risco");
    expect(getStatus(40)).toBe("Risco");
    expect(getStatus(39)).toBe("Critico");
  });

  it("aplica travas financeiras 79 e 59 sobre score bruto alto", () => {
    const healthyInput = healthscoreFixtures.find((item) => item.name === "conta-saudavel")!.input;

    const cappedAt79 = calculateHealthscore({
      ...healthyInput,
      financial: {
        overdueDays: 8,
        isRecurringOverdue: false
      }
    });

    expect(cappedAt79.rawScore).toBe(94);
    expect(cappedAt79.finalScore).toBe(79);
    expect(cappedAt79.status).toBe("Atencao");

    const cappedAt59 = calculateHealthscore({
      ...healthyInput,
      financial: {
        overdueDays: 21,
        isRecurringOverdue: false
      }
    });

    expect(cappedAt59.rawScore).toBe(92);
    expect(cappedAt59.finalScore).toBe(59);
    expect(cappedAt59.status).toBe("Risco");
  });

  it("propaga missingData de forma estruturada", () => {
    const report = calculateHealthscore({
      account: {
        accountId: "acc_missing",
        accountName: "Conta Missing",
        period: "2026-05",
        segment: "unknown"
      },
      period: "2026-05"
    });

    expect(report.missingData).toEqual([
      "missing_result_signal",
      "missing_relationship_signal",
      "missing_traffic_operation_signal",
      "missing_delivery_signal",
      "missing_nps_signal",
      "missing_financial_signal"
    ]);
    expect(report.dimensions.find((dimension) => dimension.dimension === "D1")?.missingData).toContain("missing_result_signal");
  });

  it("rejeita divergência entre account.period e period top-level", () => {
    expect(() =>
      calculateHealthscore({
        account: {
          accountId: "acc_period_mismatch",
          accountName: "Conta Período Divergente",
          period: "2026-04",
          segment: "unknown"
        },
        period: "2026-05"
      })
    ).toThrow("account.period must match the top-level period");
  });
});
