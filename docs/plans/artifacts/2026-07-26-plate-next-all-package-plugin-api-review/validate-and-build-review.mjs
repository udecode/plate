import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const artifactDir = path.join(
  root,
  'docs/plans/artifacts/2026-07-26-plate-next-all-package-plugin-api-review'
);

execFileSync(
  process.execPath,
  [path.join(artifactDir, 'scan-plugin-surfaces.mjs')],
  {
    cwd: root,
    stdio: 'ignore',
  }
);

const reviewFiles = [
  'review-basic-nodes.json',
  'review-core-styles.json',
  'review-early-packages.json',
  'review-mid-packages.json',
  'review-media-packages.json',
  'review-late-packages.json',
];
const capabilityFields = ['api', 'read', 'selectors', 'update', 'extension'];
const priorities = new Set(['keep', 'P0', 'P1', 'P2', 'P3']);
const raw = JSON.parse(
  await readFile(path.join(artifactDir, 'plugin-surfaces.raw.json'), 'utf8')
);
const sourceManifest = JSON.parse(
  await readFile(path.join(artifactDir, 'plugin-source-manifest.json'), 'utf8')
);
const reviews = (
  await Promise.all(
    reviewFiles.map(async (file) =>
      JSON.parse(await readFile(path.join(artifactDir, file), 'utf8'))
    )
  )
).flat();
const errors = [];
const keyOf = (row) => `${row.package}\0${row.file}\0${row.symbol}`;
const absorbedReviewRows = new Map([
  [
    'link\0packages/link/src/lib/BaseLinkPlugin.ts\0BaseLinkPluginDefinition',
    'link\0packages/link/src/lib/BaseLinkPlugin.ts\0BaseLinkPlugin',
  ],
  [
    'suggestion\0packages/suggestion/src/lib/BaseSuggestionPlugin.ts\0BaseSuggestionPluginDefinition',
    'suggestion\0packages/suggestion/src/lib/BaseSuggestionPlugin.ts\0BaseSuggestionPlugin',
  ],
]);
const rawByKey = new Map(raw.map((row) => [keyOf(row), row]));
const reviewByKey = new Map();

for (const row of reviews) {
  const key = keyOf(row);

  if (reviewByKey.has(key)) errors.push(`duplicate review row: ${key}`);
  reviewByKey.set(key, row);

  if (!priorities.has(row.priority)) {
    errors.push(`invalid priority ${row.priority}: ${key}`);
  }
  if (!row.verdict?.trim()) errors.push(`missing verdict: ${key}`);
  if (!row.evidence?.trim()) errors.push(`missing evidence: ${key}`);
  if (!Array.isArray(row.gaps)) errors.push(`invalid gaps: ${key}`);

  for (const surface of ['current', 'final']) {
    if (!row[surface] || typeof row[surface] !== 'object') {
      errors.push(`missing ${surface}: ${key}`);
      continue;
    }

    for (const field of capabilityFields) {
      if (!Array.isArray(row[surface][field])) {
        errors.push(`invalid ${surface}.${field}: ${key}`);
        continue;
      }

      const values = row[surface][field];
      if (new Set(values).size !== values.length) {
        errors.push(`duplicate ${surface}.${field} member: ${key}`);
      }
    }
  }
}

for (const key of rawByKey.keys()) {
  if (!reviewByKey.has(key)) errors.push(`missing review row: ${key}`);
}
for (const key of reviewByKey.keys()) {
  if (!rawByKey.has(key) && !absorbedReviewRows.has(key)) {
    errors.push(`extra review row: ${key}`);
  }
}
for (const [absorbedKey, ownerKey] of absorbedReviewRows) {
  if (!reviewByKey.has(absorbedKey)) {
    errors.push(`missing absorbed review row: ${absorbedKey}`);
  }
  if (!rawByKey.has(ownerKey)) {
    errors.push(`missing absorbed review owner: ${ownerKey}`);
  }
}

if (sourceManifest.parseErrors.length > 0) {
  errors.push(`source parse errors: ${sourceManifest.parseErrors.length}`);
}
if (sourceManifest.ambiguousRows > 0) {
  errors.push(`ambiguous source rows: ${sourceManifest.ambiguousRows}`);
}
if (sourceManifest.duplicateSourceRows.length > 0) {
  errors.push(
    `duplicate source rows: ${sourceManifest.duplicateSourceRows.join(', ')}`
  );
}
if (
  sourceManifest.genericPluginDecorators.some(
    (decorator) => decorator.ambiguities.length > 0
  )
) {
  errors.push('ambiguous generic plugin decorator contributions');
}

const builderRootRows = Object.entries(sourceManifest.builderCounts)
  .filter(([kind]) => kind !== 'derivedPlugin.extend' && kind !== 'alias')
  .reduce((sum, [, count]) => sum + count, 0);
const expectedBuilderRoots =
  sourceManifest.astBuilderCalls -
  sourceManifest.builderImplementationCalls.length -
  sourceManifest.nestedBuilderCalls.length;

if (builderRootRows !== expectedBuilderRoots) {
  errors.push(
    `builder reconciliation failed: ${builderRootRows} rows != ${expectedBuilderRoots} calls`
  );
}

if (errors.length > 0) {
  process.stderr.write(`${errors.join('\n')}\n`);
  process.exitCode = 1;
} else {
  const combined = raw.map((source) => {
    const review = reviewByKey.get(keyOf(source));

    return {
      id: source.id,
      package: source.package,
      symbol: source.symbol,
      file: source.file,
      line: source.line,
      key: source.key ?? null,
      kind: source.kind,
      base: source.base ?? null,
      current: review.current,
      final: review.final,
      priority: review.priority,
      verdict: review.verdict,
      evidence: review.evidence,
      extendJustified: review.extendJustified,
      gaps: review.gaps,
    };
  });
  const packageNames = [...new Set(combined.map((row) => row.package))].sort();
  const priorityCounts = countBy(combined, (row) => row.priority);
  const packageSummary = packageNames.map((packageName) => {
    const rows = combined.filter((row) => row.package === packageName);

    return {
      package: packageName,
      rows: rows.length,
      keep: rows.filter((row) => row.priority === 'keep').length,
      P0: rows.filter((row) => row.priority === 'P0').length,
      P1: rows.filter((row) => row.priority === 'P1').length,
      P2: rows.filter((row) => row.priority === 'P2').length,
      P3: rows.filter((row) => row.priority === 'P3').length,
      changed: rows.filter((row) => row.priority !== 'keep').length,
    };
  });
  const decisionNoteRows = combined
    .filter((row) => row.gaps.length > 0)
    .map((row) => ({
      id: row.id,
      package: row.package,
      symbol: row.symbol,
      priority: row.priority,
      gaps: row.gaps,
    }));
  const finalManifest = {
    sourceSnapshot: sourceManifest.sourceSnapshot,
    sourceFiles: sourceManifest.sourceFiles,
    candidateFiles: sourceManifest.candidateFiles,
    astBuilderCalls: sourceManifest.astBuilderCalls,
    builderImplementationCalls:
      sourceManifest.builderImplementationCalls.length,
    builderRootRows,
    derivedPluginRows:
      sourceManifest.builderCounts['derivedPlugin.extend'] ?? 0,
    genericPluginDecorators: sourceManifest.genericPluginDecorators.length,
    pluginRows: combined.length,
    reviewedRows: combined.length,
    absorbedReviewRows: absorbedReviewRows.size,
    packages: packageNames.length,
    missingRows: 0,
    extraRows: 0,
    duplicateRows: 0,
    ambiguousRows: 0,
    parseErrors: 0,
    priorityCounts,
    decisionNoteRows: decisionNoteRows.length,
    packageSummary,
  };

  await writeFile(
    path.join(artifactDir, 'plugin-api-review.json'),
    `${JSON.stringify(combined, null, 2)}\n`
  );
  await writeFile(
    path.join(artifactDir, 'review-manifest.json'),
    `${JSON.stringify(finalManifest, null, 2)}\n`
  );
  await writeFile(
    path.join(artifactDir, 'plugin-api-review.md'),
    `${renderMarkdown(combined, finalManifest)}\n`
  );

  process.stdout.write(`${JSON.stringify(finalManifest, null, 2)}\n`);
}

function countBy(items, keyOf) {
  return Object.fromEntries(
    [
      ...items.reduce((map, item) => {
        const key = keyOf(item);
        map.set(key, (map.get(key) ?? 0) + 1);
        return map;
      }, new Map()),
    ].sort(([a], [b]) => a.localeCompare(b))
  );
}

function renderMarkdown(rows, manifest) {
  const changed = rows.filter((row) => row.priority !== 'keep');
  const gaps = rows.filter((row) => row.gaps.length > 0);
  const lines = [
    '# Plate package plugin API review',
    '',
    '## Final ownership law',
    '',
    '- `api`: immutable plugin-owned service/controller surface. It may own option, UI, network, DOM, or session effects and may orchestrate named `update` calls, but direct document, selection, history, or transaction logic belongs in `update`.',
    '- `read`: side-effect-free, deterministic computation over the active editor state view. The same method must work against a committed snapshot and an uncommitted transaction snapshot.',
    '- `selectors`: projections of plugin option/store state. They are not document queries.',
    '- `update`: every plugin-owned document, selection, history, effect, or transaction mutation.',
    '- `extension`: Plite/editor-wide commands, corrections, lifecycle, fields, effects, codecs, host substrate, or genuinely unkeyed root capabilities.',
    '- Constructor first. Keep `.extend()` only for an imported/prebuilt descriptor or a real dependency on an earlier published capability.',
    '',
    'The `Current` columns describe semantic capability ownership. A feature-scoped root API or update authored inside `extension` is shown under `api` or `update`; genuinely editor-wide lifecycle, host, state, API, and transaction groups remain under `extension`.',
    '',
    '## Coverage',
    '',
    `- Source snapshot: \`${manifest.sourceSnapshot}\``,
    `- Production source files fingerprinted: ${manifest.sourceFiles}`,
    `- Candidate files parsed: ${manifest.candidateFiles}`,
    `- AST builder calls: ${manifest.astBuilderCalls} (${manifest.builderImplementationCalls} Core implementation calls; ${manifest.builderRootRows} declaration roots)`,
    `- Separately derived plugin rows: ${manifest.derivedPluginRows}`,
    `- Generic typed plugin decorators: ${manifest.genericPluginDecorators}`,
    `- Plugin rows reviewed: ${manifest.reviewedRows}/${manifest.pluginRows}`,
    `- Definition rows absorbed into their sole owner: ${manifest.absorbedReviewRows}`,
    `- Packages: ${manifest.packages}`,
    '- Missing / extra / duplicate / ambiguous / parse-error rows: 0 / 0 / 0 / 0 / 0',
    `- Verdicts: ${manifest.priorityCounts.keep ?? 0} keep; ${manifest.priorityCounts.P0 ?? 0} P0; ${manifest.priorityCounts.P1 ?? 0} P1; ${manifest.priorityCounts.P2 ?? 0} P2; ${manifest.priorityCounts.P3 ?? 0} P3`,
    '',
    '## Recommended migration order',
    '',
    '1. P0: repair AI preview/history ownership, Navigation ownership, and the Table query/selector split.',
    '2. P1: move feature-scoped root extension APIs and state queries to plugin `api` / `read` / `update`; add the missing scoped helper capabilities recorded below.',
    '3. P2/P3: fold independent `.extend()` contributions into constructors. These are authoring cleanup, not runtime API redesign.',
    '',
    '## Package summary',
    '',
    '| Package | Rows | Changed | P0 | P1 | P2 | P3 | Keep |',
    '|---|---:|---:|---:|---:|---:|---:|---:|',
    ...manifest.packageSummary.map(
      (item) =>
        `| ${item.package} | ${item.rows} | ${item.changed} | ${item.P0} | ${item.P1} | ${item.P2} | ${item.P3} | ${item.keep} |`
    ),
    '',
    '## Recommended changes',
    '',
    '| ID | Priority | Plugin | Current | Final | Verdict |',
    '|---:|---|---|---|---|---|',
    ...changed.map(
      (row) =>
        `| ${row.id} | ${row.priority} | ${row.package}/${row.symbol} | ${surface(row.current)} | ${surface(row.final)} | ${escapeCell(row.verdict)} |`
    ),
    '',
    '## Decision notes and implementation gaps',
    '',
    '| ID | Priority | Plugin | Gap |',
    '|---:|---|---|---|',
    ...gaps.flatMap((row) =>
      row.gaps.map(
        (gap) =>
          `| ${row.id} | ${row.priority} | ${row.package}/${row.symbol} | ${escapeCell(gap)} |`
      )
    ),
    '',
    '## Exhaustive plugin ledger',
    '',
    '| ID | Plugin | Source | Priority | Current | Final | Evidence |',
    '|---:|---|---|---|---|---|---|',
    ...rows.map(
      (row) =>
        `| ${row.id} | ${row.package}/${row.symbol} | \`${row.file}:${row.line}\` | ${row.priority} | ${surface(row.current)} | ${surface(row.final)} | ${escapeCell(row.evidence)} |`
    ),
  ];

  return lines.join('\n');
}

function surface(value) {
  const text = capabilityFields
    .filter((field) => value[field].length > 0)
    .map((field) => `${field}: ${value[field].join(', ')}`)
    .join('; ');

  return escapeCell(text || 'none');
}

function escapeCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}
