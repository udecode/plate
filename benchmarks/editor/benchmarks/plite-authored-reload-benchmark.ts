import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { cpus, platform } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEditor, createEditorView } from '../../../packages/plitejs/src';
import {
  authored,
  type AuthoredChange,
  type AuthoredPage,
  type AuthoredQuery,
} from '../../../packages/plitejs/src/authored';

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
// Every pending change, read page by page because a page holds at most 200.
const pendingChanges = (editor: {
  read: { authored: { changes: (query: AuthoredQuery) => AuthoredPage } };
}) => {
  const changes: AuthoredChange[] = [];
  let cursor: string | undefined;
  do {
    const page = editor.read.authored.changes({ cursor, limit: 200 });
    changes.push(...page.items);
    cursor = page.cursor ?? undefined;
  } while (cursor);
  return changes;
};

if (option('mode') === 'seed') {
  const seedStart = performance.now();
  const editor = createEditor({
    plugins: [authored({ authorId: 'fixture' })],
    initialValue: Array.from({ length: size }, () => paragraph('Base')),
  });
  const view = createEditorView(editor, {
    authored: { intent: 'propose' },
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
    authored: { intent: 'propose' },
  });
  const acceptedView = createEditorView(editor, {
    authored: { preview: 'accepted' },
  });
  const proposedView = createEditorView(editor, {
    authored: { preview: 'proposed' },
  });
  const viewed = performance.now();
  const accepted = acceptedView.read.children();
  const proposed = proposedView.read.children();
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
  const queryStart = performance.now();
  const pending = pendingChanges(editor);
  const queried = performance.now();
  assert.equal(pending.length, size + (phase === 'proposed' ? 55 : 0));
  const selected = pending[0];
  assert.ok(selected);
  const detailStart = performance.now();
  const details = editor.read.authored.details(selected.id);
  const detailed = performance.now();
  assert.ok(details);
  assert.equal(details.change.id, selected.id);
  assert.ok(details.parts.length > 0);
  const cachedDetailStart = performance.now();
  assert.deepEqual(editor.read.authored.details(selected.id), details);
  const cachedDetailRead = performance.now();
  const last = size - 1;
  const visibleRange = {
    anchor: { path: [last, 0], offset: 0 },
    focus: { path: [last, 1], offset: 1 },
  };
  const changesAt = (at: typeof visibleRange) => {
    const found: unknown[] = [];

    for (let cursor: string | undefined; ;) {
      const page = view.read.authored.changes({ at, cursor, limit: 200 });

      found.push(...page.items);
      if (!page.cursor) return found;
      ({ cursor } = page);
    }
  };
  const localizedStart = performance.now();
  const localized = changesAt(visibleRange);
  const localizedAt = performance.now();
  assert.ok(localized.length > 0);
  const cachedLocalizedStart = performance.now();
  assert.deepEqual(changesAt(visibleRange), localized);
  const cachedLocalizedAt = performance.now();
  const editStart = performance.now();
  view.update.text.insert('!', { at: { path: [last, 1], offset: 1 } });
  const edited = performance.now();
  assert.deepEqual(proposedView.read.children()[last], paragraph('Baseq!'));
  const updatedRange = {
    ...visibleRange,
    focus: { path: [last, 2], offset: 1 },
  };
  const updatedLocalizedStart = performance.now();
  assert.ok(changesAt(updatedRange).length > 0);
  const updatedLocalizedAt = performance.now();
  assert.deepEqual(acceptedView.read.children(), accepted);
  const saveStart = performance.now();
  const saved = JSON.stringify(editor.read.value());
  const savedAt = performance.now();
  const decisionStart = performance.now();
  const decision = editor.update.authored.decide({
    action: 'accept',
    changes: [selected],
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
      'pass: complete accepted/proposed content, counts, pending selection, lazy semantic detail read twice with equal results, and continued proposed input',
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
