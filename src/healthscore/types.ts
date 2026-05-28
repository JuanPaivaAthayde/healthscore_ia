import type { z } from "zod";
import type {
  accountInputSchema,
  accountSegmentSchema,
  deliveryInputSchema,
  dimensionIdSchema,
  dimensionScoreSchema,
  finalHealthscoreReportSchema,
  financialInputSchema,
  healthscoreInputSchema,
  healthStatusSchema,
  npsInputSchema,
  relationshipInputSchema,
  resultImpactInputSchema,
  trafficOperationInputSchema
} from "./schemas.js";

export type HealthStatus = z.infer<typeof healthStatusSchema>;

export type DimensionId = z.infer<typeof dimensionIdSchema>;

export type SourceName =
  | "kuri_insights"
  | "v4corp"
  | "ekyte"
  | "nps"
  | "financial"
  | "meeting_transcript"
  | "pic_future";

export type AccountSegment = z.infer<typeof accountSegmentSchema>;

export type AccountInput = z.infer<typeof accountInputSchema>;

export type Evidence = {
  externalId: string;
  url?: string;
  notes: string;
};

export type DimensionScore = z.infer<typeof dimensionScoreSchema>;

export type ResultImpactInput = z.infer<typeof resultImpactInputSchema>;

export type RelationshipInput = z.infer<typeof relationshipInputSchema>;

export type TrafficOperationInput = z.infer<typeof trafficOperationInputSchema>;

export type DeliveryInput = z.infer<typeof deliveryInputSchema>;

export type NpsInput = z.infer<typeof npsInputSchema>;

export type FinancialInput = z.infer<typeof financialInputSchema>;

export type HealthscoreInput = z.infer<typeof healthscoreInputSchema>;

export type FinancialCap = z.infer<typeof finalHealthscoreReportSchema>["financialCap"];

export type FinalHealthscoreReport = z.infer<typeof finalHealthscoreReportSchema>;
