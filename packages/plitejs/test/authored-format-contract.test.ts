import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  DocumentChange,
  NodeApi,
  schema,
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

import {
  admitAuthoredReviewDocument,
  createAuthoredReviewCheckpoint,
} from '../src/authored/checkpoint';
import { records } from '../src/authored/record-tree';
import { createDetachedEditorSchema } from '../src/core/editor-schema';
import { getCompiledEditorSchema } from '../src/core/plugin-registry';

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

  it('constructs exact imported identities directly and admits the checkpoint', () => {
    const accepted = { children: [paragraph('Base')] };
    const first = { children: [paragraph('Base one')] };
    const second = { children: [paragraph('Base one two')] };
    const revisions = [
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
    ];
    const checked: unknown[] = [];
    const checkpoint = createAuthoredReviewCheckpoint({
      accepted,
      assertTarget: (document) => checked.push(document),
      documentId: 'document-fixture',
      replica: 'import-fixture',
      revisions,
    });
    const admitted = admitAuthoredReviewDocument(checkpoint, {
      assertTarget: (document) => checked.push(document),
    });
    const operations = [...records(admitted.state.operations)].map(
      ([id, operation]) => ({
        authorId: operation.authorId,
        changeId: operation.kind === 'edit' ? operation.changeId : undefined,
        id,
        time: operation.time,
      })
    );

    assert.deepEqual(operations, [
      {
        authorId: 'Alice',
        changeId: 'word-7',
        id: 'import-fixture:1',
        time: 1_700_000_000_000,
      },
      {
        authorId: 'Bob',
        changeId: 'word-9',
        id: 'import-fixture:2',
        time: 1_700_000_001_000,
      },
    ]);
    assert.deepEqual(
      admitted.changes.map(({ authorId, createdAt, id }) => ({
        authorId,
        createdAt,
        id,
      })),
      [
        { authorId: 'Alice', createdAt: 1_700_000_000_000, id: 'word-7' },
        { authorId: 'Bob', createdAt: 1_700_000_001_000, id: 'word-9' },
      ]
    );
    assert.deepEqual(admitted.accepted, accepted);
    assert.deepEqual(admitted.proposed, second);
    assert.equal(checked.length, 5);
    assert.ok(Object.isFrozen(checkpoint));
    assert.ok(Object.isFrozen(admitted.document));
  });

  it('rejects a codec-valid checkpoint attached to contradictory content', () => {
    const accepted = { children: [paragraph('Base')] };
    const proposed = { children: [paragraph('Base one')] };
    const checkpoint = createAuthoredReviewCheckpoint({
      accepted,
      documentId: 'document-fixture',
      replica: 'import-fixture',
      revisions: [
        {
          authorId: 'Alice',
          change: DocumentChange.between(accepted, proposed),
          createdAt: 1_700_000_000_000,
          id: 'word-7',
        },
      ],
    });
    const contradictory = JSON.parse(JSON.stringify(checkpoint));

    contradictory.children = [paragraph('Bose')];

    assert.throws(
      () => admitAuthoredReviewDocument(contradictory),
      /shared-origin text contradicts accepted content/
    );
  });

  it('validates every constructed projection with detached schema authority', () => {
    const ParagraphSchema = defineEditorSchema('schema:authored-import', {
      elements: { paragraph: schema.element.textBlock() },
      id: 'authored-import',
      root: schema.content.type('paragraph', { min: 1 }),
      unknown: 'reject',
      version: 1,
    });
    const accepted = { children: [paragraph('Base')] };
    const compiler = createEditor({
      initialValue: accepted,
      plugins: [ParagraphSchema],
    });
    const detached = createDetachedEditorSchema(
      getCompiledEditorSchema(compiler)
    );
    const invalid = {
      children: [{ children: [{ text: 'Base one' }], type: 'quote' }],
    };

    assert.throws(() =>
      createAuthoredReviewCheckpoint({
        accepted,
        documentId: 'document-fixture',
        replica: 'import-fixture',
        revisions: [
          {
            authorId: 'Alice',
            change: DocumentChange.between(accepted, invalid),
            createdAt: 1_700_000_000_000,
            id: 'word-7',
          },
        ],
        schema: detached,
      })
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
