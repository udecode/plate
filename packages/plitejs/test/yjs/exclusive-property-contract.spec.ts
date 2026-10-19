import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { authored } from '../../src/authored';
import { history } from '../../src/history';
import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  type EditorStateSchemaApi,
  property,
  RangeApi,
  schema,
  SelectionApi,
} from '../../src/index';
import type { AnyEditor } from '../../src/interfaces/editor';
import { createYjsPeerWithEditor, paragraph } from './support/collaboration';

const ScriptPosition = schema.property.exclusive('plate:script-position');
const ScriptSchema = defineEditorSchema('schema:yjs-script-schema', {
  elements: {
    paragraph: { content: schema.content.text() },
  },
  id: 'yjs-script-schema',
  properties: [
    schema.textProperty('bold', property.boolean()),
    schema.textProperty('subscript', property.boolean(), {
      exclusive: [ScriptPosition],
    }),
    schema.textProperty('superscript', property.boolean(), {
      exclusive: [ScriptPosition],
    }),
  ],
  root: schema.content.type('paragraph'),
  roots: { sidebar: schema.content.type('paragraph') },
  unknown: 'reject',
  version: 1,
});

type Root = 'main' | 'sidebar';

const inRoot = (root: Root) => (root === 'main' ? {} : { root });

const proposing = (editor: AnyEditor, root: Root = 'main') =>
  createEditorView(editor, {
    ...inRoot(root),
    authored: { intent: 'propose' },
  });

const editing = (editor: AnyEditor, root: Root = 'main') =>
  createEditorView(editor, { ...inRoot(root), authored: { intent: 'edit' } });

const proposed = (editor: AnyEditor, root: Root = 'main') =>
  createEditorView(editor, {
    ...inRoot(root),
    authored: { preview: 'proposed' },
  }).read.children();

// Earlier writes can split the first block into several leaves. A range
// starts in the leaf after a boundary and ends in the leaf before it.
const pointAt = (editor: AnyEditor, offset: number, edge: 'end' | 'start') => {
  let rest = offset;

  for (const [index, leaf] of editor.read.children()[0].children.entries()) {
    if (
      rest < leaf.text.length ||
      (edge === 'end' && rest === leaf.text.length)
    ) {
      return { offset: rest, path: [0, index] };
    }
    rest -= leaf.text.length;
  }

  throw new Error(`No offset ${offset} in the first block.`);
};

const selectRange = (editor: AnyEditor, offsets: readonly [number, number]) =>
  editor.update.selection.set(
    SelectionApi.text({
      anchor: pointAt(editor, offsets[0], 'start'),
      focus: pointAt(editor, offsets[1], 'end'),
    })
  );

const selectText = (
  editor: AnyEditor,
  key: 'bold' | 'subscript' | 'superscript',
  offsets: readonly [number, number]
) => {
  selectRange(editor, offsets);
  editor.update.marks.toggle(key);
};

const decide = (
  editor: AnyEditor,
  action: 'accept' | 'reject',
  keep: (authorId: string) => boolean = () => true
) =>
  editor.update.authored.decide({
    action,
    changes: editor.read.authored
      .changes()
      .items.filter((change) => keep(change.authorId)),
  }).status;

describe('plitejs/yjs exclusive property contract', () => {
  for (const root of ['main', 'sidebar'] as const) {
    it(`keeps one script position when a later plain write overlaps a proposal in ${root}`, () => {
      const children =
        root === 'main' ? [paragraph('ABCD')] : [paragraph('Unchanged')];
      const roots =
        root === 'main' ? undefined : { sidebar: [paragraph('ABCD')] };
      const make = (authorId: string, seedUpdate?: Uint8Array) =>
        createYjsPeerWithEditor(
          createEditor({
            plugins: [ScriptSchema, authored({ authorId }), history()],
            initialValue: { children, ...(roots ? { roots } : {}) },
          }),
          { children, roots, clientId: authorId, seedUpdate }
        );
      const alice = make('alice');
      const bob = make('bob', Y.encodeStateAsUpdate(alice.doc));
      selectText(proposing(alice.editor, root), 'subscript', [0, 3]);
      Y.applyUpdate(bob.doc, Y.encodeStateAsUpdate(alice.doc));
      selectText(editing(bob.editor, root), 'superscript', [1, 4]);
      Y.applyUpdate(alice.doc, Y.encodeStateAsUpdate(bob.doc));
      const expected = [
        {
          type: 'paragraph',
          children: [
            { text: 'A', subscript: true },
            { text: 'BCD', superscript: true },
          ],
        },
      ];
      assert.deepEqual(proposed(alice.editor, root), expected);
      assert.deepEqual(proposed(bob.editor, root), expected);
      const restored = createEditor({
        plugins: [ScriptSchema, authored({ authorId: 'reviewer' })],
        initialValue: JSON.parse(JSON.stringify(alice.editor.read.value())),
      });
      assert.deepEqual(proposed(restored, root), expected);
      bob.editor.api.history.undo();
      Y.applyUpdate(alice.doc, Y.encodeStateAsUpdate(bob.doc));
      assert.equal(decide(alice.editor, 'accept'), 'applied');
      assert.deepEqual(alice.editor.read.authored.changes().items, []);
      assert.deepEqual(proposed(alice.editor, root), [
        {
          type: 'paragraph',
          children: [{ text: 'ABC', subscript: true }, { text: 'D' }],
        },
      ]);
      alice.cleanup();
      bob.cleanup();
      alice.doc.destroy();
      bob.doc.destroy();
    });
  }
  for (const root of ['main', 'sidebar'] as const) {
    for (const relation of ['overlap', 'disjoint', 'independent'] as const) {
      it(`accepts a proposal after a later ${relation} plain write in ${root}`, () => {
        const children =
          root === 'main' ? [paragraph('ABCD')] : [paragraph('Unchanged')];
        const roots =
          root === 'main' ? undefined : { sidebar: [paragraph('ABCD')] };
        const make = (authorId: string, seedUpdate?: Uint8Array) =>
          createYjsPeerWithEditor(
            createEditor({
              plugins: [authored({ authorId }), history()],
              initialValue: { children, ...(roots ? { roots } : {}) },
            }),
            { children, roots, clientId: authorId, seedUpdate }
          );
        const alice = make('alice');
        const bob = make('bob', Y.encodeStateAsUpdate(alice.doc));
        const proposal = proposing(alice.editor, root);
        selectRange(proposal, [0, 2]);
        proposal.update.marks.add('tone', 'proposal');
        Y.applyUpdate(bob.doc, Y.encodeStateAsUpdate(alice.doc));
        const plain = editing(bob.editor, root);
        selectRange(plain, [relation === 'disjoint' ? 2 : 1, 4]);
        plain.update.marks.add(
          relation === 'independent' ? 'italic' : 'tone',
          relation === 'independent' ? true : 'accepted'
        );
        Y.applyUpdate(alice.doc, Y.encodeStateAsUpdate(bob.doc));
        const expected =
          relation === 'overlap'
            ? [
                { text: 'A', tone: 'proposal' },
                { text: 'BCD', tone: 'accepted' },
              ]
            : relation === 'disjoint'
              ? [
                  { text: 'AB', tone: 'proposal' },
                  { text: 'CD', tone: 'accepted' },
                ]
              : [
                  { text: 'A', tone: 'proposal' },
                  { text: 'B', tone: 'proposal', italic: true },
                  { text: 'CD', italic: true },
                ];
        const saved = JSON.parse(JSON.stringify(alice.editor.read.value()));
        assert.deepEqual(proposed(alice.editor, root), [
          { type: 'paragraph', children: expected },
        ]);
        assert.equal(decide(alice.editor, 'accept'), 'applied');
        Y.applyUpdate(bob.doc, Y.encodeStateAsUpdate(alice.doc));
        assert.deepEqual(proposed(bob.editor, root), [
          { type: 'paragraph', children: expected },
        ]);
        const restored = createEditor({
          plugins: [authored({ authorId: 'reviewer' })],
          initialValue: saved,
        });
        assert.deepEqual(proposed(restored, root), [
          { type: 'paragraph', children: expected },
        ]);
        alice.cleanup();
        bob.cleanup();
        alice.doc.destroy();
        bob.doc.destroy();
      });
    }
  }
  for (const mode of ['edit', 'propose'] as const) {
    for (const root of ['main', 'sidebar'] as const) {
      it(`preserves three authors through every ${mode} delivery order and a move in ${root}`, () => {
        const children =
          root === 'main'
            ? [paragraph('ABCD'), paragraph('Stay')]
            : [paragraph('Unchanged')];
        const roots =
          root === 'main'
            ? undefined
            : { sidebar: [paragraph('ABCD'), paragraph('Stay')] };
        const make = (authorId: string, seedUpdate?: Uint8Array) => {
          const peer = createYjsPeerWithEditor(
            createEditor({
              plugins: [ScriptSchema, authored({ authorId }), history()],
              initialValue: { children, ...(roots ? { roots } : {}) },
            }),
            { children, roots, clientId: authorId, seedUpdate }
          );
          return {
            ...peer,
            view: createEditorView(peer.editor, {
              ...inRoot(root),
              authored: { intent: mode },
            }),
          };
        };
        const alice = make('alice');
        const seed = Y.encodeStateAsUpdate(alice.doc);
        const vector = Y.encodeStateVector(alice.doc);
        const bob = make('bob', seed);
        const carol = make('carol', seed);
        const authors = [alice, bob, carol];
        selectText(alice.view, 'subscript', [0, 3]);
        selectText(bob.view, 'superscript', [1, 4]);
        selectText(carol.view, 'bold', [2, 4]);
        const alone = authors.map((peer) => proposed(peer.editor, root));
        const updates = authors.map((peer) =>
          Y.encodeStateAsUpdate(peer.doc, vector)
        );
        const orders = [
          [0, 1, 2],
          [0, 2, 1],
          [1, 0, 2],
          [1, 2, 0],
          [2, 0, 1],
          [2, 1, 0],
        ];
        const expected = [
          {
            type: 'paragraph',
            children: [
              { text: 'AB', subscript: true },
              { text: 'C', bold: true, subscript: true },
              { text: 'D', bold: true, superscript: true },
            ],
          },
          paragraph('Stay'),
        ];
        for (const [index, order] of orders.entries()) {
          const peer = make(`reader-${index}`, seed);
          for (const author of order) Y.applyUpdate(peer.doc, updates[author]);
          assert.deepEqual(proposed(peer.editor, root), expected);
          assert.equal(
            peer.editor.read.authored.changes().items.length,
            mode === 'propose' ? 3 : 0
          );
          const saved = JSON.parse(JSON.stringify(peer.editor.read.value()));
          const restore = () =>
            createEditor({
              plugins: [ScriptSchema, authored({ authorId: 'reviewer' })],
              initialValue: saved,
            });
          assert.deepEqual(proposed(restore(), root), expected);
          if (mode === 'propose') {
            for (const [kept, authorId] of [
              'alice',
              'bob',
              'carol',
            ].entries()) {
              const reviewer = restore();
              assert.equal(
                decide(reviewer, 'reject', (author) => author !== authorId),
                'applied'
              );
              assert.deepEqual(proposed(reviewer, root), alone[kept]);
            }
          }
          const follower = make(`follower-${index}`, seed);
          for (const author of [...order].reverse()) {
            Y.applyUpdate(follower.doc, updates[author]);
          }
          peer.view.update.nodes.move({ at: [0], to: [2] });
          Y.applyUpdate(follower.doc, Y.encodeStateAsUpdate(peer.doc));
          assert.deepEqual(proposed(peer.editor, root), [
            expected[1],
            expected[0],
          ]);
          assert.deepEqual(
            proposed(follower.editor, root),
            proposed(peer.editor, root)
          );
          peer.view.update.text.insert('!', {
            at: { path: [peer.view.read.children().length - 1, 0], offset: 0 },
          });
          Y.applyUpdate(follower.doc, Y.encodeStateAsUpdate(peer.doc));
          assert.deepEqual(
            proposed(follower.editor, root),
            proposed(peer.editor, root)
          );
          assert.equal(
            proposed(peer.editor, root)[1]
              .children.map((node) => node.text)
              .join(''),
            '!ABCD'
          );
          follower.cleanup();
          follower.doc.destroy();
          peer.cleanup();
          peer.doc.destroy();
        }
        for (const peer of authors) {
          peer.cleanup();
          peer.doc.destroy();
        }
      });
    }
  }
  for (const mode of ['ordinary', 'edit', 'propose'] as const) {
    for (const range of ['full', 'overlap'] as const) {
      it(`converges concurrent ${mode} exclusive mark writes on ${range} ranges`, () => {
        const make = (authorId: string, seedUpdate?: Uint8Array) =>
          createYjsPeerWithEditor(
            createEditor({
              plugins: [
                ScriptSchema,
                history(),
                ...(mode === 'ordinary' ? [] : [authored({ authorId })]),
              ],
              initialValue: [paragraph('text')],
            }),
            { children: [paragraph('text')], clientId: authorId, seedUpdate }
          );
        const a = make('alice');
        const b = make('bob', Y.encodeStateAsUpdate(a.doc));
        const read = (editor: AnyEditor) =>
          mode === 'ordinary' ? editor.read.children() : proposed(editor);
        const writer = (editor: AnyEditor) =>
          mode === 'propose' ? proposing(editor) : editor;

        selectText(
          writer(a.editor),
          'subscript',
          range === 'full' ? [0, 4] : [0, 3]
        );
        selectText(
          writer(b.editor),
          'superscript',
          range === 'full' ? [0, 4] : [1, 4]
        );
        const aOnly = read(a.editor);
        const bOnly = read(b.editor);
        Y.applyUpdate(a.doc, Y.encodeStateAsUpdate(b.doc));
        Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc));

        const expected = read(a.editor);
        const active = (text: (typeof expected)[number]['children'][number]) =>
          ['subscript', 'superscript'].filter((key) =>
            Object.hasOwn(text, key)
          );

        assert.deepEqual(read(b.editor), expected);
        assert.equal(expected.length, 1);
        assert.equal(
          expected[0].children.map((node) => node.text).join(''),
          'text'
        );
        for (const node of expected[0].children) {
          assert.equal(active(node).length, 1, JSON.stringify(expected));
        }
        const aSchema: EditorStateSchemaApi = a.editor.read.schema;
        const bSchema: EditorStateSchemaApi = b.editor.read.schema;
        aSchema.assertDocument(a.editor.read.value());
        bSchema.assertDocument(b.editor.read.value());
        if (mode !== 'ordinary') {
          for (const peer of [a, b]) {
            const saved = JSON.parse(JSON.stringify(peer.editor.read.value()));
            const restore = () =>
              createEditor({
                plugins: [ScriptSchema, authored({ authorId: 'reviewer' })],
                initialValue: saved,
              });
            const restored = restore();
            assert.deepEqual(proposed(restored), expected);
            const restoredSchema: EditorStateSchemaApi = restored.read.schema;
            restoredSchema.assertDocument({ children: proposed(restored) });
            if (mode === 'propose') {
              for (const authorId of ['alice', 'bob']) {
                const reviewer = restore();
                assert.equal(
                  decide(reviewer, 'reject', (author) => author === authorId),
                  'applied'
                );
                assert.deepEqual(
                  proposed(reviewer),
                  authorId === 'alice' ? bOnly : aOnly
                );
              }
              assert.equal(decide(restored, 'reject'), 'applied');
              assert.deepEqual(proposed(restored), [paragraph('text')]);
            }
          }
          a.editor.api.history.undo();
          assert.deepEqual(read(a.editor), bOnly);
          if (mode === 'edit') {
            const selection = a.editor.read.selection();
            assert.ok(RangeApi.isRange(selection));
            assert.deepEqual(selection.anchor, { path: [0, 0], offset: 0 });
            assert.deepEqual(
              selection.focus,
              range === 'full'
                ? { path: [0, 0], offset: 4 }
                : { path: [0, 1], offset: 2 }
            );
          }
          Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc));
          assert.deepEqual(read(b.editor), bOnly);
          a.editor.api.history.redo();
          assert.deepEqual(read(a.editor), expected);
          Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc));
          assert.deepEqual(read(b.editor), expected);
        }
        a.cleanup();
        b.cleanup();
      });
    }
  }
});
