import { z } from "zod";

export const healthStatusSchema = z.enum(["Saudavel", "Atencao", "Risco", "Critico", "Incompleto"]);
export const dimensionIdSchema = z.enum(["D1", "D2", "D3", "D4", "D5", "D6"]);
export const accountSegmentSchema = z.enum(["ecommerce", "inside_sales", "b2b", "institutional", "unknown"]);

export const accountInputSchema = z.object({
  accountId: z.string().min(1),
  accountName: z.string().min(1),
  period: z.string().regex(/^\d{4}-\d{2}$/),
  coordinatorId: z.string().optional(),
  coordinatorName: z.string().optional(),
  amId: z.string().optional(),
  amName: z.string().optional(),
  segment: accountSegmentSchema,
  metadata: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional()
});

export const resultImpactInputSchema = z.object({
  targetMetric: z.string().optional(),
  targetValue: z.number().nonnegative().nullable().optional(),
  actualValue: z.number().nonnegative().nullable().optional(),
  pacingRate: z.number().nonnegative().nullable().optional(),
  clientReported: z.boolean().nullable().optional(),
  evidenceRefs: z.array(z.string()).optional()
});

export const relationshipInputSchema = z.object({
  stakeholderMood: z.enum(["positive", "neutral", "negative", "unknown"]).nullable().optional(),
  coordinatorMoodRating: z.enum(["Feliz", "Neutro", "Infeliz"]).nullable().optional(),
  monthlyCheckinDone: z.boolean().nullable().optional(),
  clientAbsencesConsecutive: z.number().int().nonnegative().nullable().optional(),
  evidenceRefs: z.array(z.string()).optional()
});

export const trafficOperationInputSchema = z.object({
  hasStructuredFunnel: z.boolean().nullable().optional(),
  kuriTrackingActive: z.boolean().nullable().optional(),
  mediaBudgetMeetsMinimum: z.boolean().nullable().optional(),
  evidenceRefs: z.array(z.string()).optional()
});

export const deliveryInputSchema = z.object({
  tasksTotal: z.number().int().nonnegative().nullable().optional(),
  tasksOnTime: z.number().int().nonnegative().nullable().optional(),
  tasksLate: z.number().int().nonnegative().nullable().optional(),
  onTimeRate: z.number().min(0).max(1).nullable().optional(),
  evidenceRefs: z.array(z.string()).optional()
});

export const npsInputSchema = z.object({
  responded: z.boolean().nullable().optional(),
  npsScore: z.number().int().min(0).max(10).nullable().optional(),
  commentSentiment: z.enum(["positive", "neutral", "negative", "unknown"]).nullable().optional(),
  sentimentConfidence: z.number().min(0).max(1).nullable().optional(),
  evidenceRefs: z.array(z.string()).optional()
});

export const financialInputSchema = z.object({
  overdueDays: z.number().int().nonnegative().nullable().optional(),
  isRecurringOverdue: z.boolean().nullable().optional(),
  evidenceRefs: z.array(z.string()).optional()
});

export const healthscoreInputSchema = z.object({
  account: accountInputSchema,
  period: z.string().regex(/^\d{4}-\d{2}$/),
  result: resultImpactInputSchema.optional(),
  relationship: relationshipInputSchema.optional(),
  trafficOperation: trafficOperationInputSchema.optional(),
  delivery: deliveryInputSchema.optional(),
  nps: npsInputSchema.optional(),
  financial: financialInputSchema.optional()
});

export const dimensionScoreSchema = z.object({
  dimension: dimensionIdSchema,
  name: z.string(),
  score: z.number().min(0).max(100),
  weight: z.number().min(0).max(1),
  weightedScore: z.number(),
  reason: z.string(),
  flags: z.array(z.string()),
  evidenceRefs: z.array(z.string())
});

export const finalHealthscoreReportSchema = z.object({
  accountId: z.string(),
  accountName: z.string(),
  period: z.string().regex(/^\d{4}-\d{2}$/),
  rawScore: z.number(),
  finalScore: z.number().int().min(0).max(100),
  status: healthStatusSchema,
  financialCap: z.object({
    applied: z.boolean(),
    value: z.number().int().min(0).max(100).nullable(),
    reason: z.string().nullable()
  }),
  dimensions: z.array(dimensionScoreSchema),
  flags: z.array(z.string()),
  missingData: z.array(z.string()),
  generatedAt: z.string()
});

