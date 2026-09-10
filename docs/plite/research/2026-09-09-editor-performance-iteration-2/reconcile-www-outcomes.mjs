import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { stripVTControlCharacters } from 'node:util';

const artifact = resolve(
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const original = JSON.parse(
  readFileSync(resolve(artifact, 'www-journey-event-timing-summary.json'))
);
const replay = JSON.parse(
  readFileSync(resolve(artifact, 'www-canonical-failure-replay.json'))
);
const selected = JSON.parse(
  readFileSync(resolve(artifact, 'www-canonical-failure-replay-selection.json'))
);
const replayRows = [];
function visit(suite) {
  for (const spec of suite.specs ?? [])
    for (const test of spec.tests)
      for (const result of test.results) {
        replayRows.push({
          source: `apps/www/tests/browser/${spec.file}`,
          line: spec.line,
          title: spec.title,
          status: result.status,
          errors: result.errors ?? [],
        });
      }
  for (const child of suite.suites ?? []) visit(child);
}
visit(replay);
const failures = original.rows.filter(
  (row) => row.status === 'failed' || row.status === 'timedOut'
);
assert.equal(failures.length, selected.expected);
assert.equal(replayRows.length, failures.length);
const signature = (errors) =>
  stripVTControlCharacters(errors[0]?.message ?? '')
    .split('\n')
    .filter(
      (line, index) =>
        index === 0 || /^(Expected:|Received:|Locator:)/.test(line.trim())
    )
    .map((line) => line.trim());
const rows = failures.map((failed) => {
  const title = failed.title.at(-1);
  const repeated = replayRows.filter(
    (row) => row.source === failed.source && row.title === title
  );
  assert.equal(
    repeated.length,
    1,
    `Exact replay missing or duplicated: ${title}`
  );
  const current = repeated[0];
  const marker = failed.source.endsWith('code-block-demos.spec.ts');
  const selector = title === 'link:floating-toolbar-discussion-spacing';
  const fixture = title === 'kit lifetime comparison';
  const disposition = selector
    ? 'Verifier selector ambiguity: one logical comment renders multiple matching spans; the strict single-element assertion fails before spacing proof.'
    : marker
      ? 'Rendered-marker contract gap: the test expects data-plite-editor="true" but the rendered attribute is empty. This does not by itself establish an editing failure.'
      : fixture
        ? 'Lifetime comparison fixture/contract mismatch at the matched-model-readonly guard; no comparable performance result.'
        : current.status === 'timedOut'
          ? 'Target-readiness timeout in the DnD journey. No observed duration or performance rank; determine whether the handle fixture or product route is wrong.'
          : 'Reproduced correctness or fixture discrepancy. Product cause is not isolated; retain the exact native/model/UI assertion before assigning a performance intervention.';
  return {
    source: failed.source,
    line: current.line,
    title,
    instrumentedStatus: failed.status,
    uninstrumentedStatus: current.status,
    sameStatus: failed.status === current.status,
    sameAssertionSignature:
      JSON.stringify(signature(failed.testErrors)) ===
      JSON.stringify(signature(current.errors)),
    instrumentedAssertion: signature(failed.testErrors),
    uninstrumentedAssertion: signature(current.errors),
    disposition,
    nextOwner:
      selector || marker || fixture
        ? 'Verify Plate: inspect the canonical fixture and public contract, then repair the exact verifier or retain a product reproduction.'
        : 'Patch: isolate the exact behavior and owning product/fixture contract before a repair. No speed claim until the original assertion passes.',
    productDefectConfirmed: false,
    errors: current.errors,
  };
});
const clockRows = original.rows.filter((row) => row.sourceUsesTestClock);
assert.equal(clockRows.length, 10);
assert.ok(clockRows.every((row) => row.status === 'passed'));
const result = {
  capturedAt: new Date().toISOString(),
  host: 'http://localhost:3299; Next source development mode',
  instrumentedStats: original.stats,
  originalCases: original.rows.length,
  originalPass: original.rows.filter((row) => row.status === 'passed').length,
  originalSkip: original.rows.filter((row) => row.status === 'skipped').length,
  originalFailure: failures.length,
  uninstrumentedStats: replay.stats,
  replayed: rows.length,
  sameStatus: rows.filter((row) => row.sameStatus).length,
  sameAssertionSignature: rows.filter((row) => row.sameAssertionSignature)
    .length,
  streamingClockCases: {
    total: clockRows.length,
    passed: clockRows.length,
    policy:
      'Correctness evidence only; test-controlled clocks are excluded from real-clock timing comparisons.',
  },
  policy:
    'The full packet and uninstrumented failure replay are separate receipts. All failed cases remain unresolved; replay removes the timing-hook explanation but does not automatically make a fixture/selector mismatch a product defect. No production latency comparison or repair is claimed.',
  rows,
};
writeFileSync(
  resolve(artifact, 'www-correctness-dispositions.json'),
  JSON.stringify(result, null, 2) + '\n'
);
const escape = (text) =>
  String(text).replaceAll('|', '\\|').replaceAll('\n', ' ');
const lines = [
  '# Plate www correctness and fixture dispositions',
  '',
  `The complete instrumented packet accounts for **${result.originalCases}** cases: **${result.originalPass} pass, ${result.originalFailure} fail and ${result.originalSkip} skip**. All **${result.replayed}** failed cases were replayed with the canonical, uninstrumented configuration: **${result.sameStatus}** retain their failure status and **${result.sameAssertionSignature}** retain the same first assertion/expected-value signature.`,
  '',
  result.policy,
  '',
  'All ten streaming lifetime cases pass after correcting the observer hook for a paused browser clock and mocked EventCounts. Those earlier probe failures remain preserved. The two skipped cases require the unavailable comparable main-branch host.',
  '',
  '[Instrumented event/case receipt](www-journey-event-timing-summary.md), [uninstrumented canonical replay](www-canonical-failure-replay.json), [every exact assertion and disposition](www-correctness-dispositions.json), [probe controls](www-timing-control.json).',
  '',
  '| Canonical case | Replayed outcome | Disposition | Next owner |',
  '| --- | --- | --- | --- |',
  ...rows.map(
    (row) =>
      `| ${escape(`${row.source}:${row.line} — ${row.title}`)} | ${row.uninstrumentedStatus} | ${escape(row.disposition)} | ${escape(row.nextOwner)} |`
  ),
  '',
];
writeFileSync(
  resolve(artifact, 'www-correctness-dispositions.md'),
  lines.join('\n')
);
console.log(
  JSON.stringify({
    cases: result.originalCases,
    passed: result.originalPass,
    skipped: result.originalSkip,
    failed: result.originalFailure,
    replayed: result.replayed,
    sameStatus: result.sameStatus,
    sameAssertionSignature: result.sameAssertionSignature,
    streamingPass: clockRows.length,
  })
);
