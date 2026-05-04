/**
 * Core types for Assumption-Gated BioDesign Runtime artifact
 * These types define the trust evaluation framework for biodesign tools
 */

// ===== Validity Tiers =====
export const VALIDITY_TIERS = ['real', 'partial', 'demo'] as const;
export type ValidityTier = (typeof VALIDITY_TIERS)[number];

// ===== Claim Surfaces =====
// Claim surfaces represent different output categories for biodesign tool results
export const CLAIM_SURFACES = [
  'payload',
  'export',
  'recommendation',
  'protocol',
  'external-handoff',
] as const;
export type ClaimSurface = (typeof CLAIM_SURFACES)[number];

// ===== Gate Statuses =====
// Gate status indicates the trust evaluation outcome for a claim
export const GATE_STATUSES = ['ok', 'blocked', 'gated', 'demoOnly'] as const;
export type GateStatus = (typeof GATE_STATUSES)[number];

// ===== Assumption & Evidence Types =====
export type AssumptionStatus = 'active' | 'resolved' | 'violated' | 'unknown';

export type EvidenceType =
  | 'literature'
  | 'dataset'
  | 'user-input'
  | 'simulation'
  | 'experiment'
  | 'manual-review';

export type ProvenanceActivityType = 'tool-run' | 'human-gate' | 'export' | 'import' | 'review';

export type ViolationSeverity = 'warning' | 'blocking';

export type GateOverridePath = 'human-review' | 'not-allowed';

// ===== Core Domain Interfaces =====

export interface ToolAssumption {
  assumptionId: string;
  toolId: string;
  statement: string;
  validityTier: ValidityTier;
  status: AssumptionStatus;
  knownLimitations: string[];
  evidenceIds: string[];
}

export interface Evidence {
  evidenceId: string;
  evidenceType: EvidenceType;
  title: string;
  source?: string;
  doi?: string;
  url?: string;
  notes?: string;
}

export interface ProvenanceEntry {
  provenanceId: string;
  toolId: string;
  activityType: ProvenanceActivityType;
  surface?: ClaimSurface;
  startedAt: string;
  completedAt?: string;
  inputAssumptionIds: string[];
  outputAssumptionIds: string[];
  evidenceIds: string[];
  upstreamProvenanceIds: string[];
  actor?: string;
}

export interface AssumptionViolation {
  violationId: string;
  assumptionId: string;
  detectedAt: string;
  severity: ViolationSeverity;
  message: string;
  affectedSurfaces: ClaimSurface[];
}

export interface WorkflowContract {
  contractId: string;
  fromToolId: string;
  toToolId?: string;
  allowedSurfaces: ClaimSurface[];
  minimumValidityTier: ValidityTier;
  requiresProvenance: boolean;
  requiresHumanGate?: boolean;
}

export interface GateDecision {
  status: GateStatus;
  blockCode?: string;
  reason: string;
  allowedSurfaces: ClaimSurface[];
  blockedSurfaces: ClaimSurface[];
  overridePath?: GateOverridePath;
}

// ===== Policy DSL Types =====

export const POLICY_DSL_SCHEMA_VERSION = 'policy-dsl-v1' as const;
export type PolicyDslVersion = typeof POLICY_DSL_SCHEMA_VERSION;

export const POLICY_DSL_EFFECTS = [
  'allow',
  'block',
  'gate',
  'demoOnly',
] as const;
export type PolicyDslEffect = (typeof POLICY_DSL_EFFECTS)[number];

export const POLICY_DSL_OPERATORS = [
  'equals',
  'notEquals',
  'in',
  'notIn',
  'exists',
  'empty',
  'notEmpty',
] as const;
export type PolicyDslOperator = (typeof POLICY_DSL_OPERATORS)[number];

export const POLICY_DSL_CONDITION_FIELDS = [
  'toolId',
  'surface',
  'validityTier',
  'isDraft',
  'provenanceIds',
  'evidenceIds',
  'assumptionIds',
  'requiresHumanGate',
  'humanGateStatus',
] as const;
export type PolicyDslConditionField = (typeof POLICY_DSL_CONDITION_FIELDS)[number];

export type PolicyDslConditionValue = string | boolean | string[];

export interface PolicyDslCondition {
  field: PolicyDslConditionField;
  operator: PolicyDslOperator;
  value?: PolicyDslConditionValue;
}

export interface PolicyDslRule {
  ruleId: string;
  description: string;
  priority: number;
  when: PolicyDslCondition[];
  effect: PolicyDslEffect;
  blockCode?: string;
  reason: string;
  overridePath?: GateOverridePath;
}

export interface PolicyDslDocument {
  schemaVersion: PolicyDslVersion;
  policyId: string;
  description: string;
  rules: PolicyDslRule[];
  defaultDecision: {
    effect: 'block';
    blockCode: 'MISSING_POLICY' | string;
    reason: string;
  };
}

// ===== Trust Metrics Benchmark Types =====

export type TrustMetricStatus = GateStatus;

export type HumanGateStatus = 'not-required' | 'pending' | 'approved' | 'rejected';

export type TrustBenchmarkHumanGateStatus = HumanGateStatus | undefined;

export interface TrustBenchmarkInput {
  validityTier: ValidityTier;
  hasProvenance: boolean;
  evidenceState: 'present' | 'missing' | 'not-required';
  uncertaintyState: 'bounded' | 'unresolved' | 'not-applicable';
  isDraft: boolean;
  humanGateRequired: boolean;
  humanGateSatisfied: boolean;
  humanGateStatus?: TrustBenchmarkHumanGateStatus;
  notes: string;
}

export interface TrustBenchmarkExpected {
  status: TrustMetricStatus;
  blockCode: string | null;
  rationale: string;
}

export interface TrustBenchmarkMetricCase {
  caseId: string;
  title: string;
  category: string;
  toolId: string;
  surface: ClaimSurface;
  claim: string;
  input: TrustBenchmarkInput;
  expected: TrustBenchmarkExpected;
  riskTags: string[];
  knownBad: boolean;
}

export interface TrustBenchmarkCaseFile {
  cases: TrustBenchmarkMetricCase[];
}

export interface TrustBenchmarkExpectedLabel {
  caseId: string;
  expectedStatus: TrustMetricStatus;
  expectedBlockCode: string | null;
  category: string;
  toolId: string;
  surface: ClaimSurface;
  knownBad: boolean;
}

export interface TrustMetricCounts {
  totalCases: number;
  ok: number;
  blocked: number;
  gated: number;
  demoOnly: number;
}

export interface TrustMetricMismatch {
  caseId: string;
  category: string;
  toolId: string;
  surface: ClaimSurface;
  expectedStatus: TrustMetricStatus;
  actualStatus: TrustMetricStatus;
  expectedBlockCode?: string;
  actualBlockCode?: string;
  reason: string;
}

export interface KnownBadCoverage {
  requiredTags: string[];
  representedTags: (string | undefined)[];
  missingTags: (string | undefined)[];
}

export interface KnownBadSummary {
  totalKnownBadCases: number;
  preventedKnownBadCases: number;
  leakedKnownBadCases: number;
}

export interface ProgressionSummary {
  expectedOkCases: number;
  successfulProgressions: number;
  falseBlockedCases: number;
}

export interface PreventionSummary {
  unsafeFormalSurfaceCases: number;
  preventedUnsafeFormalSurfaceCases: number;
  leakedUnsafeFormalSurfaceCases: number;
}

export interface MissingProvenanceSummary {
  detectedCases: number;
  provenanceRequiredBlocks: number;
}

export interface TrustFalsificationMetrics {
  schemaVersion: 'trust-metrics-v1';
  generatedAt: string;
  runLabel: string;
  reportScope: 'local-trust-runtime-benchmark';
  corpusVersion?: string;
  totalCases: number;
  statusCounts: TrustMetricCounts;
  blockRate: number;
  gateRate: number;
  demoOnlyRate: number;
  missingProvenanceRate: number;
  unsafeExportPreventionRate: number;
  demoLeakageRate: number;
  falseBlockRate: number;
  knownBadCoverageRate: number;
  mismatches: TrustMetricMismatch[];
  categoryBreakdown: Record<string, TrustMetricCounts>;
  surfaceBreakdown: Record<string, TrustMetricCounts>;
  knownBadSummary: KnownBadSummary;
  knownBadCoverage: KnownBadCoverage;
  progressionSummary: ProgressionSummary;
  preventionSummary: PreventionSummary;
  missingProvenanceSummary: MissingProvenanceSummary;
  limitations: readonly string[];
}

export interface TrustMetricsHistoryEntry {
  generatedAt: string;
  runLabel: string;
  corpusVersion?: string;
  totalCases: number;
  blockRate: number;
  falseBlockRate: number;
  unsafeExportPreventionRate: number;
  demoLeakageRate: number;
  missingProvenanceRate: number;
  mismatchCount: number;
}
