# Assumption-Gated BioDesign Runtime - Paper Artifact

This is the public research artifact for "Assumption-Gated BioDesign Runtime: A Policy Framework for Trust-Aware Biodesign Tool Integration."

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

### Installation

```bash
git clone https://github.com/zhangze1007/Assumption-Gated-Biodesign-Runtime-Artifact.git
cd Assumption-Gated-Biodesign-Runtime-Artifact
npm install
```

### Build TypeScript

```bash
npm run build
```

### Run Benchmark

```bash
npm run bench
```

This evaluates all 74 governance cases against the trust policy engine and generates:
- `results/metrics_summary.json` - Quantitative metrics and analysis
- `results/figure6_data.csv` - Case-by-case evaluation results

### Generate Visualization

```bash
pip install matplotlib numpy
npm run genplot
```

This generates Figure 6 visualization:
- `figures/figure6.png` - PNG format
- `figures/figure6.pdf` - PDF format

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
- **8** truthful partial outputs (should pass)
- **3** demo-only outputs (should pass payload only)
- **16** unsafe demo outputs (should fail on formal surfaces)
- **16** missing-evidence outputs (should block)
- **16** human-gate-required outputs (should require approval)
- **8** known-bad cases (should be caught)
- **8** draft outputs (should block export)

### Representative Findings

The trust policy engine correctly:
- Prevents demo outputs from leaking to formal surfaces
- Enforces provenance requirements for formal surfaces
- Gates outputs requiring human review
- Catches known-bad patterns

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
@misc{assumption-gated-biodesign-runtime,
  title={Assumption-Gated BioDesign Runtime: A Policy Framework for Trust-Aware Biodesign Tool Integration},
  author={Zhang, Ze and others},
  year={2024},
  note={Research Artifact}
}
```

See [CITATION.cff](CITATION.cff) for detailed citation information.

## License

This artifact is released under the MIT License. See [LICENSE](LICENSE) for full details.

---

**For artifact evaluation details, see [docs/artifact_scope.md](docs/artifact_scope.md).**