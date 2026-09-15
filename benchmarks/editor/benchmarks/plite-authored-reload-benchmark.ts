import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { cpus, platform } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEditor, createEditorView } from '../../../packages/plitejs/src';
import { authored } from '../../../packages/plitejs/src/authored';
import { authoredState } from '../../../packages/plitejs/src/authored/state';

const option = (name: string) =>
  process.argv
    .find((arg) => arg.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
const fixture = option('fixture');
const output = option('output');
const size = Number(option('size') ?? 10_000);
const phase = option('phase') ?? 'proposed';
const sourceManifest = option('source-manifest');
const sourcePaths = execFileSync(
  'rg',
  [
    '--files',
    'packages/plitejs/src',
    'config/plite-source-aliases.ts',
    'config/workspace-source-entries.mjs',
    'pnpm-lock.yaml',
    'benchmarks/editor/benchmarks/plite-authored-reload-benchmark.ts',
  ],
  { encoding: 'utf-8' }
)
  .trim()
  .split('\n')
  .sort();
const fingerprint = () =>
  sourcePaths.map((path) => ({
    path,
    sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
  }));
if (option('mode') === 'build') {
  assert.ok(output);
  const sources = fingerprint();
  execFileSync('bun', [
    'build',
    fileURLToPath(import.meta.url),
    '--target=node',
    '--outfile',
    output,
  ]);
  assert.deepEqual(fingerprint(), sources);
  writeFileSync(
    `${output}.sources.json`,
    JSON.stringify(
      {
        bundle: resolve(output),
        sha256: createHash('sha256').update(readFileSync(output)).digest('hex'),
        sources,
      },
      null,
      2
    )
  );
  process.exit(0);
}
assert.ok(fixture);
assert.ok(phase === 'proposed' || phase === 'accepted');
const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (block: number, offset: number) => ({ path: [block, 0], offset });

if (option('mode') === 'seed') {
  const seedStart = performance.now();
  const editor = createEditor({
    plugins: [authored({ authorId: 'fixture' })],
    initialValue: Array.from({ length: size }, () => paragraph('Base')),
  });
  const view = createEditorView(editor, {
    authored: { intent: 'propose', projection: 'proposed' },
  });
  for (let block = 0; block < size; block++) {
    view.update.text.insert('q', { at: point(block, 4) });
  }
  for (let block = 0; block < 55; block++) {
    (phase === 'proposed' ? view : editor).update.text.insert('x', {
      at: point(block, 0),
    });
  }
  const json = JSON.stringify(editor.read.value());
  writeFileSync(fixture, json);
  console.log(
    JSON.stringify({
      size,
      phase,
      seedMs: performance.now() - seedStart,
      bytes: json.length,
    })
  );
} else {
  assert.ok(output);
  const built = sourceManifest
    ? JSON.parse(readFileSync(sourceManifest, 'utf-8'))
    : undefined;
  const bundleHash = () =>
    createHash('sha256')
      .update(readFileSync(fileURLToPath(import.meta.url)))
      .digest('hex');
  if (built) {
    assert.equal(fileURLToPath(import.meta.url), built.bundle);
    assert.equal(bundleHash(), built.sha256);
  }
  const sourceBefore = built?.sources ?? fingerprint();
  const text = readFileSync(fixture, 'utf-8');
  const fixtureSha256 = createHash('sha256').update(text).digest('hex');
  const start = performance.now();
  const initialValue = JSON.parse(text);
  const parsed = performance.now();
  const editor = createEditor({
    plugins: [authored({ authorId: 'reader' })],
    initialValue,
  });
  const constructed = performance.now();
  const view = createEditorView(editor, {
    authored: { intent: 'propose', projection: 'proposed' },
  });
  const viewed = performance.now();
  const accepted = editor.read.children();
  const proposed = view.read.children();
  const read = performance.now();
  assert.deepEqual(
    accepted,
    Array.from({ length: size }, (_, index) =>
      paragraph(`${phase === 'accepted' && index < 55 ? 'x' : ''}Base`)
    )
  );
  assert.deepEqual(
    proposed,
    Array.from({ length: size }, (_, index) =>
      paragraph(`${index < 55 ? 'x' : ''}Baseq`)
    )
  );
  assert.equal(editor.read.getField(authoredState).changes?.count, size + 55);
  assert.equal(
    editor.read.getField(authoredState).operations?.count,
    size + 55
  );
  const queryStart = performance.now();
  const selection = editor.read.authored.select({ status: 'pending' });
  const queried = performance.now();
  assert.equal(
    selection.changes.length,
    size + (phase === 'proposed' ? 55 : 0)
  );
  const selected = selection.changes[0];
  assert.ok(selected);
  const detailStart = performance.now();
  const details = editor.read.authored.details(selected.id);
  const detailed = performance.now();
  assert.ok(details);
  assert.equal(details.change.id, selected.id);
  assert.equal(details.parts.status, 'available');
  const cachedDetailStart = performance.now();
  assert.equal(editor.read.authored.details(selected.id), details);
  const cachedDetailRead = performance.now();
  const visibleRange = {
    anchor: point(0, size - 1),
    focus: point(5, size - 1),
  };
  const localizedStart = performance.now();
  const localized = view.read.authored.changesAt(visibleRange);
  const localizedAt = performance.now();
  assert.ok(localized.length > 0);
  const cachedLocalizedStart = performance.now();
  assert.deepEqual(view.read.authored.changesAt(visibleRange), localized);
  const cachedLocalizedAt = performance.now();
  const editStart = performance.now();
  view.update.text.insert('!', { at: point(size - 1, 5) });
  const edited = performance.now();
  assert.deepEqual(view.read.children()[size - 1], paragraph('Baseq!'));
  const updatedRange = {
    ...visibleRange,
    focus: point(6, size - 1),
  };
  const updatedLocalizedStart = performance.now();
  assert.ok(view.read.authored.changesAt(updatedRange).length > 0);
  const updatedLocalizedAt = performance.now();
  assert.deepEqual(editor.read.children(), accepted);
  const saveStart = performance.now();
  const saved = JSON.stringify(editor.read.value());
  const savedAt = performance.now();
  const decisionStart = performance.now();
  const decision = editor.update.authored.decide({
    action: 'accept',
    selection: {
      changes: [selected],
      documentId: selection.documentId,
    },
  });
  const decided = performance.now();
  assert.equal(decision.status, 'applied');
  if (built) assert.equal(bundleHash(), built.sha256);
  const sourceAfter = built?.sources ?? fingerprint();
  assert.deepEqual(sourceAfter, sourceBefore);
  const result = {
    size,
    phase,
    fixtureSha256,
    fixtureBytes: text.length,
    environment: {
      bun: process.versions.bun,
      node: process.versions.node,
      cpu: cpus()[0]?.model,
      platform: platform(),
    },
    bundle: built ? { path: built.bundle, sha256: built.sha256 } : undefined,
    timings: {
      parseMs: parsed - start,
      constructMs: constructed - parsed,
      viewMs: viewed - constructed,
      readMs: read - viewed,
      totalMs: read - start,
      queryMs: queried - queryStart,
      detailMs: detailed - detailStart,
      cachedDetailMs: cachedDetailRead - cachedDetailStart,
      localizedMs: localizedAt - localizedStart,
      cachedLocalizedMs: cachedLocalizedAt - cachedLocalizedStart,
      firstEditMs: edited - editStart,
      updatedLocalizedMs: updatedLocalizedAt - updatedLocalizedStart,
      saveMs: savedAt - saveStart,
      decisionMs: decided - decisionStart,
    },
    savedBytes: saved.length,
    correctness:
      'pass: complete accepted/proposed content, counts, pending selection, lazy semantic detail with cached identity, and continued proposed input',
    sourceBefore,
    sourceAfter,
    sourcesUnchanged: true,
  };
  writeFileSync(output, JSON.stringify(result, null, 2));
  console.log(
    JSON.stringify({
      ...result,
      sourceBefore: undefined,
      sourceAfter: undefined,
    })
  );
}
