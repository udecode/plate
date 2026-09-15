import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  DocumentChange,
  NodeApi,
} from 'plitejs';
import {
  authored,
  createAuthoredImportedRevisionChange,
  createAuthoredReviewDocument,
  deserializeAuthoredJson,
  projectAuthoredRange,
  readAuthoredFormatSnapshot,
  serializeAuthoredJson,
  type AuthoredFormatSegment,
} from 'plitejs/authored';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number) => ({ path: [0, 0], offset });
const proposal = { intent: 'propose', projection: 'markup' } as const;
const flatten = (
  segments: readonly AuthoredFormatSegment[]
): readonly AuthoredFormatSegment[] =>
  segments.flatMap((segment) => [segment, ...flatten(segment.children ?? [])]);

describe('authored format snapshot', () => {
  it('materializes accepted, proposed and review projections with stable IDs', () => {
    let authorId = 'alice';
    const editor = createEditor({
      plugins: [authored({ authorId: () => authorId })],
      initialValue: [paragraph('ABCDE')],
    });
    const view = createEditorView(editor, { authored: proposal });

    view.update.text.delete({
      at: { anchor: point(1), focus: point(3) },
    });
    const deletion = editor.read.authored.changes().items[0].id;
    authorId = 'bob';
    view.update.text.insert('!', { at: point(3) });
    const insertion = editor.read.authored
      .changes()
      .items.find((change) => change.authorId === 'bob');
    assert.ok(insertion);
    const snapshot = readAuthoredFormatSnapshot(editor);
    const review = flatten(snapshot.markup.main);

    assert.deepEqual(snapshot.accepted.children, [paragraph('ABCDE')]);
    assert.equal(snapshot.accepted.meta, undefined);
    assert.deepEqual(snapshot.proposed.children, [paragraph('ADE!')]);
    assert.deepEqual(snapshot.review, editor.read.value());
    assert.deepEqual(
      snapshot.changes
        .map(({ authorId: changeAuthorId, id }) => ({
          authorId: changeAuthorId,
          id,
        }))
        .sort((left, right) => left.authorId.localeCompare(right.authorId)),
      [
        { authorId: 'alice', id: deletion },
        { authorId: 'bob', id: insertion.id },
      ]
    );
    assert.deepEqual(
      review
        .filter(({ retained }) => retained)
        .map(({ node, retained }) => ({
          changeId: retained?.changeId,
          kind: retained?.kind,
          text: NodeApi.string(node),
        })),
      [{ changeId: deletion, kind: 'delete', text: 'BC' }]
    );
    assert.ok(
      review.some(
        ({ changeIds, node }) =>
          NodeApi.string(node) === '!' && changeIds.includes(insertion.id)
      )
    );
  });

  it('defaults JSON to accepted content and preserves the review envelope explicitly', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    const view = createEditorView(editor, { authored: proposal });

    view.update.text.insert(' draft', { at: point(4) });
    const accepted = serializeAuthoredJson(editor);
    const review = serializeAuthoredJson(editor, { projection: 'review' });

    assert.deepEqual(deserializeAuthoredJson(accepted.data), {
      children: [paragraph('Base')],
    });
    assert.equal(accepted.diagnostics[0]?.code, 'authored-lossy-projection');
    assert.deepEqual(deserializeAuthoredJson(review.data), editor.read.value());
    assert.deepEqual(review.diagnostics, []);
    assert.throws(
      () => deserializeAuthoredJson('{"children":[{"text":1}]}'),
      /valid document envelope/
    );
  });

  it('builds validated native records from sparse imported revisions', () => {
    const accepted = { children: [paragraph('Base')] };
    const first = { children: [paragraph('Base one')] };
    const second = { children: [paragraph('Base one two')] };
    const document = createAuthoredReviewDocument({
      accepted,
      revisions: [
        {
          authorId: 'Alice',
          change: DocumentChange.between(accepted, first),
          createdAt: 1_700_000_000_000,
          id: 'word-7',
        },
        {
          authorId: 'Bob',
          change: DocumentChange.between(first, second),
          createdAt: 1_700_000_001_000,
          id: 'word-9',
        },
      ],
    });
    const restored = createEditor({
      plugins: [authored({ authorId: 'reader' })],
      initialValue: document,
    });

    assert.deepEqual(
      restored.read.authored.changes().items.map((change) => ({
        authorId: change.authorId,
        createdAt: change.createdAt,
        id: change.id,
      })),
      [
        { authorId: 'Alice', createdAt: 1_700_000_000_000, id: 'word-7' },
        { authorId: 'Bob', createdAt: 1_700_000_001_000, id: 'word-9' },
      ]
    );
    assert.deepEqual(
      createEditorView(restored, {
        authored: { intent: 'propose', projection: 'proposed' },
      }).read.children(),
      [paragraph('Base one two')]
    );
  });

  it('builds sparse imported changes without diffing the full document', () => {
    const source = {
      children: [paragraph('A'), paragraph('B'), paragraph('C')],
    };
    const change = createAuthoredImportedRevisionChange(source, [
      {
        after: [paragraph('B revised')],
        before: [source.children[1]],
        from: 1,
      },
    ]);

    assert.deepEqual(change.apply(source), {
      children: [paragraph('A'), paragraph('B revised'), paragraph('C')],
    });
  });

  it('projects proposed ranges into accepted coordinates', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('ABCDE')],
    });
    const view = createEditorView(editor, { authored: proposal });

    view.update.text.delete({
      at: { anchor: point(1), focus: point(3) },
    });
    view.update.text.insert('!', { at: point(3) });

    assert.deepEqual(
      projectAuthoredRange(
        editor,
        { anchor: point(1), focus: point(2) },
        'accepted'
      ),
      { anchor: point(3), focus: point(4) }
    );
    assert.equal(
      projectAuthoredRange(
        editor,
        { anchor: point(3), focus: point(4) },
        'accepted'
      ),
      null
    );
  });

  it('exposes property counterparts without adding schema metadata to nodes', () => {
    const editor = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Text')],
    });
    const view = createEditorView(editor, { authored: proposal });

    view.update.nodes.set({ bold: true }, { at: [0, 0] });
    const snapshot = readAuthoredFormatSnapshot(editor);

    assert.deepEqual(snapshot.accepted.children, [paragraph('Text')]);
    assert.deepEqual(snapshot.proposed.children, [
      { type: 'paragraph', children: [{ bold: true, text: 'Text' }] },
    ]);
    assert.deepEqual(snapshot.properties, [
      {
        after: { bold: true },
        before: {},
        changeId: snapshot.changes[0].id,
        nodeKind: 'text',
        path: [0, 0],
        root: 'main',
      },
    ]);
  });
});
