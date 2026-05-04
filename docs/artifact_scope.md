# Artifact Scope and Evaluation

## What This Artifact Is

This artifact is a **research prototype** demonstrating a trust evaluation framework for biodesign tool integration. It includes:

1. **Trust Policy Engine** - A runtime that evaluates biodesign tool outputs against trust policies
2. **Policy DSL** - A domain-specific language for defining trust policies
3. **Benchmark Suite** - 74 representative test cases covering different trust scenarios
4. **Evaluation Metrics** - Quantitative analysis of policy effectiveness

## What This Artifact Is Not

This artifact is **NOT**:
- A production system or deployment artifact
- The full Nexus-Bio product
- Third-party validated or certified
- Regulatory approval or safety certification
- Real-world biodesign workflow validation
- Industry benchmark or standard

## Artifact Contents

### Source Code (TypeScript)

- **types.ts** - Core type definitions for the trust framework
- **trustPolicyEngine.ts** - Primary trust evaluation logic with default claims-surface policies
- **policyDslEvaluator.ts** - Evaluates policies defined in the Policy DSL
- **trustMetricsReport.ts** - Benchmark analysis and metric computation

### Benchmark Data

- **governance_cases_74.json** - 74 test cases covering representative scenarios:
  - 8 truthful partial outputs (should pass)
  - 3 demo-only outputs (payload-only)
  - 16 unsafe demo outputs on formal surfaces
  - 16 missing-provenance cases
  - 16 human-gate-required cases
  - 8 known-bad cases that should be caught
  - 8 draft output cases

- **expected_labels.csv** - Expected outcomes for each test case

### Schemas

- **policy-dsl.schema.json** - JSON Schema for Policy DSL documents
- **trust-runtime-case.schema.json** - JSON Schema for benchmark cases
- **policy-dsl-v1.md** - Policy DSL specification document

### Scripts

- **run_benchmark.ts** - Evaluates all 74 cases and generates metrics
- **generate_figure6.py** - Creates visualization of results

## How to Evaluate

### 1. Verify Implementation

```bash
# Build TypeScript
npm install
npm run build

# Inspect compiled output
ls -la dist/
```

### 2. Run Benchmark

```bash
npm run bench
```

This will:
- Load 74 governance cases from `data/governance_cases_74.json`
- Load expected outcomes from `data/expected_labels.csv`
- Evaluate each case against the trust policy engine
- Produce `results/metrics_summary.json` with:
  - Total cases and status distribution
  - Block/gate/demo rates
  - False positive/negative analysis
  - Known-bad case prevention metrics

### 3. Generate Figures

```bash
npm run genplot
```

This generates Figure 6 visualization showing:
- Accuracy by claim surface
- Overall evaluation statistics
- Status transition distribution
- Mismatch analysis

### 4. Inspect Results

```bash
cat results/metrics_summary.json
cat results/figure6_data.csv
```

## Key Metrics

The artifact provides the following evaluation metrics:

| Metric | Description | Interpretation |
|--------|-------------|-----------------|
| Block Rate | Fraction of cases blocked | Should increase for unsafe cases |
| Gate Rate | Fraction requiring human approval | Reflects decision uncertainty |
| False Block Rate | Blocks when case should pass | Should be low (reduces false positives) |
| Unsafe Export Prevention Rate | Prevents unsafe formal surfaces | Should be 100% for core safety |
| Demo Leakage Rate | Demo outputs on formal surfaces | Should be 0% |
| Known Bad Coverage | Detection of known-bad patterns | Should maximize coverage |

## Representative Findings

The trust policy engine successfully:
- **Prevents demo leakage**: Blocks demo outputs from formal surfaces (protocol, external-handoff)
- **Enforces provenance**: Requires provenance for formal surface exports
- **Gates high-uncertainty outputs**: Requires human approval for unresolved uncertainties
- **Catches known patterns**: Detects common failure modes in biodesign workflows

## Limitations

See [limitations.md](limitations.md) for detailed limitations.

## Test Case Categories

### Truthful Partial (8 cases)
- Real, partial, or demo outputs that are properly labeled
- Should pass verification with correct tier and surface

### Unsafe Demo (16 cases)
- Demo outputs attempting to use formal surfaces
- Should be blocked unless on payload

### Missing Evidence (16 cases)
- Cases lacking provenance or evidence
- Should be blocked from formal surfaces

### Human-Gate Required (8 cases)
- Cases requiring human approval
- Should be gated, not automatically allowed

### Known-Bad Patterns (8 cases)
- Expected failure modes that should be caught
- Validates policy comprehensiveness

### Draft Output (8 cases)
- Unfinalized outputs
- Should be blocked from export surfaces

## File Organization

```
src/           - TypeScript implementation
schema/        - JSON schemas for data validation
data/          - Test cases and expected results
policy/        - Example trust policies
scripts/       - Benchmark and visualization scripts
docs/          - Documentation and scope
results/       - Generated benchmark outputs
figures/       - Generated visualizations
```

## Artifact Ethics

This artifact and the associated research:
- Does **not** make safety claims beyond the benchmark scope
- Does **not** recommend deployment without further validation
- Does **not** eliminate the need for domain expertise
- **Does** provide a framework for reasoning about tool safety
- **Does** enable structured policy evaluation

Researchers using this artifact should understand that:
1. This is a representative policy demonstration, not production-ready
2. Real-world deployment requires additional domain expertise
3. Wet-lab outcomes cannot be predicted from computational policies
4. Trust boundaries require careful external validation

## Reproduction Instructions

1. Clone the repository
2. Install Node.js dependencies: `npm install`
3. Build: `npm run build`
4. Run benchmark: `npm run bench`
5. Generate plots: `npm run genplot`
6. Compare results to `results/metrics_summary.json`

Expected behavior: All 74 cases should evaluate, with results saved to `results/` directory.

---

For questions about the research methodology or design decisions, refer to the associated paper.
