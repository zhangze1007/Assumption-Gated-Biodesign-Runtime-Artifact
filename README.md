# Assumption-Gated BioDesign Runtime - Paper Artifact

This is the public research artifact for "Assumption-Gated BioDesign Runtime: A Provenance-Aware Architecture for Safer Cross-Tool Reasoning in Synthetic Biology Workbenches."

The artifact demonstrates a trust evaluation framework for biodesign computational tools. It includes:
- **Trust policy engine**: Evaluates tool outputs against trust policies based on validity, provenance, and evidence
- **Benchmark suite**: 74 representative test cases covering claim surfaces, validity tiers, and failure modes
- **Metrics**: Quantifies policy effectiveness across different scenarios

## Important Disclaimers

This artifact **does not**:
- Publish the full Nexus-Bio product
- Validate real-world biodesign workflows
- Provide wet-lab outcome guarantees
- Constitute regulatory certification
- Make third-party benchmark claims

See [docs/limitations.md](docs/limitations.md) for complete scope limitations.

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+ (for visualization)
- npm or similar package manager

### Installation and Quick Reproducibility

To install dependencies and reproduce the full artifact evaluation and figure generation:

```bash
git clone https://github.com/zhangze1007/Assumption-Gated-Biodesign-Runtime-Artifact.git
cd Assumption-Gated-Biodesign-Runtime-Artifact
npm install
python -m pip install -r requirements.txt
npm run reproduce
```

The `npm run reproduce` command will:
1. Build TypeScript
2. Run the complete benchmark suite (74 governance cases)
3. Generate quantitative metrics
4. Create Figure 6 visualization

**Output files:**
- `results/metrics_summary.json` - Quantitative metrics and analysis
- `results/figure6_data.csv` - Case-by-case evaluation results
- `figures/figure6.png` - PNG format visualization
- `figures/figure6.pdf` - PDF format visualization

**Advanced commands** (optional if you want to run steps separately):

```bash
npm run build      # Build TypeScript only
npm run bench      # Run benchmark only
npm run genplot    # Generate visualization only
```

## Project Structure

```
src/
  types.ts                    # Core type definitions
  trustPolicyEngine.ts        # Trust policy evaluation engine
  policyDslEvaluator.ts       # Policy DSL document evaluator
  trustMetricsReport.ts       # Benchmark metrics and analysis
schema/
  policy-dsl-v1.md           # Policy DSL specification
  policy-dsl.schema.json     # JSON Schema for policies
  trust-runtime-case.schema.json # Schema for test cases
data/
  governance_cases_74.json   # 74 test cases
  expected_labels.csv        # Expected outcomes for each case
policy/
  trust-policy-v1.json       # Example trust policy configuration
scripts/
  run_benchmark.ts           # Benchmark execution script
  generate_figure6.py        # Visualization generation script
docs/
  artifact_scope.md          # What this artifact covers
  limitations.md             # Documented limitations
results/
  metrics_summary.json       # Generated benchmark results
  figure6_data.csv          # Generated evaluation data
figures/
  figure6.png              # Generated visualization (PNG)
  figure6.pdf              # Generated visualization (PDF)
```

## Key Concepts

### Validity Tiers
- **real**: Validated outputs with evidence
- **partial**: Partially validated or uncertain outputs
- **demo**: Demonstration or exploratory outputs (most restrictive)

### Claim Surfaces
Where tool outputs are consumed:
- **payload**: Workbench display (least restrictive)
- **export**: File export for downstream consumption
- **recommendation**: Actionable recommendations
- **protocol**: Formal protocol specifications
- **external-handoff**: Third-party handoff (most restrictive)

### Gate Statuses
- **ok**: Output allowed for surface
- **blocked**: Output blocked; cannot be used
- **gated**: Output requires human approval
- **demoOnly**: Output allowed only for demonstration

## Benchmark Results

The artifact evaluates policy decisions across 74 test cases covering:
- **11** truthful-partial outputs (should pass with high confidence)
- **9** unsafe-demo outputs (should block on formal surfaces)
- **16** missing-evidence outputs (should block due to insufficient evidence)
- **9** uncertainty-unresolved outputs (should require human gates)
- **12** human-gate-required outputs (require approval for formal surfaces)
- **9** known-bad cases (should be blocked/caught)
- **8** draft outputs (should block export)

**Policy Engine Effectiveness:**
- Block rate: 52.7% (39/74 cases)
- Gate rate: 28.4% (21/74 cases requiring human review)
- Demo-only rate: 5.4% (4/74 restricted to demonstration)
- Unsafe export prevention: 100%
- Demo leakage prevention: 100%
- False block rate: 0%
- Known-bad coverage: 100%
- Mismatch count: 0

See `results/metrics_summary.json` for detailed quantitative results.

## Usage Example

```typescript
import { evaluateClaimSurfacePolicy } from './src/trustPolicyEngine.js';

const decision = evaluateClaimSurfacePolicy({
  toolId: 'fbasim',
  surface: 'export',
  validityTier: 'partial',
  isDraft: false,
  provenanceIds: ['case123:provenance'],
  requiresHumanGate: false,
  humanGateStatus: 'not-required'
});

console.log(decision.status);      // 'ok'
console.log(decision.reason);      // 'fbasim output satisfies the export claim-surface policy.'
```

## Policy DSL

Create custom policies using the Policy DSL:

```json
{
  "schemaVersion": "policy-dsl-v1",
  "policyId": "custom-policy",
  "description": "Custom trust policy",
  "rules": [
    {
      "ruleId": "demo-block",
      "description": "Block demo outputs on formal surfaces",
      "priority": 0,
      "when": [
        { "field": "validityTier", "operator": "equals", "value": "demo" },
        { "field": "surface", "operator": "notEquals", "value": "payload" }
      ],
      "effect": "block",
      "blockCode": "DEMO_OUTPUT_BLOCKED",
      "reason": "Demo outputs cannot be used on formal claim surfaces"
    }
  ],
  "defaultDecision": {
    "effect": "block",
    "blockCode": "MISSING_POLICY",
    "reason": "No matching policy found"
  }
}
```

## Contributing

This is a research artifact. For questions about the research methodology or results, please refer to the associated paper.

## Citation

```bibtex
@misc{foo2026assumption_gated_biodesign_runtime_artifact,
  title={Assumption-Gated BioDesign Runtime: Governance Cases, Policy DSL, and Gate Evaluation Artifact},
  author={Foo, Zhang Ze},
  year={2026},
  month={may},
  note={Public paper artifact},
  url={https://github.com/zhangze1007/Assumption-Gated-Biodesign-Runtime-Artifact}
}
```

See [CITATION.cff](CITATION.cff) for detailed citation information in CFF format.

## License

This artifact is released under the MIT License. See [LICENSE](LICENSE) for full details.

---

**For artifact evaluation details, see [docs/artifact_scope.md](docs/artifact_scope.md).**