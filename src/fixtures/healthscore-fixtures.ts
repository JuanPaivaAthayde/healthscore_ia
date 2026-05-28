import type { HealthscoreInput, HealthStatus } from "../healthscore/types.js";

export type HealthscoreFixture = {
  name: string;
  expectedStatus: HealthStatus;
  input: HealthscoreInput;
};

export const healthscoreFixtures: HealthscoreFixture[] = [
  {
    name: "conta-saudavel",
    expectedStatus: "Saudavel",
    input: {
      account: {
        accountId: "acc_healthy",
        accountName: "Kuri Store",
        period: "2026-05",
        coordinatorId: "coord_001",
        coordinatorName: "Coordenador A",
        amId: "am_001",
        amName: "AM A",
        segment: "ecommerce",
        metadata: {
          ekyte_workspace_id: "1001"
        }
      },
      period: "2026-05",
      result: {
        targetMetric: "revenue",
        targetValue: 100000,
        actualValue: 112000,
        clientReported: true,
        evidenceRefs: ["kuri_insights:acc_healthy:2026-05"]
      },
      relationship: {
        stakeholderMood: "positive",
        coordinatorMoodRating: "Feliz",
        monthlyCheckinDone: true,
        clientAbsencesConsecutive: 0,
        evidenceRefs: ["meeting_transcript:acc_healthy:2026-05", "v4corp:acc_healthy:2026-05"]
      },
      trafficOperation: {
        hasStructuredFunnel: true,
        kuriTrackingActive: true,
        mediaBudgetMeetsMinimum: true,
        evidenceRefs: ["v4corp:acc_healthy:2026-05"]
      },
      delivery: {
        tasksTotal: 20,
        tasksOnTime: 20,
        tasksLate: 0,
        evidenceRefs: ["ekyte:acc_healthy:2026-05"]
      },
      nps: {
        responded: true,
        npsScore: 10,
        commentSentiment: "positive",
        sentimentConfidence: 0.9,
        evidenceRefs: ["nps:acc_healthy:2026-05"]
      },
      financial: {
        overdueDays: 0,
        isRecurringOverdue: false,
        evidenceRefs: ["financial:acc_healthy:2026-05"]
      }
    }
  },
  {
    name: "conta-atencao",
    expectedStatus: "Atencao",
    input: {
      account: {
        accountId: "acc_attention",
        accountName: "B2B Growth",
        period: "2026-05",
        coordinatorId: "coord_002",
        coordinatorName: "Coordenador B",
        amId: "am_002",
        amName: "AM B",
        segment: "b2b",
        metadata: {
          ekyte_workspace_id: "1002"
        }
      },
      period: "2026-05",
      result: {
        targetMetric: "qualified_pipeline",
        targetValue: 100,
        actualValue: 85,
        clientReported: true,
        evidenceRefs: ["kuri_insights:acc_attention:2026-05"]
      },
      relationship: {
        stakeholderMood: "neutral",
        coordinatorMoodRating: "Neutro",
        monthlyCheckinDone: true,
        clientAbsencesConsecutive: 0,
        evidenceRefs: ["meeting_transcript:acc_attention:2026-05", "v4corp:acc_attention:2026-05"]
      },
      trafficOperation: {
        hasStructuredFunnel: true,
        kuriTrackingActive: true,
        mediaBudgetMeetsMinimum: true,
        evidenceRefs: ["v4corp:acc_attention:2026-05"]
      },
      delivery: {
        tasksTotal: 10,
        tasksOnTime: 9,
        tasksLate: 1,
        evidenceRefs: ["ekyte:acc_attention:2026-05"]
      },
      nps: {
        responded: false,
        npsScore: null,
        commentSentiment: null,
        evidenceRefs: ["nps:acc_attention:2026-05"]
      },
      financial: {
        overdueDays: 0,
        isRecurringOverdue: false,
        evidenceRefs: ["financial:acc_attention:2026-05"]
      }
    }
  },
  {
    name: "conta-critica",
    expectedStatus: "Critico",
    input: {
      account: {
        accountId: "acc_critical",
        accountName: "Inside Sales Pro",
        period: "2026-05",
        coordinatorId: "coord_003",
        coordinatorName: "Coordenador C",
        amId: "am_003",
        amName: "AM C",
        segment: "inside_sales",
        metadata: {
          ekyte_workspace_id: "1003"
        }
      },
      period: "2026-05",
      result: {
        targetMetric: "revenue",
        targetValue: 100000,
        actualValue: 50000,
        clientReported: true,
        evidenceRefs: ["kuri_insights:acc_critical:2026-05"]
      },
      relationship: {
        stakeholderMood: "negative",
        coordinatorMoodRating: "Infeliz",
        monthlyCheckinDone: true,
        clientAbsencesConsecutive: 2,
        evidenceRefs: ["meeting_transcript:acc_critical:2026-05", "v4corp:acc_critical:2026-05"]
      },
      trafficOperation: {
        hasStructuredFunnel: false,
        kuriTrackingActive: false,
        mediaBudgetMeetsMinimum: false,
        evidenceRefs: ["v4corp:acc_critical:2026-05"]
      },
      delivery: {
        tasksTotal: 20,
        tasksOnTime: 5,
        tasksLate: 15,
        evidenceRefs: ["ekyte:acc_critical:2026-05"]
      },
      nps: {
        responded: true,
        npsScore: 4,
        commentSentiment: "negative",
        sentimentConfidence: 0.91,
        evidenceRefs: ["nps:acc_critical:2026-05"]
      },
      financial: {
        overdueDays: 51,
        isRecurringOverdue: true,
        evidenceRefs: ["financial:acc_critical:2026-05"]
      }
    }
  }
];

