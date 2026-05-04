/**
 * Benchmark Script for Assumption-Gated BioDesign Runtime Artifact
 * Evaluates all 74 governance cases against the trust policy engine
 * Generates results/metrics_summary.json and results/figure6_data.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  buildTrustMetricsReport, 
  parseExpectedLabelsCsv, 
  parseBenchmarkCaseFile 
} from '../src/trustMetricsReport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');
const RESULTS_DIR = path.join(PROJECT_ROOT, 'results');

interface Figure6DataRow {
  caseId: string;
  category: string;
  toolId: string;
  surface: string;
  expectedStatus: string;
  actualStatus: string;
  expectedBlockCode: string | null;
  actualBlockCode: string | null;
  matches: boolean;
}

/**
 * Load benchmark cases from JSON file
 */
function loadBenchmarkCases() {
  const casesFile = path.join(DATA_DIR, 'governance_cases_74.json');
  const content = fs.readFileSync(casesFile, 'utf-8');
  const parsed = JSON.parse(content);
  const { cases } = parseBenchmarkCaseFile(parsed, 'governance_cases_74.json');
  console.log(`Loaded ${cases.length} benchmark cases`);
  return cases;
}

/**
 * Load expected labels from CSV file
 */
function loadExpectedLabels() {
  const labelsFile = path.join(DATA_DIR, 'expected_labels.csv');
  if (!fs.existsSync(labelsFile)) {
    console.warn(`Expected labels file not found: ${labelsFile}`);
    return [];
  }
  const content = fs.readFileSync(labelsFile, 'utf-8');
  const labels = parseExpectedLabelsCsv(content);
  console.log(`Loaded ${labels.length} expected labels`);
  return labels;
}

/**
 * Ensure results directory exists
 */
function ensureResultsDir() {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
}

/**
 * Write results to files
 */
function writeResults(metrics: any, figure6Data: Figure6DataRow[]) {
  // Write metrics summary
  const metricsFile = path.join(RESULTS_DIR, 'metrics_summary.json');
  fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
  console.log(`Metrics summary written to ${metricsFile}`);

  // Write figure 6 data CSV
  const csvFile = path.join(RESULTS_DIR, 'figure6_data.csv');
  const csvHeader = 'caseId,category,toolId,surface,expectedStatus,actualStatus,expectedBlockCode,actualBlockCode,matches';
  const csvRows = figure6Data.map((row) => {
    const expectedBlockCode = row.expectedBlockCode === null ? '' : row.expectedBlockCode;
    const actualBlockCode = row.actualBlockCode === null ? '' : row.actualBlockCode;
    return [
      row.caseId,
      row.category,
      row.toolId,
      row.surface,
      row.expectedStatus,
      row.actualStatus,
      expectedBlockCode,
      actualBlockCode,
      row.matches ? 'true' : 'false',
    ].join(',');
  });
  const csvContent = [csvHeader, ...csvRows].join('\n');
  fs.writeFileSync(csvFile, csvContent);
  console.log(`Figure 6 data written to ${csvFile}`);
}

/**
 * Build Figure 6 data from metrics
 */
function buildFigure6Data(metrics: any, cases: any[]): Figure6DataRow[] {
  const figure6Data: Figure6DataRow[] = [];

  for (const mismatch of metrics.mismatches) {
    const testCase = cases.find((c) => c.caseId === mismatch.caseId);
    if (!testCase) continue;

    const expectedBlockCode = mismatch.expectedBlockCode ?? null;
    const actualBlockCode = mismatch.actualBlockCode ?? null;
    const matches = false; // These are mismatches

    figure6Data.push({
      caseId: mismatch.caseId,
      category: mismatch.category,
      toolId: mismatch.toolId,
      surface: mismatch.surface,
      expectedStatus: mismatch.expectedStatus,
      actualStatus: mismatch.actualStatus,
      expectedBlockCode,
      actualBlockCode,
      matches,
    });
  }

  // Add matching cases for completeness
  const mismatchCaseIds = new Set(metrics.mismatches.map((m: any) => m.caseId));
  for (const testCase of cases) {
    if (!mismatchCaseIds.has(testCase.caseId)) {
      figure6Data.push({
        caseId: testCase.caseId,
        category: testCase.category,
        toolId: testCase.toolId,
        surface: testCase.surface,
        expectedStatus: testCase.expected.status,
        actualStatus: testCase.expected.status,
        expectedBlockCode: testCase.expected.blockCode,
        actualBlockCode: null,
        matches: true,
      });
    }
  }

  // Sort by caseId for consistency
  figure6Data.sort((a, b) => a.caseId.localeCompare(b.caseId));
  return figure6Data;
}

/**
 * Main benchmark execution
 */
async function runBenchmark() {
  console.log('Assumption-Gated BioDesign Runtime - Benchmark Runner');
  console.log('======================================================');

  ensureResultsDir();
  const cases = loadBenchmarkCases();
  const expectedLabels = loadExpectedLabels();

  console.log(`Evaluating ${cases.length} test cases...`);
  const generatedAt = new Date().toISOString();
  const metrics = buildTrustMetricsReport({
    cases,
    expectedLabels,
    generatedAt,
    runLabel: 'artifact-validation',
    corpusVersion: 'governance-cases-v1',
  });

  console.log(`\nBenchmark Results:`);
  console.log(`  Total cases: ${metrics.totalCases}`);
  console.log(`  Status: ok=${metrics.statusCounts.ok}, blocked=${metrics.statusCounts.blocked}, gated=${metrics.statusCounts.gated}, demoOnly=${metrics.statusCounts.demoOnly}`);
  console.log(`  Block rate: ${(metrics.blockRate * 100).toFixed(2)}%`);
  console.log(`  Gate rate: ${(metrics.gateRate * 100).toFixed(2)}%`);
  console.log(`  Demo-only rate: ${(metrics.demoOnlyRate * 100).toFixed(2)}%`);
  console.log(`  False block rate: ${(metrics.falseBlockRate * 100).toFixed(2)}%`);
  console.log(`  Unsafe export prevention rate: ${(metrics.unsafeExportPreventionRate * 100).toFixed(2)}%`);
  console.log(`  Demo leakage rate: ${(metrics.demoLeakageRate * 100).toFixed(2)}%`);
  console.log(`  Known bad prevention rate: ${(metrics.knownBadSummary.preventedKnownBadCases)}/${metrics.knownBadSummary.totalKnownBadCases}`);
  console.log(`  Known bad coverage: ${(metrics.knownBadCoverageRate * 100).toFixed(2)}%`);
  console.log(`  Mismatches: ${metrics.mismatches.length}`);

  const figure6Data = buildFigure6Data(metrics, cases);
  writeResults(metrics, figure6Data);

  console.log('\n✓ Benchmark complete. Results written to results/ directory');
}

runBenchmark().catch((error) => {
  console.error('Benchmark failed:', error);
  process.exit(1);
});
