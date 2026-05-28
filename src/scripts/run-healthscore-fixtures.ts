import { healthscoreFixtures } from "../fixtures/healthscore-fixtures.js";
import { calculateHealthscore } from "../healthscore/scoring.js";

const generatedAt = new Date("2026-05-27T12:00:00-03:00");

const reports = healthscoreFixtures.map((fixture) => {
  const report = calculateHealthscore(fixture.input, generatedAt);

  return {
    fixture: fixture.name,
    expectedStatus: fixture.expectedStatus,
    statusMatches: report.status === fixture.expectedStatus,
    accountId: report.accountId,
    accountName: report.accountName,
    period: report.period,
    rawScore: report.rawScore,
    finalScore: report.finalScore,
    status: report.status,
    financialCap: report.financialCap,
    flags: report.flags,
    dimensions: report.dimensions.map((dimension) => ({
      dimension: dimension.dimension,
      name: dimension.name,
      score: dimension.score,
      weightedScore: dimension.weightedScore,
      flags: dimension.flags,
      reason: dimension.reason
    }))
  };
});

console.log(JSON.stringify(reports, null, 2));

