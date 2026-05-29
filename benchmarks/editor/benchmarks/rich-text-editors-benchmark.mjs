import fs from 'node:fs';
import path from 'node:path';

import {
  createRichTextEditorBenchmarkRows,
  editorTargets,
  normalizeBenchmarkResult,
} from '../src/index.mjs';

const args = parseArgs(process.argv.slice(2));
const outPath = args.out || 'benchmarks/results/rich-text-editors-latest.json';
const rows = createRichTextEditorBenchmarkRows({ rootDir: process.cwd() });
const payload = {
  name: 'rich-text-editors',
  generatedAt: new Date().toISOString(),
  node: process.version,
  rows,
};

normalizeBenchmarkResult(payload);

if (args.check) {
  const rowCount = rows.length;
  const okRows = rows.filter((row) => row.status === 'ok').length;
  const targetRows = rows.filter(
    (row) => row.category === 'rich-text-editor-target-coverage'
  );
  const adapterGapRows = rows.filter((row) => row.status === 'adapter-missing');
  const missingRequiredRows = rows.filter(
    (row) => row.status === 'missing-artifact'
  );
  const activeTargets = new Set(editorTargets.map((target) => target.id));
  const forbiddenScopeTerms = [
    'lexical',
    'prosemirror',
    'tiptap',
    'slate:chunk-off',
    'legacychunkoff',
    'runtime-adapter',
  ];
  const unexpectedLibraries = rows.filter((row) => {
    const library = row.library.split(':')[0];
    return !activeTargets.has(library) && library !== 'plate-editor-evidence';
  });
  const unexpectedScopeLabels = rows.filter((row) =>
    forbiddenScopeTerms.some((term) =>
      JSON.stringify(row).toLowerCase().includes(term)
    )
  );

  if (rowCount < 250) {
    throw new Error(
      `expected broad rich-text benchmark coverage, got ${rowCount} rows`
    );
  }
  if (okRows < 180) {
    throw new Error(`expected at least 180 measured ok rows, got ${okRows}`);
  }
  if (targetRows.length !== editorTargets.length) {
    throw new Error(
      `expected ${editorTargets.length} rich-text editor source target rows, got ${targetRows.length}`
    );
  }
  if (adapterGapRows.length > 0) {
    throw new Error(
      `expected no adapter-gap rows in Slate-only scope, got ${adapterGapRows.length}`
    );
  }
  if (unexpectedLibraries.length > 0) {
    throw new Error(
      'unexpected non-Slate libraries in rich-text rows: ' +
        [...new Set(unexpectedLibraries.map((row) => row.library))].join(', ')
    );
  }
  if (unexpectedScopeLabels.length > 0) {
    throw new Error(
      'unexpected out-of-scope labels in rich-text rows: ' +
        [...new Set(unexpectedScopeLabels.map((row) => row.fixture))]
          .slice(0, 10)
          .join(', ')
    );
  }
  if (missingRequiredRows.length > 0) {
    throw new Error(
      'missing required Slate v2 artifacts: ' +
        missingRequiredRows.map((row) => row.fixture).join(', ')
    );
  }
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n');
console.log(`wrote ${outPath} rows=${rows.length}`);

function parseArgs(argv) {
  const out = {};
  let i = 0;

  while (i < argv.length) {
    const arg = argv[i];
    i++;
    if (!arg.startsWith('--')) continue;

    const key = arg.slice(2);
    if (key === 'check') {
      out.check = true;
      continue;
    }

    out[key] = argv[i] || true;
    i++;
  }

  return out;
}
