/**
 * Trust Policy Engine for Assumption-Gated BioDesign Runtime
 * Evaluates claim surfaces against trust policies
 */

import type {
  ClaimSurface,
  GateDecision,
  GateOverridePath,
  GateStatus,
  ValidityTier,
} from './types';

export type HumanGateStatus = 'not-required' | 'pending' | 'approved' | 'rejected';

export interface EvaluateClaimSurfacePolicyInput {
  toolId: string;
  surface: ClaimSurface;
  validityTier?: ValidityTier;
  isDraft?: boolean;
  provenanceIds?: string[];
  evidenceIds?: string[];
  assumptionIds?: string[];
  requiresHumanGate?: boolean;
  humanGateStatus?: HumanGateStatus;
}

export type ClaimSurfaceBlockCode =
  | 'MISSING_POLICY'
  | 'TIER_NOT_ALLOWED_FOR_SURFACE'
  | 'DRAFT_OUTPUT_NOT_EXPORTABLE'
  | 'DEMO_OUTPUT_PROTOCOL_BLOCKED'
  | 'EXTERNAL_HANDOFF_BLOCKED'
  | 'PROVENANCE_REQUIRED'
  | 'HUMAN_GATE_REQUIRED';

interface ClaimSurfacePolicy {
  toolId: string;
  surface: ClaimSurface;
  allowedTiers: ValidityTier[];
  denyIfDraft: boolean;
  requiresProvenance: boolean;
  requiresHumanGate: boolean;
}

/**
 * Default claim surface policies for representative biodesign tools.
 * These represent artifact assumptions and are not based on real tool validation.
 */
const DEFAULT_POLICIES: ClaimSurfacePolicy[] = [
  // Payload surface: least restrictive, accepts demo
  { toolId: '*', surface: 'payload', allowedTiers: ['real', 'partial', 'demo'], denyIfDraft: false, requiresProvenance: false, requiresHumanGate: false },

  // Export surface: medium restrictive, blocks demo
  { toolId: '*', surface: 'export', allowedTiers: ['real', 'partial'], denyIfDraft: true, requiresProvenance: true, requiresHumanGate: false },

  // Recommendation surface: restrictive, requires real validity
  { toolId: '*', surface: 'recommendation', allowedTiers: ['real', 'partial'], denyIfDraft: true, requiresProvenance: true, requiresHumanGate: false },

  // Protocol surface: very restrictive for formal workflows
  { toolId: '*', surface: 'protocol', allowedTiers: ['real', 'partial'], denyIfDraft: true, requiresProvenance: true, requiresHumanGate: true },

  // External handoff: most restrictive for third-party use
  { toolId: '*', surface: 'external-handoff', allowedTiers: ['real', 'partial'], denyIfDraft: true, requiresProvenance: true, requiresHumanGate: true },
];

/**
 * Retrieve claim surface policy for a tool and surface combination.
 * Returns default policy matching the surface, or undefined if no policy exists.
 */
function getClaimSurfacePolicy(
  toolId: string,
  surface: ClaimSurface,
): ClaimSurfacePolicy | undefined {
  // Try tool-specific policy first, then wildcard
  const specific = DEFAULT_POLICIES.find((p) => p.toolId === toolId && p.surface === surface);
  if (specific) return specific;

  return DEFAULT_POLICIES.find((p) => p.toolId === '*' && p.surface === surface);
}

interface DecisionArgs {
  status: GateStatus;
  surface: ClaimSurface;
  reason: string;
  blockCode?: ClaimSurfaceBlockCode;
  overridePath?: GateOverridePath;
}

function hasItems(items: string[] | undefined): boolean {
  return Array.isArray(items) && items.length > 0;
}

function decision(args: DecisionArgs): GateDecision {
  const surfaceList = [args.surface];
  const isAllowed = args.status === 'ok' || args.status === 'demoOnly';

  return {
    status: args.status,
    ...(args.blockCode ? { blockCode: args.blockCode } : {}),
    reason: args.reason,
    allowedSurfaces: isAllowed ? surfaceList : [],
    blockedSurfaces: isAllowed ? [] : surfaceList,
    ...(args.overridePath ? { overridePath: args.overridePath } : {}),
  };
}

function tierBlockCode(
  validityTier: ValidityTier,
  surface: ClaimSurface,
): ClaimSurfaceBlockCode {
  if (validityTier === 'demo' && surface === 'protocol') return 'DEMO_OUTPUT_PROTOCOL_BLOCKED';
  if (validityTier === 'demo' && surface === 'external-handoff') return 'EXTERNAL_HANDOFF_BLOCKED';
  return 'TIER_NOT_ALLOWED_FOR_SURFACE';
}

/**
 * Evaluate a claim surface output against the trust policy for a given tool.
 * This is the main evaluation entry point for the artifact.
 */
export function evaluateClaimSurfacePolicy(
  input: EvaluateClaimSurfacePolicyInput,
): GateDecision {
  const policy = getClaimSurfacePolicy(input.toolId, input.surface);

  if (!policy) {
    return decision({
      status: 'blocked',
      surface: input.surface,
      blockCode: 'MISSING_POLICY',
      reason: `No claim-surface policy is defined for ${input.toolId} on ${input.surface}.`,
      overridePath: 'not-allowed',
    });
  }

  if (!input.validityTier) {
    return decision({
      status: 'blocked',
      surface: input.surface,
      blockCode: 'TIER_NOT_ALLOWED_FOR_SURFACE',
      reason:
        `A validity tier is required before ${input.toolId} output can be evaluated for ${input.surface}.`,
      overridePath: 'not-allowed',
    });
  }

  if (input.isDraft === true && policy.denyIfDraft === true) {
    return decision({
      status: 'blocked',
      surface: input.surface,
      blockCode: 'DRAFT_OUTPUT_NOT_EXPORTABLE',
      reason:
        `${input.toolId} output is still draft and ${input.surface} requires a finalized artifact.`,
      overridePath: 'human-review',
    });
  }

  if (!policy.allowedTiers.includes(input.validityTier)) {
    const blockCode = tierBlockCode(input.validityTier, input.surface);
    return decision({
      status: 'blocked',
      surface: input.surface,
      blockCode,
      reason:
        `${input.validityTier} output from ${input.toolId} is not allowed on ${input.surface}.`,
      overridePath: 'not-allowed',
    });
  }

  if (policy.requiresProvenance && !hasItems(input.provenanceIds)) {
    return decision({
      status: 'blocked',
      surface: input.surface,
      blockCode: 'PROVENANCE_REQUIRED',
      reason:
        `${input.surface} consumption for ${input.toolId} requires provenance before the claim can be used.`,
      overridePath: 'human-review',
    });
  }

  const humanGateRequired = policy.requiresHumanGate === true || input.requiresHumanGate === true;
  const humanGateStatus = input.humanGateStatus ?? (humanGateRequired ? 'pending' : 'not-required');

  if (humanGateRequired && humanGateStatus !== 'approved') {
    if (humanGateStatus === 'rejected') {
      return decision({
        status: 'blocked',
        surface: input.surface,
        blockCode: 'HUMAN_GATE_REQUIRED',
        reason:
          `Human review rejected ${input.toolId} output for ${input.surface}.`,
        overridePath: 'not-allowed',
      });
    }

    return decision({
      status: 'gated',
      surface: input.surface,
      blockCode: 'HUMAN_GATE_REQUIRED',
      reason:
        `${input.surface} consumption for ${input.toolId} requires approved human review.`,
      overridePath: 'human-review',
    });
  }

  if (input.validityTier === 'demo') {
    return decision({
      status: 'demoOnly',
      surface: input.surface,
      reason:
        `${input.toolId} output is allowed on ${input.surface} only as demo or exploratory context.`,
    });
  }

  return decision({
    status: 'ok',
    surface: input.surface,
    reason:
      `${input.toolId} output satisfies the ${input.surface} claim-surface policy.`,
  });
}
