import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { fileURLToPath } from 'node:url';

import {
  addSuggestionMarks,
  suggestChanges,
} from '@handlewithcare/prosemirror-suggest-changes';
import { Change, ChangeSet } from 'prosemirror-changeset';
import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';

import { createEditor, createEditorView } from '../../../packages/plitejs/src';
import { authored } from '../../../packages/plitejs/src/authored';
import { authoredState } from '../../../packages/plitejs/src/authored/state';
import { snapshotEditorJsonValue } from '../../../packages/plitejs/src/core/value-codec';

const option = (key: string) =>
  process.argv
    .find((arg) => arg.startsWith(`--${key}=`))
    ?.slice(key.length + 3);
const arm = option('arm') ?? 'plite-authored';
const size = Number(option('size') ?? 10_000);
const fixture = option('fixture');
const output = option('output');
assert.ok(fixture && output);
assert.ok(Number.isSafeInteger(size) && size >= 55);
const artifactPath = fileURLToPath(import.meta.url);
const digest = (text: string | Uint8Array) =>
  createHash('sha256').update(text).digest('hex');
const manifest = JSON.parse(
  readFileSync(`${artifactPath}.sources.json`, 'utf-8')
);
assert.equal(digest(readFileSync(artifactPath)), manifest.bundleSha256);
const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const pmParagraph = (text: string) => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
});
const nativeText = readFileSync(fixture, 'utf-8');
const base = Array.from({ length: size }, () => paragraph('Base'));
const proposed = Array.from({ length: size }, (_, i) =>
  paragraph(`${i < 55 ? 'x' : ''}Baseq`)
);
const expectedBase = 'Base'.repeat(size);
const expectedProposed = proposed.map((p) => p.children[0].text).join('');
const schema = new Schema({
  nodes: {
    doc: { content: 'paragraph+' },
    paragraph: { content: 'text*' },
    text: {},
  },
  marks: addSuggestionMarks(
    {},
    {
      authorId: {
        spec: { validate: 'string' },
        toDOM: (value) => ({ 'data-author-id': value }),
        parseDOM: (node) => node.getAttribute('data-author-id'),
      },
    }
  ),
});
const mark = (id: number) => ({
  type: 'insertion',
  attrs: { id, authorId: 'fixture' },
});
const pmBase = {
  type: 'doc',
  content: Array.from({ length: size }, () => pmParagraph('Base')),
};
const pmProposed = {
  type: 'doc',
  content: proposed.map((p) => pmParagraph(p.children[0].text)),
};
const marked = {
  type: 'doc',
  content: Array.from({ length: size }, (_, i) => ({
    type: 'paragraph',
    content: [
      ...(i < 55
        ? [{ type: 'text', text: 'x', marks: [mark(size + i + 1)] }]
        : []),
      { type: 'text', text: 'Base' },
      { type: 'text', text: 'q', marks: [mark(i + 1)] },
    ],
  })),
};
const changes = Array.from({ length: size }, (_, i) => {
  const startA = 6 * i + 1;
  const startB = 7 * i + Math.min(i, 55) + 1;
  return [
    ...(i < 55
      ? [
          {
            fromA: startA,
            toA: startA,
            fromB: startB,
            toB: startB + 1,
            deleted: [],
            inserted: [
              { length: 1, data: { id: size + i + 1, authorId: 'fixture' } },
            ],
          },
        ]
      : []),
    {
      fromA: startA + 4,
      toA: startA + 4,
      fromB: startB + 4 + Number(i < 55),
      toB: startB + 5 + Number(i < 55),
      deleted: [],
      inserted: [{ length: 1, data: { id: i + 1, authorId: 'fixture' } }],
    },
  ];
}).flat();
const encoded = arm.startsWith('plite')
  ? arm === 'plite-plain' || arm === 'plite-empty-authored'
    ? JSON.stringify({ children: base })
    : nativeText
  : JSON.stringify(
      arm === 'pm-plain'
        ? pmBase
        : arm === 'pm-marks'
          ? marked
          : { base: pmBase, current: pmProposed, changes }
    );
const durations = new Map<string, { calls: number; ms: number }>();
if (option('profile') === 'core') {
  Object.assign(globalThis, {
    __EDITOR_REACT_RENDER_PROFILER__: {
      record: ({ id, duration }: { id: string; duration: number }) => {
        const row = durations.get(id) ?? { calls: 0, ms: 0 };
        row.calls += 1;
        row.ms += duration;
        durations.set(id, row);
      },
    },
  });
}
const started = performance.now();
const decoded = JSON.parse(encoded);
const parsed = performance.now();
let constructed = parsed;
let read = parsed;
let checked = parsed;
let correctness: () => void;
if (arm === 'plite-snapshot') {
  const owned = snapshotEditorJsonValue(decoded, 'Reload diagnostic');
  constructed = performance.now();
  read = constructed;
  checked = constructed;
  correctness = () => {
    assert.deepEqual(owned, decoded);
    assert.ok(Object.isFrozen(owned));
  };
} else if (arm.startsWith('plite')) {
  const editor = createEditor({
    initialValue: decoded,
    ...(arm === 'plite-plain'
      ? {}
      : { plugins: [authored({ authorId: 'reader' })] }),
  });
  constructed = performance.now();
  checked = constructed;
  const view =
    arm === 'plite-authored'
      ? createEditorView(editor, {
          authored: { intent: 'propose', projection: 'proposed' },
        })
      : undefined;
  const accepted = editor.read.children();
  const projected = view?.read.children();
  read = performance.now();
  correctness = () => {
    assert.deepEqual(accepted, base);
    if (view) {
      assert.deepEqual(projected, proposed);
      assert.equal(
        editor.read.getField(authoredState).operations?.count,
        size + 55
      );
      assert.equal(
        editor.read.authored.select({ status: 'pending' }).changes.length,
        size + 55
      );
      view.update.text.insert('!', { at: { path: [size - 1, 0], offset: 5 } });
      assert.deepEqual(view.read.children()[size - 1], paragraph('Baseq!'));
      assert.deepEqual(editor.read.children(), accepted);
    } else {
      editor.update.text.insert('!', {
        at: { path: [size - 1, 0], offset: 4 },
      });
      assert.deepEqual(editor.read.children()[size - 1], paragraph('Base!'));
    }
  };
} else {
  const baseDoc =
    arm === 'pm-changeset' ? schema.nodeFromJSON(decoded.base) : undefined;
  const doc = schema.nodeFromJSON(
    arm === 'pm-changeset' ? decoded.current : decoded
  );
  constructed = performance.now();
  baseDoc?.check();
  doc.check();
  const plugin = suggestChanges();
  const state = EditorState.create({
    schema,
    doc,
    plugins: arm === 'pm-marks' ? [plugin] : [],
  });
  const changeSet = baseDoc
    ? ChangeSet.create(
        baseDoc,
        undefined,
        undefined,
        decoded.changes.map(Change.fromJSON)
      )
    : undefined;
  checked = performance.now();
  let acceptedText = baseDoc?.textContent ?? '';
  let proposedText = '';
  const ids = new Set<number>();
  doc.descendants((node) => {
    if (!node.isText) return;
    proposedText += node.text;
    const insertion = node.marks.find((m) => m.type.name === 'insertion');
    if (insertion) {
      ids.add(insertion.attrs.id);
      assert.equal(insertion.attrs.authorId, 'fixture');
    } else if (!baseDoc) acceptedText += node.text;
  });
  if (arm === 'pm-marks') plugin.props.decorations?.call(plugin, state);
  read = performance.now();
  correctness = () => {
    assert.equal(acceptedText, expectedBase);
    assert.equal(
      proposedText,
      arm === 'pm-plain' ? expectedBase : expectedProposed
    );
    if (arm === 'pm-marks') assert.equal(ids.size, size + 55);
    if (changeSet) {
      assert.equal(changeSet.changes.length, size + 55);
      for (const change of changeSet.changes) {
        assert.equal(change.fromA, change.toA);
        assert.equal(change.toB - change.fromB, 1);
        assert.match(doc.textBetween(change.fromB, change.toB), /^[xq]$/);
        assert.equal(change.inserted[0].data.authorId, 'fixture');
      }
    }
    const next = state.apply(
      state.tr.insertText('!', state.doc.content.size - 1)
    );
    assert.equal(next.doc.textContent, `${proposedText}!`);
    assert.equal(state.doc.textContent, proposedText);
  };
}
const profile = [...durations].sort((a, b) => b[1].ms - a[1].ms);
correctness();
assert.equal(digest(readFileSync(artifactPath)), manifest.bundleSha256);
const result = {
  arm,
  size,
  fixtureBytes: Buffer.byteLength(encoded),
  fixtureSha256: digest(encoded),
  nativeFixtureSha256: digest(nativeText),
  bundleSha256: manifest.bundleSha256,
  environment: {
    bun: process.versions.bun,
    node: process.versions.node,
    cpu: cpus()[0]?.model,
  },
  timings: {
    parseMs: parsed - started,
    constructMs: constructed - parsed,
    checkAndStateMs: checked - constructed,
    readMs: read - checked,
    totalMs: read - started,
  },
  coreProfile: profile,
  correctness:
    'pass: full text, available attribution/change counts and continued edit; immutable previous content',
};
writeFileSync(output, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
