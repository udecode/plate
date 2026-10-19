#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const harvestRoot = dirname(fileURLToPath(import.meta.url));
const root = resolve(harvestRoot, '../../..');
const wordgardRoot = resolve(root, '../wordgard');
const sourceCommit = 'b5ad0d057e2790c8cf971c85a9d2fb7e4a82da54';
const baselineCommit = 'c715d4ded8fc780f52c13206e589ea31e4148dd4';
const requireFromWordgard = createRequire(
  resolve(wordgardRoot, 'package.json')
);
const ts = requireFromWordgard('typescript');

const classifications = {
  'generate.ts': [
    'harness',
    'Random document and change generators support algebra and renderer stress tests but assert no editor behavior themselves.',
  ],
  'schema.ts': [
    'harness',
    'Shared schema, builders, equality, and tagged-position fixtures only.',
  ],
  'tempview.ts': ['harness', 'Browser editor mounting and focus fixture only.'],
  'test-cellselection.ts': [
    'portable-mixed',
    'Custom-selection mapping is Plite substrate; rectangular table geometry and navigation are Plate table policy.',
  ],
  'test-change.ts': [
    'portable',
    'Apply, compose, transform, invert, position mapping, schema fitting, JSON round trips, and randomized algebra are editor-kernel laws.',
  ],
  'test-collab.ts': [
    'portable-mixed',
    "Peer convergence, remote history, shared marks, server transform, and correction laws are portable; Wordgard's central protocol is not Plite's Yjs product.",
  ],
  'test-commands.ts': [
    'portable-mixed',
    'Lift, split, enter, delete, join, wrap, and mark semantics are portable; list policy remains Plate-owned.',
  ],
  'test-correction.ts': [
    'portable',
    'Change-scoped correction notification, application, and initial repair are normalization laws.',
  ],
  'test-facet.ts': [
    'portable',
    'Extension precedence, dependency tracking, memoization, reconfiguration, effects, and cycle rejection are kernel-extension laws.',
  ],
  'test-history.ts': [
    'portable',
    'Undo/redo grouping, mapping, selection restore, effects, serialization, isolation, extenders, and random sequences are history laws.',
  ],
  'test-node.ts': [
    'portable',
    'Tree traversal, text extraction, construction validation, and JSON round trips are model laws.',
  ],
  'test-pointset.ts': [
    'portable-mixed',
    'Point ordering, association, merge, masking, and change mapping are portable; the packed linear PointSet class is Wordgard-specific.',
  ],
  'test-pos.ts': [
    'portable',
    'Position resolution, traversal, caching, and node representation are model-coordinate laws.',
  ],
  'test-prop.ts': [
    'portable-mixed',
    'Mark equality and add/remove semantics are portable; ordered and multi-mark sets do not match Plite leaf properties.',
  ],
  'test-rangeset.ts': [
    'portable-mixed',
    'Range ordering, endpoint association, merge, masking, and change mapping are portable; non-overlap and the packed linear class are Wordgard-specific.',
  ],
  'test-schema.ts': [
    'portable',
    'Content validation, defaults, groups, overlays, and unknown-type rejection are schema laws.',
  ],
  'test-selection.ts': [
    'portable',
    'Valid cursor positions, isolating boundaries, graphemes, bidi motion, inline voids, and word motion are selection laws.',
  ],
  'test-state.ts': [
    'portable',
    'Atomic multi-spec updates plus selection and effect mapping are transaction-state laws.',
  ],
  'test-table-commands.ts': [
    'plate-owned',
    'Header, row, column, merge, split, span, and whole-table behaviors belong to Plate Table.',
  ],
  'test-table-correction.ts': [
    'plate-owned',
    'Rectangularization, span collision repair, and missing-cell placement belong to Plate Table.',
  ],
  'test-table-paste.ts': [
    'plate-owned',
    'Grid paste expansion, clipping, repetition, and merged-cell splitting belong to Plate Table.',
  ],
  'webtest-commands.ts': [
    'portable',
    'Visual-line deletion and soft-wrap boundaries are browser editing behavior.',
  ],
  'webtest-composition.ts': [
    'portable',
    'IME lifecycle, replacement, DOM retention, marks, cursor wrappers, and target-range fallback are browser editing behavior.',
  ],
  'webtest-content.ts': [
    'portable-mixed',
    'Incremental DOM identity, decoration invalidation, widget lifecycle, and hidden-descendant rendering are portable; Wordgard tile and widget shapes are implementation-specific.',
  ],
  'webtest-coords.ts': [
    'portable',
    'Model/DOM coordinate round trips, affinity, RTL, hard breaks, vertical motion, goal columns, atoms, nesting, and tables are browser selection laws.',
  ],
  'webtest-dom-changes.ts': [
    'portable',
    'Stacked native mutations, cross-node correction, model/native interleaving, and dirty-DOM input are browser editing laws.',
  ],
  'webtest-editor.ts': [
    'portable',
    'Plugin update lifecycle, DOM repair, dispatch reentrancy, flush, appenders, and widget lifecycle are editor-runtime laws.',
  ],
  'webtest-resolve-dom.ts': [
    'portable',
    'Biased model/DOM resolution around text, wrappers, widgets, structural DOM, and inline buffers is a DOM bridge law.',
  ],
  'webtest-serialize.ts': [
    'portable-mixed',
    'DOM parse/serialize, slice context, and unmatched-block fitting are portable; concrete element rules remain Plate-owned.',
  ],
};

const git = (...args) =>
  execFileSync('git', args, { cwd: wordgardRoot, encoding: 'utf8' }).trim();

if (git('rev-parse', 'HEAD') !== sourceCommit) {
  throw new Error('Wordgard source cursor drifted');
}
if (git('status', '--porcelain') !== '') {
  throw new Error('Wordgard checkout must be clean');
}

const files = git('ls-files', 'test/*.ts')
  .split('\n')
  .filter(Boolean)
  .map((path) => path.slice('test/'.length));
const unknown = files.filter((file) => !classifications[file]);
const missing = Object.keys(classifications).filter(
  (file) => !files.includes(file)
);
if (unknown.length || missing.length) {
  throw new Error(
    `classification drift: unknown=${unknown.join(',')} missing=${missing.join(
      ','
    )}`
  );
}

const records = files.map((file) => {
  const path = `test/${file}`;
  const text = readFileSync(resolve(wordgardRoot, path), 'utf8');
  const source = ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const calls = [];
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'it'
    ) {
      const argument = node.arguments[0];
      const expression = argument
        ? argument.getText(source).replace(/\s+/g, ' ').trim()
        : '<missing name>';
      calls.push({
        expression,
        line:
          source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  return {
    calls,
    category: classifications[file][0],
    file,
    lines: text.match(/\n/g)?.length ?? 0,
    reason: classifications[file][1],
  };
});

const order = (record) => [record.category === 'harness' ? 0 : 1, record.file];
records.sort((left, right) => {
  const [leftGroup, leftFile] = order(left);
  const [rightGroup, rightFile] = order(right);
  return leftGroup - rightGroup || leftFile.localeCompare(rightFile);
});

const counts = Object.fromEntries(
  ['portable', 'portable-mixed', 'plate-owned', 'harness'].map((category) => [
    category,
    records.filter((record) => record.category === category).length,
  ])
);
const totalLines = records.reduce((sum, record) => sum + record.lines, 0);
const totalCalls = records.reduce(
  (sum, record) => sum + record.calls.length,
  0
);
const changedTests = git(
  'diff',
  '--name-only',
  `${baselineCommit}..${sourceCommit}`,
  '--',
  'test'
)
  .split('\n')
  .filter(Boolean);

const inventoryRows = records
  .map(
    ({ category, file, lines, reason }) =>
      `| \`test/${file}\` | ${String(lines).padStart(
        5
      )} | ${category} | ${reason} |`
  )
  .join('\n');
const inventory = `# Wordgard Test Inventory

Source checkout: clean local \`../wordgard\` tree at
\`${sourceCommit}\` on \`main\`, tracking \`origin/main\` from
\`https://code.haverbeke.berlin/wordgard/wordgard.git\`.
License: MIT from \`../wordgard/LICENSE\` and \`../wordgard/package.json\`.

This is an incremental refresh from
\`source_commit=${baselineCommit}\`. The exact test-tree diff contains
${changedTests.length} changed files: ${changedTests
  .map((path) => `\`${path}\``)
  .join(', ')}.

Inventory command:

\`\`\`sh
git -C ../wordgard ls-files 'test/*.ts'
\`\`\`

Accounting: ${records.length} files, ${totalLines.toLocaleString(
  'en-US'
)} lines;
${records.length} classified; ${counts.portable} portable; ${
  counts['portable-mixed']
}
portable-mixed; ${counts['plate-owned']} Plate-owned; ${counts.harness} harness;
0 skip; 0 product-shell; 0 uncertain. The tree contains ${totalCalls}
source-declared \`it(...)\` call sites.

| File | Lines | Category | Why |
| --- | ---: | --- | --- |
${inventoryRows}

## Classification pressure

The three harness files remain negative controls. The new PointSet and RangeSet
files are mixed: endpoint association and change mapping are portable, while the
packed linear containers and RangeSet's non-overlap restriction are not local
API requirements. The three table files remain Plate-owned because their
assertions are product grid policy, not raw selection substrate.
`;

const indexSections = records
  .map(({ calls, category, file }) => {
    const heading = `## \`${file}\` — ${category} — ${calls.length} call sites`;
    if (!calls.length)
      return `${heading}\n\n- N/A: harness-only; no \`it(...)\` declarations.`;
    return `${heading}\n\n${calls
      .map(
        ({ expression, line }) =>
          `- L${line}: \`${expression.replaceAll('`', '\\`')}\``
      )
      .join('\n')}`;
  })
  .join('\n\n');
const index = `# Wordgard Test-Name Index

Source checkout: \`../wordgard\` at
\`${sourceCommit}\`.

This is the complete source-declared \`it(...)\` call-site index for the current
test tree. Dynamic factories keep their source expression and line; the behavior
matrix expands those families. Harness-only files are recorded explicitly.

${indexSections}

## Accounting

- Files indexed: ${records.length}/${records.length}
- Runnable files indexed: ${records.length - counts.harness}/${
  records.length - counts.harness
}
- Declared \`it(...)\` call sites: ${totalCalls}
- Unresolved files: 0
`;

writeFileSync(resolve(harvestRoot, 'inventory.md'), inventory);
writeFileSync(resolve(harvestRoot, 'test-index.md'), index);
process.stdout.write(
  `${JSON.stringify({
    callSites: totalCalls,
    changedTests: changedTests.length,
    files: records.length,
    lines: totalLines,
  })}\n`
);
