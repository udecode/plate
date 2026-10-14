import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

// @ts-expect-error The concrete ESM entry keeps the benchmark and adapter on one Yjs constructor instance.
import * as Y from '../../../packages/plitejs/node_modules/yjs/dist/yjs.mjs';
import {
  createEditor,
  createEditorView,
  type Element,
} from '../../../packages/plitejs/src';
import {
  authored,
  type AuthoredPage,
  type AuthoredQuery,
} from '../../../packages/plitejs/src/authored';
import { yjs } from '../../../packages/plitejs/src/yjs';

type Phase = 'accepted-insertion' | 'proposed-insertion';

const option = (name: string) =>
  process.argv
    .find((argument) => argument.startsWith(`--${name}=`))
    ?.slice(name.length + 3);
const fixturePath = option('fixture');
const outputPath = option('output');
const selectedPhase = option('phase') as Phase | 'both' | undefined;
const pass = Number(option('pass'));
const samples = Number(option('samples'));
const size = Number(option('size'));
const warmups = Number(option('warmups'));
assert.ok(fixturePath && outputPath);
assert.ok(
  selectedPhase === 'accepted-insertion' ||
    selectedPhase === 'proposed-insertion' ||
    selectedPhase === 'both'
);
assert.ok(Number.isInteger(pass) && pass > 0);
assert.ok(Number.isInteger(samples) && samples > 0);
assert.ok(Number.isInteger(size) && size >= samples + warmups);
assert.ok(Number.isInteger(warmups) && warmups >= 0);

const contract = JSON.parse(
  readFileSync(
    'docs/plans/artifacts/native-authored-changes/collaboration-owner-contract.json',
    'utf-8'
  )
) as { budget: { incomingOperations: number } };
const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number, block = 0) => ({
  path: [block, 0],
  offset,
});
const sync = (source: Y.Doc, target: Y.Doc) => {
  Y.applyUpdate(
    target,
    Y.encodeStateAsUpdate(source, Y.encodeStateVector(target))
  );
};
const percentile = (values: readonly number[], ratio: number) => {
  const sorted = [...values].sort((left, right) => left - right);

  return sorted[Math.ceil(sorted.length * ratio) - 1];
};
const summarize = (values: readonly number[]) => ({
  p50: percentile(values, 0.5),
  p95: percentile(values, 0.95),
  p99: percentile(values, 0.99),
  samples: values,
});
// Counts the editor's commits; a receive publishes one.
const countCommits = (editor: {
  subscribeCommit: (listener: () => void) => () => void;
}) => {
  const counter = { count: 0 };
  editor.subscribeCommit(() => {
    counter.count += 1;
  });
  return counter;
};
const pendingCount = (editor: {
  read: { authored: { changes: (query: AuthoredQuery) => AuthoredPage } };
}) => {
  let count = 0;
  let cursor: string | undefined;
  do {
    const page = editor.read.authored.changes({ cursor, limit: 200 });
    count += page.items.length;
    cursor = page.cursor ?? undefined;
  } while (cursor);
  return count;
};

const checkpointJson = readFileSync(fixturePath, 'utf-8');
const primeAcceptedRuntime = () => {
  const primerSize = size >= 10_000 ? 1000 : 100;
  const operations = samples + warmups;
  const started = performance.now();
  const base = Array.from({ length: primerSize }, () => paragraph('Base'));
  const fixture = createEditor({
    plugins: [authored({ authorId: 'primer-fixture' })],
    initialValue: base,
  });
  const fixtureView = createEditorView(fixture, {
    authored: { intent: 'propose' },
  });
  for (let block = 0; block < primerSize; block += 1) {
    fixtureView.update.text.insert('q', { at: point(4, block) });
  }

  const rootName = `authored-collaboration-primer-${pass}`;
  const sourceDoc = new Y.Doc();
  const source = createEditor({
    plugins: [
      authored({ authorId: 'primer-alice' }),
      yjs({ doc: sourceDoc, initialReady: true, rootName, seed: true }),
    ],
    initialValue: JSON.parse(JSON.stringify(fixture.read.value())),
  });
  const receiverDoc = new Y.Doc();
  sync(sourceDoc, receiverDoc);
  const receiver = createEditor({
    plugins: [
      authored({ authorId: 'primer-bob' }),
      yjs({ doc: receiverDoc, initialReady: true, rootName }),
    ],
  });
  const receiverViews = {
    accepted: createEditorView(receiver, { authored: { preview: 'accepted' } }),
    proposed: createEditorView(receiver, { authored: { preview: 'proposed' } }),
  };
  const receiverCommits = countCommits(receiver);
  sync(receiverDoc, sourceDoc);

  for (let block = 0; block < operations; block += 1) {
    source.update.text.insert('x', { at: point(0, block) });
    const beforeOperations = receiverCommits.count;
    sync(sourceDoc, receiverDoc);
    receiverViews.proposed.read.children();
    assert.equal(
      receiverCommits.count - beforeOperations,
      contract.budget.incomingOperations
    );
  }
  assert.equal(pendingCount(receiver), primerSize);
  assert.deepEqual(
    receiverViews.accepted.read.children(),
    base.map((_, index) => paragraph(index < operations ? 'xBase' : 'Base'))
  );
  assert.deepEqual(
    receiverViews.proposed.read.children(),
    base.map((_, index) => paragraph(`${index < operations ? 'x' : ''}Baseq`))
  );

  sourceDoc.destroy();
  receiverDoc.destroy();
  Bun.gc(true);

  return {
    durationMs: performance.now() - started,
    operations,
    size: primerSize,
  };
};
const run = (
  phase: Phase,
  runtimePrimer?: ReturnType<typeof primeAcceptedRuntime>
) => {
  const setupStarted = performance.now();
  const base = Array.from({ length: size }, () => paragraph('Base'));
  const rootName = `authored-collaboration-benchmark-${size}`;
  const sourceDoc = new Y.Doc();
  const source = createEditor({
    plugins: [
      authored({ authorId: 'alice' }),
      yjs({ doc: sourceDoc, initialReady: true, rootName, seed: true }),
    ],
    initialValue: JSON.parse(checkpointJson),
  });
  const sourceView = createEditorView(source, {
    authored: { intent: 'propose' },
  });
  const sourceViews = {
    accepted: createEditorView(source, { authored: { preview: 'accepted' } }),
    proposed: createEditorView(source, { authored: { preview: 'proposed' } }),
  };
  const receiverDoc = new Y.Doc();
  sync(sourceDoc, receiverDoc);
  const receiver = createEditor({
    plugins: [
      authored({ authorId: 'bob' }),
      yjs({ doc: receiverDoc, initialReady: true, rootName }),
    ],
  });
  const receiverViews = {
    accepted: createEditorView(receiver, { authored: { preview: 'accepted' } }),
    proposed: createEditorView(receiver, { authored: { preview: 'proposed' } }),
  };
  const receiverCommits = countCommits(receiver);
  sync(receiverDoc, sourceDoc);
  assert.equal(pendingCount(receiver), size);
  assert.deepEqual(receiverViews.accepted.read.children(), base);
  assert.deepEqual(
    receiverViews.proposed.read.children(),
    Array.from({ length: size }, () => paragraph('Baseq'))
  );
  const setupMs = performance.now() - setupStarted;
  const initialAccepted = receiverViews.accepted.read.value();
  const initialProposed = receiverViews.proposed.read.value();
  const initialAcceptedJson = JSON.stringify(initialAccepted);
  const initialProposedJson = JSON.stringify(initialProposed);
  const durations: number[] = [];
  const bytes: number[] = [];
  const incomingOperations: number[] = [];
  const proposed = phase === 'proposed-insertion';
  let lastUpdate: Uint8Array | undefined;

  for (let sample = -warmups; sample < samples; sample += 1) {
    const block = sample + warmups;
    (proposed ? sourceView : source).update.text.insert('x', {
      at: point(0, block),
    });
    const beforeOperations = receiverCommits.count;
    const started = performance.now();
    const update = Y.encodeStateAsUpdate(
      sourceDoc,
      Y.encodeStateVector(receiverDoc)
    );
    Y.applyUpdate(receiverDoc, update);
    const projected = receiverViews.proposed.read.children();
    const duration = performance.now() - started;
    const operationDelta = receiverCommits.count - beforeOperations;
    assert.equal(operationDelta, contract.budget.incomingOperations);
    lastUpdate = update;

    const count = sample + warmups + 1;
    const expectedAccepted = base.map((_, index) =>
      paragraph(index < count && !proposed ? 'xBase' : 'Base')
    );
    const expectedProposed = base.map((_, index) =>
      paragraph(`${index < count ? 'x' : ''}Baseq`)
    );
    assert.deepEqual(receiverViews.accepted.read.children(), expectedAccepted);
    assert.deepEqual(projected, expectedProposed);
    assert.deepEqual(sourceViews.accepted.read.children(), expectedAccepted);
    assert.deepEqual(sourceViews.proposed.read.children(), expectedProposed);
    assert.equal(pendingCount(receiver), size + (proposed ? count : 0));
    assert.equal(JSON.stringify(initialAccepted), initialAcceptedJson);
    assert.equal(JSON.stringify(initialProposed), initialProposedJson);

    if (sample >= 0) {
      durations.push(duration);
      bytes.push(update.byteLength);
      incomingOperations.push(operationDelta);
    }
  }

  assert.ok(lastUpdate);
  const commitsBeforeDuplicate = receiverCommits.count;
  const acceptedBeforeDuplicate = JSON.stringify(
    receiverViews.accepted.read.value()
  );
  const proposedBeforeDuplicate = JSON.stringify(
    receiverViews.proposed.read.value()
  );
  Y.applyUpdate(receiverDoc, lastUpdate);
  const duplicateUpdateIdempotent =
    receiverCommits.count === commitsBeforeDuplicate &&
    JSON.stringify(receiverViews.accepted.read.value()) ===
      acceptedBeforeDuplicate &&
    JSON.stringify(receiverViews.proposed.read.value()) ===
      proposedBeforeDuplicate;
  assert.equal(duplicateUpdateIdempotent, true);

  const reloadStarted = performance.now();
  const reloaded = createEditor({
    plugins: [authored({ authorId: 'reader' })],
    initialValue: JSON.parse(JSON.stringify(receiver.read.value())),
  });
  const reloadedView = createEditorView(reloaded, {
    authored: { preview: 'proposed' },
  });
  assert.deepEqual(reloaded.read.children(), receiver.read.children());
  assert.deepEqual(
    reloadedView.read.children(),
    receiverViews.proposed.read.children()
  );
  const reloadMs = performance.now() - reloadStarted;

  const row = {
    bytes,
    duplicateUpdateIdempotent,
    incomingOperations,
    pass,
    phase,
    reloadMs,
    runtimePrimer,
    samples: summarize(durations),
    setupMs,
    size,
  };
  process.stdout.write(
    `${JSON.stringify({
      pass,
      phase,
      p95: row.samples.p95,
      p99: row.samples.p99,
      reloadMs,
      setupMs,
      size,
    })}\n`
  );
  sourceDoc.destroy();
  receiverDoc.destroy();
  Bun.gc(true);

  return row;
};

const phases: readonly Phase[] =
  selectedPhase === 'both'
    ? ['proposed-insertion', 'accepted-insertion']
    : [selectedPhase];
let runtimePrimer: ReturnType<typeof primeAcceptedRuntime> | undefined;
const rows = phases.map((phase) => {
  if (phase === 'accepted-insertion' && size >= 1000) {
    runtimePrimer = primeAcceptedRuntime();
  }

  return run(phase, runtimePrimer);
});
writeFileSync(outputPath, `${JSON.stringify(rows, null, 2)}\n`);
