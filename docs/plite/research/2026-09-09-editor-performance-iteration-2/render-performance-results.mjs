import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const output = resolve(
  import.meta.dirname,
  '../../../plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const common = JSON.parse(
  readFileSync(resolve(output, 'common-comparison-summary.json'), 'utf8')
);
const compiler = JSON.parse(
  readFileSync(resolve(output, 'compiler-comparison-summary.json'), 'utf8')
);
const n = (value) => (typeof value === 'number' ? value.toFixed(1) : '—');
const timing = (row) =>
  row.operation === 'mount' ? row.twoFramesMs : row.eventToFrameOpportunityMs;
const operationIds = [...new Set(common.summary.map((row) => row.operation))];
const surfaces = [...new Set(common.summary.map((row) => row.surface))];
const counts = [...new Set(common.summary.map((row) => row.count))];
const cell = (row) => {
  if (!row) return 'unmeasured';
  if (row.unsupported?.length) return 'unsupported';
  if (row.passed !== row.attempted || !timing(row)?.n)
    return `fail (${row.passed}/${row.attempted})`;
  return n(timing(row).p95);
};
const headers = [
  'surface',
  'paragraphs',
  'operation',
  'passed',
  'attempted',
  'unsupported',
  'clock',
  'n',
  'p50',
  'p75',
  'p95',
  'max',
  'iqr',
  'model_p95',
  'verified_state_p95',
];
const records = common.summary.map((row) => {
  const metric = timing(row);
  return [
    row.surface,
    row.count,
    row.operation,
    row.passed,
    row.attempted,
    row.unsupported?.join('; ') ?? '',
    row.operation === 'mount'
      ? 'mount_to_two_frame_opportunities'
      : 'trusted_event_to_two_frame_opportunities',
    metric?.n ?? 0,
    metric?.p50,
    metric?.p75,
    metric?.p95,
    metric?.max,
    metric?.iqr,
    row.modelMs?.p95,
    row.verifiedStateMs?.p95,
  ];
});
writeFileSync(
  resolve(output, 'common-operation-results.tsv'),
  [headers, ...records]
    .map((row) => row.map((value) => value ?? '').join('\t'))
    .join('\n') + '\n'
);
const lines = [
  '# Matched common-operation results',
  '',
  `${surfaces.length} editors × ${counts.length} document sizes × ${operationIds.length} timed rows = ${common.summary.length} cells, including mount. Each cell retains 31 samples after three warmups. Failed/unsupported cells remain in the denominator and receive no speed rank.`,
  '',
  "All values below are p95 milliseconds. Mount ends after two frame opportunities; interaction clocks start at the trusted event and end after the operation's two-frame opportunity. Neither is verified paint. Complete correctness is checked afterward; the separate verified-state clock includes oracle overhead. The ten-character burst is one operation, not ten per-character samples. No p99 is reported from 31 observations.",
  '',
  'Fixture: 80-character paragraphs at 100, 1,000 and 10,000 blocks, equal visible dimensions, bold and undo support, full DOM. Slate enables root chunk size 1,000. Minimal Plite/Plate compositions do not represent every www feature. Fixture-local unsupported HTML cells are not assertions that the underlying package cannot support HTML.',
  '',
  'Raw sample distributions, model/command clocks, fixture recipes, native/model/HTML oracles, exact package/source identities, bundle hashes and interleaved order remain in the JSON packet. The compact TSV retains p50/p75/p95/max/IQR for every cell.',
  '',
];
for (const count of counts) {
  lines.push(
    `## ${count.toLocaleString('en-US')} paragraphs`,
    '',
    `| Operation | ${surfaces.join(' | ')} |`,
    `| --- | ${surfaces.map(() => '---:').join(' | ')} |`
  );
  for (const operation of operationIds)
    lines.push(
      `| ${operation} | ${surfaces.map((surface) => cell(common.summary.find((row) => row.count === count && row.surface === surface && row.operation === operation))).join(' | ')} |`
    );
  lines.push('');
}
const changedCommon = Object.entries(common.sources ?? {})
  .filter(([, row]) => !row.stable)
  .map(([file]) => file);
lines.push(
  '## Provenance limits',
  '',
  `The measured bundles remained frozen. ${changedCommon.length} source files differed on disk after the common packet; the receipt represents the frozen inputs rather than a claim about every later checkout edit. The later Compiler packet recaptures its own inputs and must not be pooled into these distributions.`,
  '',
  ...changedCommon.map((file) => `- ${file}`),
  ''
);
writeFileSync(resolve(output, 'common-operation-results.md'), lines.join('\n'));

const compilerRows = [];
for (const editor of ['plite', 'plate'])
  for (const count of counts)
    for (const operation of new Set(
      compiler.summary.map((row) => row.operation)
    )) {
      const off = compiler.summary.find(
        (row) =>
          row.surface === `${editor}:off` &&
          row.count === count &&
          row.operation === operation
      );
      const on = compiler.summary.find(
        (row) =>
          row.surface === `${editor}:compiler8` &&
          row.count === count &&
          row.operation === operation
      );
      const offMetric = timing(off);
      const onMetric = timing(on);
      compilerRows.push({
        editor,
        count,
        operation,
        off: offMetric,
        on: onMetric,
        p50DeltaMs: onMetric.p50 - offMetric.p50,
        p95DeltaMs: onMetric.p95 - offMetric.p95,
        p95DeltaPercent: (onMetric.p95 / offMetric.p95 - 1) * 100,
        validity: off.passed === off.attempted && on.passed === on.attempted,
      });
    }
writeFileSync(
  resolve(output, 'compiler-deltas.json'),
  JSON.stringify(
    {
      interpretation:
        'Descriptive interleaved off/on differences. Negative means lower time with Compiler. IQR and max remain visible; no confidence interval or universal causal benefit is claimed.',
      rows: compilerRows,
    },
    null,
    2
  ) + '\n'
);
writeFileSync(
  resolve(output, 'compiler-deltas.md'),
  [
    '# Current Compiler off/on controls',
    '',
    'Four arms: Plite off/on and Plate off/on. Three sizes, seven interactions plus mount, three warmups and 31 retained samples per arm/size. All 408 attempts passed their selected correctness oracles; 96 timed cells. Source inputs were stable across this packet. Performance clocks have the same frame-opportunity limits as the common packet.',
    '',
    'The 10k mount distributions are broad. Split improves descriptively with compilation; mounting remains essentially unchanged and several operations regress or stay within noise. These data do not justify a universal compiler speedup or pooling with the earlier reference run.',
    '',
    '| Editor | Blocks | Operation | Off p50 | On p50 | Off p95 | On p95 | p95 delta | Off IQR | On IQR |',
    '| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...compilerRows.map(
      (row) =>
        `| ${row.editor} | ${row.count} | ${row.operation} | ${n(row.off.p50)} | ${n(row.on.p50)} | ${n(row.off.p95)} | ${n(row.on.p95)} | ${n(row.p95DeltaPercent)}% | ${n(row.off.iqr)} | ${n(row.on.iqr)} |`
    ),
    '',
  ].join('\n')
);
console.log(
  JSON.stringify({
    commonCells: records.length,
    compilerComparisons: compilerRows.length,
    commonChangedSources: changedCommon.length,
  })
);
