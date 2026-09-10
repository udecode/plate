import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const www = process.argv.includes('--www');
const label = www ? 'www-journey' : 'journey';
const artifact = resolve(
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const sourcePath = resolve(artifact, `${label}-event-timing-report.json`);
const source = readFileSync(sourcePath);
const report = JSON.parse(source);
const overlay = JSON.parse(
  readFileSync(resolve(artifact, `${label}-timing-overlay.json`))
);
const records = new Map(
  overlay.records.map((row) => [
    row.relative,
    {
      ...row,
      sourceUsesTestClock: /\.clock\.(?:install|pauseAt)/.test(
        readFileSync(resolve(row.file), 'utf8')
      ),
    },
  ])
);
const rows = [];

function visit(suite, parents = []) {
  const titles = suite.title ? [...parents, suite.title] : parents;
  for (const spec of suite.specs ?? []) {
    const original = records.get(spec.file);
    if (!original) throw new Error(`No canonical source for ${spec.file}`);
    for (const test of spec.tests) {
      for (const result of test.results) {
        const attachment = result.attachments?.find(
          (item) => item.name === 'native-event-timing'
        );
        const packet = attachment
          ? JSON.parse(
              attachment.body
                ? Buffer.from(attachment.body, 'base64')
                : readFileSync(attachment.path)
            )
          : null;
        const interactions = new Map();
        for (const event of packet?.events ?? []) {
          if (!(event.interactionId > 0)) continue;
          const id = `${event.documentId}:${event.interactionId}`;
          const prior = interactions.get(id);
          if (!prior || event.duration > prior.durationMs) {
            interactions.set(id, {
              documentId: event.documentId,
              interactionId: event.interactionId,
              durationMs: event.duration,
              longestEvent: event.name,
              processingMs: event.processingEnd - event.processingStart,
              inputDelayMs: event.processingStart - event.startTime,
              url: event.url,
              targetTag: event.targetTag,
              editorRoot: event.editorRoot,
            });
          }
        }
        const documents = new Map();
        for (const document of packet?.documents ?? []) {
          if (!document.documentId) continue;
          const previous = documents.get(document.documentId);
          const counts = { ...previous?.counts };
          for (const [name, count] of Object.entries(document.counts ?? {}))
            counts[name] = Math.max(counts[name] ?? 0, count);
          documents.set(document.documentId, { ...document, counts });
        }
        const observed = [...interactions.values()].sort(
          (a, b) => b.durationMs - a.durationMs
        );
        rows.push({
          id: spec.id,
          title: [...titles, spec.title],
          source: original.file,
          line: spec.line - 3,
          sourceSha256: original.sourceSha256,
          project: test.projectName,
          retry: result.retry,
          status: result.status,
          expectedStatus: test.expectedStatus,
          testResult: test.status,
          testDurationMs: result.duration,
          testErrors: result.errors ?? [],
          annotations: [
            ...(test.annotations ?? []),
            ...(result.annotations ?? []),
          ],
          capturePresent: Boolean(packet),
          captureSchemaVersion: packet?.schemaVersion ?? null,
          capturePolicy:
            packet?.capturePolicy ??
            'Original observer flush after two animation frames.',
          sourceUsesTestClock: original.sourceUsesTestClock,
          timingEligibility:
            result.status !== 'passed'
              ? 'Incomplete or failed correctness journey; diagnostic events only.'
              : original.sourceUsesTestClock
                ? 'Source file uses a controlled browser clock; correctness evidence only.'
                : 'One real-clock journey; censored diagnostic observations, not a repeated-operation distribution.',
          captureErrors: packet?.errors ?? [],
          rawEventEntries: packet?.events?.length ?? 0,
          zeroIdEventEntries:
            packet?.events?.filter((event) => !(event.interactionId > 0))
              .length ?? 0,
          observedInteractions: observed.length,
          longestObservedInteractionMs: observed[0]?.durationMs ?? null,
          observedOver100Ms: observed.filter((item) => item.durationMs > 100)
            .length,
          observedOver200Ms: observed.filter((item) => item.durationMs > 200)
            .length,
          documents: [...documents.values()],
          interactions: observed,
        });
      }
    }
  }
  for (const child of suite.suites ?? []) visit(child, titles);
}
visit(report);
const counted =
  report.stats.expected +
  report.stats.unexpected +
  report.stats.skipped +
  report.stats.flaky;
if (
  rows.length !== counted ||
  new Set(rows.map((row) => `${row.id}:${row.project}:${row.retry}`)).size !==
    rows.length
) {
  throw new Error(
    `Journey accounting mismatch: ${rows.length} results, ${counted} expected unique attempts`
  );
}
const count = (key) => rows.reduce((sum, row) => sum + row[key], 0);
const tally = (key) =>
  Object.fromEntries(
    [...new Set(rows.map((row) => row[key]))].map((value) => [
      value,
      rows.filter((row) => row[key] === value).length,
    ])
  );
const summary = {
  attempts: rows.length,
  status: tally('status'),
  files: new Set(rows.map((row) => row.source)).size,
  captures: rows.filter((row) => row.capturePresent).length,
  testClockCases: rows.filter((row) => row.sourceUsesTestClock).length,
  captureErrors: rows.filter((row) => row.captureErrors.length).length,
  casesWithObservedInteractions: rows.filter(
    (row) => row.observedInteractions > 0
  ).length,
  casesWithoutObservedInteractions: rows.filter(
    (row) => row.observedInteractions === 0
  ).length,
  casesOver100Ms: rows.filter((row) => row.observedOver100Ms > 0).length,
  casesOver200Ms: rows.filter((row) => row.observedOver200Ms > 0).length,
  rawEventEntries: count('rawEventEntries'),
  zeroIdEventEntries: count('zeroIdEventEntries'),
  observedInteractions: count('observedInteractions'),
  observedOver100Ms: count('observedOver100Ms'),
  observedOver200Ms: count('observedOver200Ms'),
  passedRealClockCases: rows.filter(
    (row) => row.status === 'passed' && !row.sourceUsesTestClock
  ).length,
  passedRealClockObservedInteractions: rows
    .filter((row) => row.status === 'passed' && !row.sourceUsesTestClock)
    .reduce((sum, row) => sum + row.observedInteractions, 0),
};
const output = {
  capturedAt: new Date().toISOString(),
  source: sourcePath.slice(root.length + 1),
  sourceSha256: createHash('sha256').update(source).digest('hex'),
  testSourceFingerprint: overlay.filesFingerprint,
  hostMode: www
    ? 'Next development on owned port 3299, source imports; compilation and development overhead remain diagnostic confounders.'
    : 'Owned immutable Plite host on port 3298; exact serving identity is recorded separately.',
  metric:
    'Observed Browser Event Timing duration, grouped by document and positive interactionId using the maximum duration. Threshold 16 ms; granularity 8 ms. Counts contain only reported interactions. Missing entries are censored, unsupported or outside the metric and are never zero latency. This is one execution per journey, not a repeated operation distribution or INP certification. Programmatic actions, continuous pointermove/wheel and complete asynchronous feature work are not represented by this metric.',
  documentCounts:
    'Retain the maximum counter per event name in each document rather than summing repeated cumulative snapshots. Event counters are context, not a measured complete-operation denominator. Raw event entries with interactionId 0 are retained in the source but excluded from interaction counts.',
  stats: report.stats,
  reportErrors: report.errors,
  summary,
  rows,
};
writeFileSync(
  resolve(artifact, `${label}-event-timing-summary.json`),
  JSON.stringify(output, null, 2) + '\n'
);
const escape = (value) =>
  String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const leaders = rows
  .filter(
    (row) =>
      row.status === 'passed' &&
      !row.sourceUsesTestClock &&
      row.observedInteractions
  )
  .sort(
    (a, b) => b.longestObservedInteractionMs - a.longestObservedInteractionMs
  )
  .slice(0, 25);
const lines = [
  `# ${www ? 'Plate www' : 'Plite'} native journey timing diagnostic`,
  '',
  output.hostMode,
  '',
  output.metric,
  '',
  `All **${rows.length}** canonical results are accounted for: ${Object.entries(
    summary.status
  )
    .map(([key, value]) => `${value} ${key}`)
    .join(
      ', '
    )} across ${summary.files} files. ${summary.captures} timing packets were captured; ${summary.captureErrors} packets report a capture limitation. ${summary.casesWithObservedInteractions} cases contain ${summary.observedInteractions} observed interactions; ${summary.casesWithoutObservedInteractions} cases have no reported positive-ID interaction. The latter is not a zero-latency or under-threshold claim.`,
  '',
  `${summary.observedOver100Ms} observed interactions in ${summary.casesOver100Ms} cases exceed 100 ms; ${summary.observedOver200Ms} in ${summary.casesOver200Ms} cases exceed 200 ms. These are triage signals from heterogeneous journeys, not percentile comparisons. Test setup, selection and UI controls can contribute; inspect the exact event and route before assigning an editor owner.`,
  '',
  `${summary.passedRealClockCases} passing cases use source files without browser-clock controls and contain ${summary.passedRealClockObservedInteractions} observed interactions. ${summary.testClockCases} cases belong to files that install or pause a browser test clock; those retain correctness evidence only. Failed and skipped journeys never receive a performance rank.`,
  '',
  `[All per-case results and grouped events](${label}-event-timing-summary.json), [raw report](${label}-event-timing-report.json), [canonical source mapping](${label}-timing-overlay.json).`,
  '',
  '## Largest observed interactions in passing real-clock journeys',
  '',
  '| Canonical journey | Result | Observed interactions | Largest observed duration, ms | Longest event |',
  '| --- | --- | ---: | ---: | --- |',
  ...leaders.map(
    (row) =>
      `| ${escape(`${row.source}:${row.line} — ${row.title.at(-1)}`)} | ${row.status} | ${row.observedInteractions} | ${row.longestObservedInteractionMs} | ${row.interactions[0].longestEvent} |`
  ),
  '',
  '## Complete result accounting',
  '',
  '| Canonical journey | Result | Observed interactions | Largest observed duration, ms | Capture |',
  '| --- | --- | ---: | ---: | --- |',
  ...rows.map(
    (row) =>
      `| ${escape(`${row.source}:${row.line} — ${row.title.at(-1)}`)} | ${row.status} | ${row.observedInteractions} | ${row.longestObservedInteractionMs ?? 'unobserved'} | ${escape(row.captureErrors.join('; ') || (row.capturePresent ? 'captured' : 'no packet'))} |`
  ),
  '',
];
writeFileSync(
  resolve(artifact, `${label}-event-timing-summary.md`),
  lines.join('\n')
);
console.log(JSON.stringify(summary, null, 2));
