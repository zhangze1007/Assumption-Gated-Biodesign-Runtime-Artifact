# Documented Limitations

This document explicitly outlines the limitations and constraints of the Assumption-Gated BioDesign Runtime artifact.

## Scope Limitations

### 1. Local Benchmark Only

**Limitation**: This artifact evaluates **policy decisions only on representative test cases**, not real biodesign workflows.

**Implication**:
- Results reflect performance on 74 curated governance cases
- Does not validate actual biodesign processes
- No information about performance on unseen scenarios
- Cannot make generalizations beyond the benchmark corpus

**Mitigation**: The benchmark is designed to cover representative patterns; real deployment should include additional validation.

### 2. No Wet-Lab Validation

**Limitation**: This is a computational policy framework only. It does NOT validate wet-lab outcomes, experimental results, or scientific correctness.

**Implication**:
- Computational policies are not scientific validation
- A tool may pass all policy gates and still produce incorrect biology
- Policy decisions are about assumption management, not correctness verification
- Wet-lab experiments require separate, independent scientific validation

**Critical**: Users must not interpret policy clearance as scientific correctness guarantee.

### 3. No Scientific Correctness Guarantee

**Limitation**: The artifact does not establish that biodesign tool algorithms are scientifically correct or complete.

**Implication**:
- Policy engine validates trust assumptions, not model fidelity
- Missing assumptions can pass policy evaluation
- Tool correctness is an input to policy, not an output
- Scientific validation must occur independently

**Example**: A metabolic model with wrong kinetic parameters could pass policy if assumptions are documented, but the model would still be incorrect.

### 4. No Third-Party Benchmark Claim

**Limitation**: This is **not** an independent or third-party benchmark. It is an artifact designed by the same research group.

**Implication**:
- No independent validation of results
- Benchmark cases designed by researchers, not external parties
- Results reflect design choices in policy engine
- Not suitable for comparing different tools or vendors

**Proper Use**: Use for policy framework evaluation, not competitive benchmarking.

### 5. No Regulatory Certification

**Limitation**: This artifact does NOT provide regulatory approval, safety certification, or compliance validation.

**Implication**:
- Not suitable for FDA approval support
- Does not meet GxP requirements
- Cannot be used as regulatory evidence
- Commercial deployment requires separate regulatory processes

**Regulatory Path**: Organizations seeking regulatory approval must work with regulatory bodies independently; this artifact cannot substitute for that process.

## Technical Limitations

### 1. Default Policies Are Representative

**Limitation**: The default trust policies in `trustPolicyEngine.ts` are representative demonstrations, not based on real Nexus-Bio implementations.

**Implication**:
- Policies are examples of what trust gates might look like
- Real biodesign workflows may require different policies
- Claim-surface policies are simplified models
- Production use would require customized policies

### 2. Tool Labels Are Placeholders

**Limitation**: Tool identifiers (pathd, fbasim, catdes, etc.) and their associated policies are representative labels for artifact demonstration.

**Implication**:
- These are not references to specific real implementations
- Policies are not derived from those tools' actual designers
- Tool IDs serve as examples of how the framework would work
- Real implementations would require actual tool architects' input

### 3. Limited Claim Surface Coverage

**Limitation**: The artifact covers 5 claim surfaces; real biodesign systems may have more output categories.

**Implication**:
- Framework is extensible but not comprehensive
- Some real outputs may not fit neatly into these surfaces
- Additional surfaces would require policy expansion
- Does not cover all possible tool interactions

### 4. Single Policy Configuration

**Limitation**: The artifact demonstrates one policy configuration. Different scenarios may need different policies.

**Implication**:
- Results are specific to this policy
- Changing policies would change metrics
- No systematic exploration of policy space
- Users implementing this should customize policies for their context

## Data Limitations

### 1. Benchmark is Curated, Not Exhaustive

**Limitation**: The 74 test cases are manually curated, not generated systematically.

**Implication**:
- Coverage is representative but not exhaustive
- Rare edge cases may not be included
- Bias toward test authors' concerns
- Not a statistically random sample of the problem space

### 2. Expected Labels Are Assumed Correct

**Limitation**: The expected outcomes in `expected_labels.csv` represent one design team's assumptions about correct policy decisions.

**Implication**:
- Different teams might disagree on some outcomes
- Metrics assume these labels are ground truth
- Disagreement doesn't mean framework failure, but interpretation differences
- Labels reflect specific policy choices

### 3. No Coverage of Ancient or Future Tools

**Limitation**: Test cases reflect biodesign tools at the time of artifact creation.

**Implication**:
- Does not predict how framework would work with new tools
- Cannot handle entirely novel tool types without policy updates
- Framework extensibility depends on custom policy design
- Biodesign landscape continues to evolve

## Operational Limitations

### 1. Manual Policy Authoring

**Limitation**: Creating or updating policies requires manual effort and expertise.

**Implication**:
- Policy DSL enables automation but automation must be designed
- No automatic policy optimization or learning
- Policy updates are manual and error-prone
- Requires domain expertise to author correctly

### 2. No Continuous Monitoring

**Limitation**: Artifact is a batch evaluation tool, not a continuous monitoring system.

**Implication**:
- No runtime monitoring of deployed systems
- Results are snapshot-in-time
- Cannot detect policy violations in live systems
- Deployment would require additional infrastructure

### 3. Single-Machine Execution

**Limitation**: Benchmark runs on a single machine; no distributed or cloud deployment shown.

**Implication**:
- Not suitable for large-scale production use without adaptation
- No clustering, load balancing, or fault tolerance
- Performance limited to single-machine resources
- Scalability would require architectural changes

## Known Issues & Workarounds

### 1. Policy Precedence Complexity

**Issue**: When multiple policy rules could apply, precedence by numeric priority can be ambiguous.

**Workaround**: Use clear priority numbering and test policies extensively.

### 2. Limited Condition Expressiveness

**Issue**: Policy DSL conditions are limited to simple field comparisons.

**Workaround**: Complex logic should be embedded in policy evaluation code or pre-processing.

### 3. No Policy Conflict Detection

**Issue**: Policy document validation doesn't check for conflicting rules.

**Workaround**: Manual review of policies and testing with representative cases.

## What You Should NOT Do

Do NOT use this artifact to:

1. ✗ Make claims about biodesign tool correctness
2. ✗ Obtain regulatory approval or safety certification
3. ✗ Rank or compare different biodesign tools
4. ✗ Replace domain expert review or scientific validation
5. ✗ Deploy to production without further customization
6. ✗ Make decisions about wet-lab experiments
7. ✗ Claim tool outputs are scientifically valid based on policy clearance
8. ✗ Use as third-party independent validation

## Proper Use Cases

DO use this artifact to:

1. ✓ Understand policy-based trust evaluation frameworks
2. ✓ Experiment with policy DSL design
3. ✓ Develop custom trust policies for your tools
4. ✓ Reason about assumption management in workflows
5. ✓ Research trust frameworks (with citations)
6. ✓ Evaluate policy decision quality on defined test cases
7. ✓ Develop or improve tool integration strategies
8. ✓ Train on assumption-gating concepts

## Recommendations for Extension

If you extend or use this artifact, consider:

1. **Validate with Domain Experts**: Have biodesign researchers review policies
2. **Test on Real Workflows**: Evaluate on actual (not representative) cases
3. **Monitor Performance**: Track false positives/negatives in practice
4. **Document Customizations**: Clearly note policy changes and rationales
5. **Verify Assumptions**: Regularly update assumptions as tools evolve
6. **Establish Governance**: Define how policies are reviewed and updated
7. **Separate Concerns**: Keep policy logic separate from tool implementation
8. **Plan Scalability**: Consider operational requirements upfront

## Contact & Questions

For questions about limitations or proper use:
- Refer to the associated research paper
- Review [docs/artifact_scope.md](artifact_scope.md) for evaluation details
- Check README.md for technical quick start

---

**Remember**: This is a research artifact demonstrating a framework concept, not production-ready software or regulatory material.
