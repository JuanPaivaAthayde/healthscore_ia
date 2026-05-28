import { describe, expect, it } from "vitest";
import { healthscoreFixtures } from "../fixtures/healthscore-fixtures.js";
import {
  calculateHealthscore,
  getFinancialCap,
  getStatus,
  scoreDelivery,
  scoreFinancialHealth,
  scoreNps,
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
    expect(getStatus(60)).toBe("Atencao");
    expect(getStatus(40)).toBe("Risco");
    expect(getStatus(39)).toBe("Critico");
  });
});

