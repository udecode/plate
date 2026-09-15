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

const selectText = (
  editor: AnyEditor,
  key: 'bold' | 'subscript' | 'superscript',
  offsets: readonly [number, number]
) => {
  editor.update.selection.set(
    SelectionApi.text({
      anchor: { offset: offsets[0], path: [0, 0] },
      focus: { offset: offsets[1], path: [0, 0] },
    })
  );
  editor.update.marks.toggle(key);
};

describe('plitejs/yjs exclusive property contract', () => {
  for (const root of ['main', 'sidebar'] as const) {
    for (const empty of [false, true]) {
      it(`preserves a causally later accepted exclusive mark on ${empty ? 'empty text' : 'overlapping text'} in ${root}`, () => {
        const initial = empty ? '' : 'ABCD';
        const children =
          root === 'main' ? [paragraph(initial)] : [paragraph('Unchanged')];
        const roots =
          root === 'main' ? undefined : { sidebar: [paragraph(initial)] };
        const make = (authorId: string, seedUpdate?: Uint8Array) =>
          createYjsPeerWithEditor(
            createEditor({
              plugins: [
                ScriptSchema,
                authored({ authorId, retainHistory: true }),
                history(),
              ],
              initialValue: { children, ...(roots ? { roots } : {}) },
            }),
            { children, roots, clientId: authorId, seedUpdate }
          );
        const alice = make('alice');
        const bob = make('bob', Y.encodeStateAsUpdate(alice.doc));
        const proposal = createEditorView(alice.editor, {
          ...(root === 'main' ? {} : { root }),
          authored: { intent: 'propose', projection: 'proposed' },
        });
        const accepted = createEditorView(bob.editor, {
          ...(root === 'main' ? {} : { root }),
          authored: { intent: 'edit', projection: 'accepted' },
        });
        if (empty) {
          proposal.update.nodes.set({ subscript: true }, { at: [0, 0] });
        } else selectText(proposal, 'subscript', [0, 3]);
        const { id } = alice.editor.read.authored.changes().items[0];
        Y.applyUpdate(bob.doc, Y.encodeStateAsUpdate(alice.doc));
        if (empty) {
          accepted.update.nodes.set({ superscript: true }, { at: [0, 0] });
        } else selectText(accepted, 'superscript', [1, 4]);
        Y.applyUpdate(alice.doc, Y.encodeStateAsUpdate(bob.doc));
        const expected = [
          {
            type: 'paragraph',
            children: empty
              ? [{ text: '', superscript: true }]
              : [
                  { text: 'A', subscript: true },
                  { text: 'BCD', superscript: true },
                ],
          },
        ];
        assert.deepEqual(proposal.read.children(), expected);
        const acceptedId = alice.editor.read.authored.changes({
          authorId: 'bob',
        }).items[0].id;
        const decision = {
          action: 'accept' as const,
          selection: alice.editor.read.authored.select({ ids: [id] }),
        };
        const blocked = {
          status: 'blocked',
          ids: [id],
          dependencies: [],
          dependants: [],
          conflicts: [acceptedId],
        };
        const before = JSON.stringify(alice.editor.read.value());
        assert.deepEqual(alice.editor.read.authored.preview(decision), blocked);
        assert.deepEqual(
          alice.editor.update.authored.decide(decision),
          blocked
        );
        assert.equal(JSON.stringify(alice.editor.read.value()), before);
        const restored = createEditor({
          plugins: [ScriptSchema, authored({ authorId: 'reviewer' })],
          initialValue: JSON.parse(before),
        });
        assert.deepEqual(
          createEditorView(restored, {
            ...(root === 'main' ? {} : { root }),
            authored: { intent: 'propose', projection: 'proposed' },
          }).read.children(),
          expected
        );
        bob.editor.update.history.undo();
        Y.applyUpdate(alice.doc, Y.encodeStateAsUpdate(bob.doc));
        assert.equal(
          alice.editor.update.authored.decide({
            action: 'accept',
            selection: alice.editor.read.authored.select({ ids: [id] }),
          }).status,
          'applied'
        );
        assert.deepEqual(proposal.read.children(), [
          {
            type: 'paragraph',
            children: empty
              ? [{ text: '', subscript: true }]
              : [{ text: 'ABC', subscript: true }, { text: 'D' }],
          },
        ]);
        alice.cleanup();
        bob.cleanup();
        alice.doc.destroy();
        bob.doc.destroy();
      });
    }
  }
  for (const root of ['main', 'sidebar'] as const) {
    for (const relation of ['overlap', 'disjoint', 'independent'] as const) {
      it(`checks later accepted text scopes before accepting a ${relation} proposal in ${root}`, () => {
        const children =
          root === 'main' ? [paragraph('ABCD')] : [paragraph('Unchanged')];
        const roots =
          root === 'main' ? undefined : { sidebar: [paragraph('ABCD')] };
        const make = (authorId: string, seedUpdate?: Uint8Array) =>
          createYjsPeerWithEditor(
            createEditor({
              plugins: [authored({ authorId, retainHistory: true }), history()],
              initialValue: { children, ...(roots ? { roots } : {}) },
            }),
            { children, roots, clientId: authorId, seedUpdate }
          );
        const alice = make('alice');
        const bob = make('bob', Y.encodeStateAsUpdate(alice.doc));
        const proposal = createEditorView(alice.editor, {
          ...(root === 'main' ? {} : { root }),
          authored: { intent: 'propose', projection: 'proposed' },
        });
        const accepted = createEditorView(bob.editor, {
          ...(root === 'main' ? {} : { root }),
          authored: { intent: 'edit', projection: 'accepted' },
        });
        proposal.update.selection.set(
          SelectionApi.text({
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 2 },
          })
        );
        proposal.update.marks.add('tone', 'proposal');
        const { id } = alice.editor.read.authored.changes().items[0];
        Y.applyUpdate(bob.doc, Y.encodeStateAsUpdate(alice.doc));
        accepted.update.selection.set(
          SelectionApi.text({
            anchor: { path: [0, 0], offset: relation === 'disjoint' ? 2 : 1 },
            focus: { path: [0, 0], offset: 4 },
          })
        );
        accepted.update.marks.add(
          relation === 'independent' ? 'italic' : 'tone',
          relation === 'independent' ? true : 'accepted'
        );
        Y.applyUpdate(alice.doc, Y.encodeStateAsUpdate(bob.doc));
        const acceptedId = alice.editor.read.authored.changes({
          authorId: 'bob',
        }).items[0].id;
        const before = JSON.stringify(alice.editor.read.value());
        const decision = {
          action: 'accept' as const,
          selection: alice.editor.read.authored.select({ ids: [id] }),
        };
        const result =
          relation === 'overlap'
            ? {
                status: 'blocked',
                ids: [id],
                dependencies: [],
                dependants: [],
                conflicts: [acceptedId],
              }
            : { status: 'applied', ids: [id] };
        assert.deepEqual(alice.editor.read.authored.preview(decision), result);
        assert.deepEqual(alice.editor.update.authored.decide(decision), result);
        if (relation === 'overlap') {
          assert.equal(JSON.stringify(alice.editor.read.value()), before);
        }
        Y.applyUpdate(bob.doc, Y.encodeStateAsUpdate(alice.doc));
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
        assert.deepEqual(proposal.read.children(), [
          { type: 'paragraph', children: expected },
        ]);
        const restored = createEditor({
          plugins: [authored({ authorId: 'reviewer' })],
          initialValue: JSON.parse(JSON.stringify(alice.editor.read.value())),
        });
        assert.deepEqual(
          createEditorView(restored, {
            ...(root === 'main' ? {} : { root }),
            authored: { intent: 'propose', projection: 'proposed' },
          }).read.children(),
          proposal.read.children()
        );
        alice.cleanup();
        bob.cleanup();
        alice.doc.destroy();
        bob.doc.destroy();
      });
    }
  }
  for (const mode of ['accepted', 'proposed'] as const) {
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
              plugins: [
                ScriptSchema,
                authored({ authorId, retainHistory: true }),
                history(),
              ],
              initialValue: { children, ...(roots ? { roots } : {}) },
            }),
            { children, roots, clientId: authorId, seedUpdate }
          );
          return {
            ...peer,
            view: createEditorView(peer.editor, {
              ...(root === 'main' ? {} : { root }),
              authored:
                mode === 'proposed'
                  ? { intent: 'propose', projection: 'proposed' }
                  : { intent: 'edit', projection: 'accepted' },
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
        const alone = authors.map((peer) => peer.view.read.children());
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
          assert.deepEqual(peer.view.read.children(), expected);
          assert.equal(peer.editor.read.authored.changes().items.length, 3);
          const saved = JSON.parse(JSON.stringify(peer.editor.read.value()));
          const restore = () => {
            const editor = createEditor({
              plugins: [
                ScriptSchema,
                authored({ authorId: 'reviewer', retainHistory: true }),
              ],
              initialValue: saved,
            });
            return {
              editor,
              view: createEditorView(editor, {
                ...(root === 'main' ? {} : { root }),
                authored: { intent: 'propose', projection: 'proposed' },
              }),
            };
          };
          assert.deepEqual(restore().view.read.children(), expected);
          if (mode === 'proposed') {
            for (const [kept, authorId] of [
              'alice',
              'bob',
              'carol',
            ].entries()) {
              const reviewer = restore();
              const ids = reviewer.editor.read.authored
                .changes()
                .items.filter((change) => change.authorId !== authorId)
                .map((change) => change.id);
              assert.equal(
                reviewer.editor.update.authored.decide({
                  action: 'reject',
                  selection: reviewer.editor.read.authored.select({ ids }),
                }).status,
                'applied'
              );
              assert.deepEqual(reviewer.view.read.children(), alone[kept]);
            }
          }
          const follower = make(`follower-${index}`, seed);
          for (const author of [...order].reverse()) {
            Y.applyUpdate(follower.doc, updates[author]);
          }
          peer.view.update.nodes.move({ at: [0], to: [2] });
          Y.applyUpdate(follower.doc, Y.encodeStateAsUpdate(peer.doc));
          assert.deepEqual(peer.view.read.children(), [
            expected[1],
            expected[0],
          ]);
          assert.deepEqual(
            follower.view.read.children(),
            peer.view.read.children()
          );
          peer.view.update.text.insert('!', {
            at: { path: [1, 0], offset: 0 },
          });
          Y.applyUpdate(follower.doc, Y.encodeStateAsUpdate(peer.doc));
          assert.deepEqual(
            follower.view.read.children(),
            peer.view.read.children()
          );
          assert.equal(
            peer.view.read
              .children()[1]
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
  for (const mode of ['ordinary', 'accepted', 'proposed'] as const) {
    for (const range of mode === 'ordinary'
      ? (['full'] as const)
      : (['full', 'overlap'] as const)) {
      it(`converges concurrent ${mode} exclusive mark writes on ${range} ranges`, () => {
        const a = createYjsPeerWithEditor(
          createEditor({
            plugins: [
              ScriptSchema,
              history(),
              ...(mode === 'ordinary' ? [] : [authored({ authorId: 'alice' })]),
            ],
            initialValue: [paragraph('text')],
          }),
          {
            children: [paragraph('text')],
            clientId: 'a',
          }
        );
        const b = createYjsPeerWithEditor(
          createEditor({
            plugins: [
              ScriptSchema,
              history(),
              ...(mode === 'ordinary' ? [] : [authored({ authorId: 'bob' })]),
            ],
            initialValue: [paragraph('text')],
          }),
          {
            children: [paragraph('text')],
            clientId: 'b',
            seedUpdate: Y.encodeStateAsUpdate(a.doc),
          }
        );

        const aView =
          mode === 'proposed'
            ? createEditorView(a.editor, {
                authored: { intent: 'propose', projection: 'proposed' },
              })
            : a.editor;
        const bView =
          mode === 'proposed'
            ? createEditorView(b.editor, {
                authored: { intent: 'propose', projection: 'proposed' },
              })
            : b.editor;
        selectText(aView, 'subscript', range === 'full' ? [0, 4] : [0, 3]);
        selectText(bView, 'superscript', range === 'full' ? [0, 4] : [1, 4]);
        const aOnly = aView.read.children();
        const bOnly = bView.read.children();
        Y.applyUpdate(a.doc, Y.encodeStateAsUpdate(b.doc));
        Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc));

        const aText = aView.read.children()[0].children[0];
        const bText = bView.read.children()[0].children[0];
        const active = (text: typeof aText) =>
          ['subscript', 'superscript'].filter((key) =>
            Object.hasOwn(text, key)
          );

        assert.deepEqual(aText, bText);
        assert.deepEqual(aView.read.children(), bView.read.children());
        assert.equal(aView.read.children().length, 1);
        assert.equal(
          aView.read
            .children()[0]
            .children.map((node) => node.text)
            .join(''),
          'text'
        );
        for (const node of aView.read.children()[0].children) {
          if (node.text) {
            assert.equal(
              active(node).length,
              1,
              JSON.stringify(aView.read.children())
            );
          }
        }
        assert.equal(active(aText).length, 1);
        const aSchema: EditorStateSchemaApi = a.editor.read.schema;
        const bSchema: EditorStateSchemaApi = b.editor.read.schema;
        aSchema.assertDocument(a.editor.read.value());
        bSchema.assertDocument(b.editor.read.value());
        if (mode !== 'ordinary') {
          const expected = aView.read.children();
          for (const peer of [a, b]) {
            const saved = JSON.parse(JSON.stringify(peer.editor.read.value()));
            const restored = createEditor({
              plugins: [ScriptSchema, authored({ authorId: 'reviewer' })],
              initialValue: saved,
            });
            const restoredView = createEditorView(restored, {
              authored: { intent: 'propose', projection: 'proposed' },
            });
            assert.deepEqual(restoredView.read.children(), expected);
            const restoredSchema: EditorStateSchemaApi = restored.read.schema;
            restoredSchema.assertDocument({
              children: restoredView.read.children(),
            });
            if (mode === 'proposed') {
              for (const authorId of ['alice', 'bob']) {
                const reviewer = createEditor({
                  plugins: [ScriptSchema, authored({ authorId: 'reviewer' })],
                  initialValue: saved,
                });
                assert.equal(
                  reviewer.update.authored.decide({
                    action: 'reject',
                    selection: reviewer.read.authored.select({ authorId }),
                  }).status,
                  'applied'
                );
                assert.deepEqual(
                  createEditorView(reviewer, {
                    authored: { intent: 'propose', projection: 'proposed' },
                  }).read.children(),
                  authorId === 'alice' ? bOnly : aOnly
                );
              }
              assert.equal(
                restored.update.authored.decide({
                  action: 'reject',
                  selection: restored.read.authored.select({
                    status: 'pending',
                  }),
                }).status,
                'applied'
              );
              assert.deepEqual(restoredView.read.children(), [
                paragraph('text'),
              ]);
            }
          }
          a.editor.update.history.undo();
          assert.deepEqual(aView.read.children(), bOnly);
          if (mode === 'accepted') {
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
          assert.deepEqual(bView.read.children(), bOnly);
          a.editor.update.history.redo();
          assert.deepEqual(aView.read.children(), expected);
          Y.applyUpdate(b.doc, Y.encodeStateAsUpdate(a.doc));
          assert.deepEqual(bView.read.children(), expected);
        }
        a.cleanup();
        b.cleanup();
      });
    }
  }
});
