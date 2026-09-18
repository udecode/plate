import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import * as Y from 'yjs';

import { authored } from '../../src/authored';
import { history } from '../../src/history';
import {
  createEditor,
  createEditorView,
  defineEffect,
  definePlugin,
  defineStateField,
  defineValueCodec,
  DocumentChange,
  type InitialValue,
  NodeApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  valueCodecs,
} from '../../src/index';
import type { AnyEditor, PluginReference } from '../../src/interfaces/editor';
import { yjs } from '../../src/yjs';
import { getActiveYjsController } from '../../src/yjs/core/controller-registry';
import { paragraph } from './support/collaboration';
import { FakeAwareness } from './support/provider';

const rootName = 'authored-collaboration';
const documents = new Set<Y.Doc>();
const createDocument = () => {
  const doc = new Y.Doc();
  documents.add(doc);
  return doc;
};
afterEach(() => {
  for (const doc of documents) doc.destroy();
  documents.clear();
});
const sync = (source: Y.Doc, target: Y.Doc) => {
  Y.applyUpdate(
    target,
    Y.encodeStateAsUpdate(source, Y.encodeStateVector(target))
  );
};
class TestInitialReadiness {
  readonly doc: Y.Doc;

  private readonly listeners = new Set<() => void>();
  private ready: boolean;

  constructor(doc: Y.Doc, ready: boolean) {
    this.doc = doc;
    this.ready = ready;
  }

  getSnapshot = (): boolean => this.ready;

  setReady(ready: boolean): void {
    if (this.ready === ready) return;

    this.ready = ready;
    for (const listener of this.listeners) listener();
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };
}
type YjsCompactionTestApi = Readonly<{
  retireSharedEffectPeer: (clientId: number) => void;
}>;
const getYjsCompactionTestApi = (
  editor: AnyEditor,
  binding: PluginReference
): YjsCompactionTestApi => editor.plugin(binding).api;
const getYjsViewApi = (editor: AnyEditor) => {
  const controller = getActiveYjsController(editor);

  assert.ok(controller, 'expected an active Yjs controller');

  return controller.presenceApi(editor);
};
const settleYjsInput = (editor: AnyEditor): void => {
  const controller = getActiveYjsController(editor);

  assert.ok(controller, 'expected an active Yjs controller');
  controller.debugProcessAvailableInput();
};
const createPeer = (
  authorId: string,
  doc: Y.Doc,
  initialValue?: InitialValue,
  authority = false,
  awareness?: FakeAwareness,
  retainHistory = true
) => {
  awareness?.attachDocument(doc);
  const binding = yjs({
    awareness,
    doc,
    initialReady: true,
    rootName,
    ...(doc.share.size === 0 ? { seed: true as const } : {}),
    ...(authority
      ? {
          sharedEffectCompaction: {
            authorityId: 'authored-test',
            threshold: 2,
          },
        }
      : {}),
  });
  const editor = createEditor({
    plugins: [authored({ authorId, retainHistory }), history(), binding],
    initialValue,
  });
  const view = createEditorView(editor, {
    authored: { intent: 'propose', projection: 'proposed' },
  });
  return { binding, doc, editor, view };
};
const connected = (value: InitialValue = [paragraph('Base')]) => {
  const left = createPeer('alice', createDocument(), value);
  const rightDoc = createDocument();
  sync(left.doc, rightDoc);
  const right = createPeer(
    'bob',
    rightDoc,
    JSON.parse(JSON.stringify(left.editor.read.value()))
  );
  sync(right.doc, left.doc);
  return { left, right };
};
const point = (offset: number, block = 0) => ({ path: [block, 0], offset });

describe('authored Yjs collaboration', () => {
  it('synchronizes direct editing from projected coordinates with pending content intact', () => {
    const { left, right } = connected();
    left.view.update.text.insert(' draft', { at: point(4) });
    const pending = left.view.read.authored.changes({
      status: 'pending',
    }).items[0];
    sync(left.doc, right.doc);

    left.view.api.authored.setView({ intent: 'edit', projection: 'markup' });
    left.view.update.text.insert('!', { at: point(0) });
    sync(left.doc, right.doc);

    for (const peer of [left, right]) {
      assert.equal(peer.editor.read.text.string([]), '!Base');
      assert.equal(peer.view.read.text.string([]), '!Base draft');
      assert.equal(
        peer.view.read.authored.change(pending.id)?.status,
        'pending'
      );
    }

    right.view.api.authored.setView({ intent: 'edit', projection: 'markup' });
    right.view.update.text.insert('X', { at: point(8) });
    sync(right.doc, left.doc);

    for (const peer of [left, right]) {
      assert.equal(peer.editor.read.text.string([]), '!Base');
      assert.equal(peer.view.read.text.string([]), '!Base drXaft');
      const dependent = peer.view.read.authored
        .changes({ authorId: 'bob', status: 'pending' })
        .items.find((change) => change.dependencies.includes(pending.id));
      assert.ok(dependent);
    }
  });

  for (const initialEdit of ['insertion', 'deletion'] as const) {
    it(`synchronizes an own ${initialEdit} cancellation and restored identities through reload`, () => {
      const { left, right } = connected([paragraph('ABC')]);
      if (initialEdit === 'insertion') {
        left.view.update.text.insert('p', { at: point(1) });
      } else {
        left.view.update.text.delete({
          at: { anchor: point(1), focus: point(2) },
        });
      }
      const { id } = left.editor.read.authored.changes().items[0];
      sync(left.doc, right.doc);

      assert.deepEqual(right.view.read.children(), left.view.read.children());
      if (initialEdit === 'insertion') {
        left.view.update.selection.set(point(2));
        left.view.update.text.deleteBackward();
      } else left.view.update.text.insert('B', { at: point(1) });
      sync(left.doc, right.doc);
      sync(right.doc, left.doc);

      const reopenedDoc = createDocument();
      sync(right.doc, reopenedDoc);
      const reopened = createPeer(
        'alice',
        reopenedDoc,
        JSON.parse(JSON.stringify(right.editor.read.value()))
      );
      for (const peer of [left, right, reopened]) {
        assert.deepEqual(peer.editor.read.children(), [paragraph('ABC')]);
        assert.deepEqual(peer.view.read.children(), [paragraph('ABC')]);
        assert.deepEqual(peer.view.read.authored.details(id)?.parts, {
          items: [],
          status: 'available',
        });
        assert.deepEqual(
          peer.view.read.authored.changesAt({
            anchor: point(0),
            focus: point(3),
          }),
          []
        );
      }

      reopened.view.update.text.delete({
        at: { anchor: point(1), focus: point(2) },
      });
      sync(reopened.doc, left.doc);
      sync(left.doc, right.doc);
      for (const peer of [left, right, reopened]) {
        assert.deepEqual(peer.editor.read.children(), [paragraph('ABC')]);
        assert.deepEqual(peer.view.read.children(), [paragraph('AC')]);
        const changes = peer.view.read.authored.changesAt({
          anchor: point(0),
          focus: point(2),
        });
        assert.equal(
          changes.length,
          1,
          JSON.stringify(
            changes.map((change) => peer.view.read.authored.details(change.id))
          )
        );
        const details = peer.view.read.authored.details(changes[0].id);
        assert.equal(details?.parts.status, 'available');
        if (details?.parts.status !== 'available') assert.fail();
        const content = details.parts.items.filter(
          (part) => part.kind === 'content'
        );
        assert.deepEqual(
          content.flatMap((part) => part.before?.content.content ?? []),
          [paragraph('B')]
        );
        assert.deepEqual(
          content.flatMap((part) => part.after ?? []),
          []
        );
      }
    });
  }

  for (const replacement of ['', 'z']) {
    it(`synchronizes a ${replacement ? 'replacement' : 'deletion'} across separate own insertions as one reviewable base edit`, () => {
      const { left, right } = connected([paragraph('ABC')]);
      const owned: string[] = [];
      left.view.update((tx) => {
        owned.push(tx.authored.propose());
        tx.text.insert('p', { at: point(1) });
      });
      left.view.update((tx) => {
        owned.push(tx.authored.propose());
        tx.text.insert('q', { at: point(3) });
      });
      sync(left.doc, right.doc);
      assert.deepEqual(right.view.read.children(), [paragraph('ApBqC')]);

      const at = { anchor: point(1), focus: point(4) };
      if (replacement) left.view.update.text.insert(replacement, { at });
      else left.view.update.text.delete({ at });
      sync(left.doc, right.doc);
      sync(right.doc, left.doc);

      const reopenedDoc = createDocument();
      sync(right.doc, reopenedDoc);
      const reopened = createPeer(
        'carol',
        reopenedDoc,
        JSON.parse(JSON.stringify(right.editor.read.value()))
      );
      const expected = [paragraph(`A${replacement}C`)];
      let reviewId = '';
      for (const peer of [left, right, reopened]) {
        assert.deepEqual(peer.editor.read.children(), [paragraph('ABC')]);
        assert.deepEqual(peer.view.read.children(), expected);
        for (const id of owned) {
          assert.deepEqual(peer.view.read.authored.details(id)?.parts, {
            items: [],
            status: 'available',
          });
        }
        const changes = peer.view.read.authored.changesAt({
          anchor: point(0),
          focus: point(2 + replacement.length),
        });
        assert.equal(changes.length, 1);
        reviewId ||= changes[0].id;
        assert.equal(changes[0].id, reviewId);
        const details = peer.view.read.authored.details(reviewId);
        assert.equal(details?.parts.status, 'available');
        if (details?.parts.status !== 'available') assert.fail();
        const content = details.parts.items.filter(
          (part) => part.kind === 'content'
        );
        assert.equal(
          content
            .flatMap((part) => part.before?.content.content ?? [])
            .map((node) => NodeApi.string(node))
            .join(''),
          'B'
        );
        assert.equal(
          content
            .flatMap((part) => part.after?.content.content ?? [])
            .map((node) => NodeApi.string(node))
            .join(''),
          replacement
        );
      }

      const decision = reopened.editor.update.authored.decide({
        action: 'accept',
        selection: reopened.editor.read.authored.select({ ids: [reviewId] }),
      });
      assert.equal(decision.status, 'applied', JSON.stringify(decision));
      sync(reopened.doc, left.doc);
      sync(left.doc, right.doc);
      for (const peer of [left, right, reopened]) {
        assert.deepEqual(peer.editor.read.children(), expected);
        assert.deepEqual(peer.view.read.children(), expected);
        assert.deepEqual(
          peer.view.read.authored.changesAt({
            anchor: point(0),
            focus: point(2 + replacement.length),
          }),
          []
        );
      }
    });
  }

  for (const archivalWriter of [false, true]) {
    it(`keeps retention local when the closing writer ${archivalWriter ? 'archives' : 'compacts'} content`, () => {
      const marker = 'mixed-retention-body';
      const writer = createPeer(
        'alice',
        createDocument(),
        [paragraph(marker)],
        false,
        undefined,
        archivalWriter
      );
      const readerDoc = createDocument();
      sync(writer.doc, readerDoc);
      const reader = createPeer(
        'bob',
        readerDoc,
        undefined,
        false,
        undefined,
        !archivalWriter
      );
      writer.editor.update.text.delete({
        at: { anchor: point(0), focus: point(marker.length) },
      });
      sync(writer.doc, reader.doc);
      const archive = archivalWriter ? writer : reader;
      const compact = archivalWriter ? reader : writer;
      for (const peer of [writer, reader]) {
        assert.deepEqual(peer.editor.read.children(), [paragraph('')]);
      }
      assert.equal(
        JSON.stringify(archive.editor.read.value()).includes(marker),
        true
      );
      assert.equal(
        JSON.stringify(compact.editor.read.value()).includes(marker),
        false
      );
      const selection = compact.editor.read.authored.select({});
      assert.deepEqual(compact.editor.update.authored.revert({ selection }), {
        status: 'unavailable',
        reason: 'retention',
        ids: selection.changes.map((change) => change.id),
      });
      assert.equal(
        archive.editor.update.authored.revert({
          selection: archive.editor.read.authored.select({}),
        }).status,
        'applied'
      );
      sync(archive.doc, compact.doc);
      for (const peer of [writer, reader]) {
        assert.deepEqual(peer.editor.read.children(), [paragraph(marker)]);
      }
    });
  }

  it('preserves an observed local archive across a compact peer checkpoint', () => {
    const marker = 'checkpoint-retained-body';
    const writer = createPeer(
      'alice',
      createDocument(),
      [paragraph(marker)],
      false,
      undefined,
      false
    );
    const archiveDoc = createDocument();
    sync(writer.doc, archiveDoc);
    const archive = createPeer(
      'bob',
      archiveDoc,
      undefined,
      false,
      undefined,
      true
    );
    writer.editor.update.text.delete({
      at: { anchor: point(0), focus: point(marker.length) },
    });
    sync(writer.doc, archive.doc);
    assert.equal(
      JSON.stringify(archive.editor.read.value()).includes(marker),
      true
    );
    const authorityDoc = createDocument();
    sync(writer.doc, authorityDoc);
    const compact = createPeer(
      'carol',
      authorityDoc,
      undefined,
      true,
      undefined,
      false
    );
    sync(compact.doc, archive.doc);
    assert.equal(
      compact.doc.getArray(`${rootName}:shared-effect-events`).length,
      0
    );
    assert.ok(
      compact.doc.getMap(`${rootName}:shared-effect-checkpoint`).get('current')
    );
    assert.equal(
      JSON.stringify(compact.editor.read.value()).includes(marker),
      false
    );
    assert.equal(
      JSON.stringify(archive.editor.read.value()).includes(marker),
      true
    );
  });

  for (const root of ['main', 'sidebar'] as const) {
    for (const action of ['accepted-delete', 'rejected-insert'] as const) {
      it(`keeps live undo and pinned anchors after ${action} checkpoint compaction in ${root} without archival history`, () => {
        const payload = 'Retained live content';
        const initial = [
          paragraph(action === 'accepted-delete' ? payload : ''),
          paragraph('Independent'),
        ];
        const create = (
          authorId: string,
          doc: Y.Doc,
          initialValue?: InitialValue
        ) => {
          const editor = createEditor({
            plugins: [
              authored({ authorId, retainHistory: false }),
              history(),
              yjs({
                doc,
                initialReady: true,
                rootName,
                ...(doc.share.size === 0 ? { seed: true as const } : {}),
                ...(authorId === 'alice'
                  ? {
                      sharedEffectCompaction: {
                        authorityId: 'retained-live-content',
                        threshold: 1,
                      },
                    }
                  : {}),
              }),
            ],
            initialValue,
          });
          const rootOptions = root === 'main' ? {} : { root };
          return {
            doc,
            editor,
            accepted: createEditorView(editor, rootOptions),
            proposed: createEditorView(editor, {
              ...rootOptions,
              authored: { intent: 'propose', projection: 'proposed' },
            }),
          };
        };
        const left = create(
          'alice',
          createDocument(),
          root === 'main'
            ? initial
            : { children: [paragraph('Main')], roots: { sidebar: initial } }
        );
        const rightDoc = createDocument();
        sync(left.doc, rightDoc);
        const right = create('bob', rightDoc);
        sync(right.doc, left.doc);
        if (action === 'rejected-insert') {
          left.proposed.update.text.insert(payload, { at: point(0) });
          sync(left.doc, right.doc);
          sync(right.doc, left.doc);
        }
        const anchoredView =
          action === 'accepted-delete' ? right.accepted : right.proposed;
        const anchoredRange = {
          anchor: { ...point(1), ...(root === 'main' ? {} : { root }) },
          focus: { ...point(5), ...(root === 'main' ? {} : { root }) },
        };
        const anchor = anchoredView.anchor(anchoredRange, { deletion: 'drop' });
        const savedAnchor = anchoredView.anchor.save(anchor);
        if (action === 'accepted-delete') {
          left.accepted.update.text.delete({
            at: { anchor: point(0), focus: point(payload.length) },
          });
        } else {
          assert.equal(
            left.editor.update.authored.decide({
              action: 'reject',
              selection: left.editor.read.authored.select({
                status: 'pending',
              }),
            }).status,
            'applied'
          );
        }
        sync(left.doc, right.doc);
        sync(right.doc, left.doc);
        assert.equal(anchor.resolve(), null);
        right.accepted.update.text.insert('!', { at: point(11, 1) });
        sync(right.doc, left.doc);
        sync(left.doc, right.doc);
        sync(right.doc, left.doc);
        assert.equal(
          left.doc.getArray(`${rootName}:shared-effect-events`).length,
          0
        );
        assert.ok(
          left.doc.getMap(`${rootName}:shared-effect-checkpoint`).get('current')
        );
        const lateDoc = createDocument();
        sync(left.doc, lateDoc);
        const late = create('carol', lateDoc);
        const lateView =
          action === 'accepted-delete' ? late.accepted : late.proposed;
        const restoredAnchor = lateView.anchor.restore(savedAnchor);
        assert.equal(restoredAnchor.resolve(), null);
        for (const peer of [left, right, late]) {
          assert.deepEqual(peer.accepted.read.children(), [
            paragraph(''),
            paragraph('Independent!'),
          ]);
          assert.equal(
            peer.editor.read.authored.changes({ status: 'pending' }).items
              .length,
            0
          );
          const before = JSON.stringify(peer.editor.read.value());
          const selection = peer.editor.read.authored.select({
            authorId: 'alice',
          });
          assert.deepEqual(peer.editor.update.authored.revert({ selection }), {
            status: 'unavailable',
            reason: 'retention',
            ids: selection.changes.map((change) => change.id).sort(),
          });
          assert.equal(JSON.stringify(peer.editor.read.value()), before);
        }
        left.editor.api.history.undo();
        sync(left.doc, right.doc);
        sync(left.doc, late.doc);
        assert.deepEqual(anchor.resolve(), anchoredRange);
        assert.deepEqual(restoredAnchor.resolve(), anchoredRange);
        for (const peer of [left, right, late]) {
          const view =
            action === 'accepted-delete' ? peer.accepted : peer.proposed;
          assert.deepEqual(view.read.children(), [
            paragraph(payload),
            paragraph('Independent!'),
          ]);
          if (action === 'rejected-insert') {
            assert.equal(
              peer.editor.read.authored.changes({ status: 'pending' }).items
                .length,
              1
            );
          }
        }
        anchor.release();
        restoredAnchor.release();
      });
    }
  }

  for (const proposed of [false, true]) {
    for (const scenario of [
      {
        name: 'scalar writes',
        before: { align: 'start' },
        left: { type: 'set', key: 'align', value: 'center' },
        right: { type: 'set', key: 'align', value: 'end' },
      },
      {
        name: 'scalar removal',
        before: { align: 'start' },
        left: { type: 'unset', key: 'align' },
        right: { type: 'set', key: 'align', value: 'end' },
      },
      {
        name: 'distinct set members',
        before: {},
        left: { type: 'add', key: 'tags', values: ['red'] },
        right: { type: 'add', key: 'tags', values: ['blue'] },
      },
      {
        name: 'overlapping set members',
        before: {},
        left: { type: 'add', key: 'tags', values: ['red', 'green'] },
        right: { type: 'add', key: 'tags', values: ['blue', 'green'] },
      },
      {
        name: 'scalar and set writes',
        before: { tags: ['red'] },
        left: { type: 'set', key: 'tags', value: ['blue'] },
        right: { type: 'add', key: 'tags', values: ['green'] },
      },
    ]) {
      it(`converges concurrent ${proposed ? 'proposed' : 'accepted'} ${scenario.name}`, () => {
        const initial = [{ ...paragraph('Base'), ...scenario.before }];
        const { left, right } = connected(initial);
        for (const [peer, modification] of [
          [left, scenario.left],
          [right, scenario.right],
        ] as const) {
          (proposed ? peer.view : peer.editor).update.changes.apply(
            DocumentChange.fromJSON({
              version: 3,
              primary: [
                {
                  length: 1,
                  properties: { version: 1, operations: [modification] },
                },
                { length: 7 },
              ],
            })
          );
        }
        const leftOnly = left.view.read.children();
        const rightOnly = right.view.read.children();
        sync(left.doc, right.doc);
        sync(right.doc, left.doc);
        const expected = left.view.read.children();
        assert.deepEqual(right.view.read.children(), expected);
        assert.deepEqual(
          left.editor.read.children(),
          proposed ? initial : expected
        );
        assert.deepEqual(
          right.editor.read.children(),
          left.editor.read.children()
        );
        for (const peer of [left, right]) {
          const restored = createEditor({
            plugins: [authored({ authorId: 'reader' })],
            initialValue: JSON.parse(JSON.stringify(peer.editor.read.value())),
          });
          const restoredView = createEditorView(restored, {
            authored: { intent: 'propose', projection: 'proposed' },
          });
          assert.deepEqual(restoredView.read.children(), expected);
          if (proposed) {
            const decision = restored.update.authored.decide({
              action: 'reject',
              selection: restored.read.authored.select({ status: 'pending' }),
            });
            assert.equal(decision.status, 'applied');
            assert.deepEqual(restoredView.read.children(), initial);
            for (const authorId of ['alice', 'bob']) {
              const reviewer = createEditor({
                plugins: [authored({ authorId: 'reviewer' })],
                initialValue: JSON.parse(
                  JSON.stringify(peer.editor.read.value())
                ),
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
                authorId === 'alice' ? rightOnly : leftOnly
              );
            }
          }
        }
        left.editor.api.history.undo();
        assert.deepEqual(left.view.read.children(), rightOnly);
        sync(left.doc, right.doc);
        assert.deepEqual(right.view.read.children(), rightOnly);
        left.editor.api.history.redo();
        assert.deepEqual(left.view.read.children(), expected);
        sync(left.doc, right.doc);
        assert.deepEqual(right.view.read.children(), expected);
      });
    }
  }

  for (const mode of ['accepted', 'proposed', 'headless'] as const) {
    for (const root of ['main', 'sidebar']) {
      it(`maps shared effect targets into the same ${mode} update in ${root}`, () => {
        type Targets = { point: Point; range: Range };
        let rejectTargets = false;
        const targetsCodec = defineValueCodec<Targets>({
          version: 1,
          encode: (value) => value,
          decode(value) {
            assert.ok(value && typeof value === 'object');
            assert.ok('point' in value && PointApi.isPoint(value.point));
            assert.ok('range' in value && RangeApi.isRange(value.range));
            return { point: value.point, range: value.range };
          },
        });
        const focus = defineEffect<Targets>({
          key: 'authored.focus-targets',
          codec: targetsCodec,
          collab: 'shared',
          collabReplay: 'live',
          collabTransport: {
            encode: (value, context) => ({
              point: context.point(value.point),
              range: context.range(value.range),
            }),
            decode(value, context) {
              if (!value || typeof value !== 'object') return undefined;
              if (!('point' in value) || !('range' in value)) return undefined;
              const targetPoint = context.point(value.point);
              const targetRange = context.range(value.range);
              if (rejectTargets) throw new Error('Rejected shared target.');
              return targetPoint && targetRange
                ? { point: targetPoint, range: targetRange }
                : undefined;
            },
          },
          history: 'skip',
        });
        const marker = defineEffect<string>({
          key: 'authored.target-marker',
          codec: valueCodecs.string,
          collab: 'shared',
          collabReplay: 'live',
          history: 'skip',
        });
        const received = defineStateField<ReadonlyArray<Targets | string>>({
          key: 'authored.received-targets',
          initial: [],
          reduce: (value, effect) =>
            effect.type === focus || effect.type === marker
              ? [...value, effect.value]
              : value,
        });
        const plugin = definePlugin('authored-shared-targets', {
          effectTypes: [focus, marker],
          stateFields: [received],
        });
        const leftDoc = createDocument();
        const leftBinding = yjs({
          doc: leftDoc,
          initialReady: true,
          rootName,
          seed: true,
        });
        const left = createEditor({
          plugins: [authored({ authorId: 'alice' }), plugin, leftBinding],
          initialValue: {
            children: [paragraph('Base')],
            roots: { sidebar: [paragraph('Base')] },
          },
        });
        const rightDoc = createDocument();
        sync(leftDoc, rightDoc);
        const rightBinding = yjs({
          doc: rightDoc,
          initialReady: true,
          rootName,
        });
        const right = createEditor({
          plugins: [authored({ authorId: 'bob' }), plugin, rightBinding],
        });
        sync(rightDoc, leftDoc);
        const rootPoint = (offset: number) => ({
          ...point(offset),
          ...(root === 'main' ? {} : { root }),
        });
        const target = {
          point: rootPoint(5),
          range: { anchor: rootPoint(5), focus: rootPoint(6) },
        };
        const source = createEditorView(left, {
          root: root === 'main' ? undefined : root,
          authored:
            mode === 'proposed'
              ? { intent: 'propose', projection: 'proposed' }
              : { intent: 'edit', projection: 'accepted' },
        });
        source.update((tx) => {
          if (mode === 'headless') tx.authored.propose();
          tx.text.insert('xyz', { at: rootPoint(4) });
          tx.effects.emit(marker, 'before');
          tx.effects.emit(focus, target);
          tx.effects.emit(marker, 'after');
        });
        right.update.text.insert('!', { at: rootPoint(0) });
        let publications = 0;
        const unsubscribe = right.subscribeCommit(() => {
          publications += 1;
        });
        if (mode === 'headless' && root === 'sidebar') {
          const before = right.read.value();
          rejectTargets = true;
          try {
            sync(leftDoc, rightDoc);
          } catch {
            // Admission state and retained input are the collaboration boundary.
          }
          assert.equal(
            right.plugin(rightBinding).api.admissionStatus().state,
            'error'
          );
          assert.deepEqual(right.read.value(), before);
          assert.deepEqual(right.read.getField(received), []);
          assert.equal(publications, 0);
          rejectTargets = false;
          right.plugin(rightBinding).api.retryImport();
        } else sync(leftDoc, rightDoc);
        const proposed = createEditorView(right, {
          root: root === 'main' ? undefined : root,
          authored: { intent: 'propose', projection: 'proposed' },
        });
        assert.deepEqual(proposed.read.children(), [paragraph('!Basexyz')]);
        const expected = {
          point: rootPoint(6),
          range: { anchor: rootPoint(6), focus: rootPoint(7) },
        };
        assert.deepEqual(right.read.getField(received), [
          'before',
          expected,
          'after',
        ]);
        assert.equal(publications, 1);
        sync(leftDoc, rightDoc);
        assert.deepEqual(right.read.getField(received), [
          'before',
          expected,
          'after',
        ]);
        assert.equal(publications, 1);
        sync(rightDoc, leftDoc);
        source.update((tx) => {
          if (mode === 'headless') tx.authored.propose();
          tx.effects.emit(focus, expected);
        });
        sync(leftDoc, rightDoc);
        assert.deepEqual(right.read.getField(received), [
          'before',
          expected,
          'after',
          expected,
        ]);
        assert.equal(publications, 2);
        if (mode === 'accepted' && root === 'main') {
          source.update((tx) => {
            tx.effects.emit(focus, expected);
          });
          source.update.text.delete({
            at: { anchor: point(5), focus: point(8) },
          });
          sync(leftDoc, rightDoc);
          assert.deepEqual(proposed.read.children(), [paragraph('!Base')]);
          assert.deepEqual(right.read.getField(received), [
            'before',
            expected,
            'after',
            expected,
          ]);
          assert.equal(publications, 3);
          right.plugin(rightBinding).api.retryImport();
          assert.equal(publications, 3);
        }
        unsubscribe();
      });
    }
  }

  for (const proposed of [false, true]) {
    it(`maps awareness through ${proposed ? 'proposed' : 'accepted'} native content and later edits`, () => {
      const leftAwareness = new FakeAwareness(11);
      const rightAwareness = new FakeAwareness(22);
      const leftDoc = createDocument();
      const left = createPeer(
        'alice',
        leftDoc,
        [paragraph('Base')],
        false,
        leftAwareness
      );
      const rightDoc = createDocument();
      sync(left.doc, rightDoc);
      const right = createPeer(
        'bob',
        rightDoc,
        undefined,
        false,
        rightAwareness
      );
      const leftView = proposed ? left.view : left.editor;
      const rightView = proposed ? right.view : right.editor;
      const rightViewYjs = getYjsViewApi(rightView);
      const rightEditorYjs = getYjsViewApi(right.editor);
      leftView.update.text.insert('xyz', { at: point(4) });
      sync(left.doc, right.doc);
      leftView.update.selection.set({ anchor: point(5), focus: point(6) });
      const awareness = leftAwareness.getLocalState();
      assert.ok(awareness?.selection);
      rightAwareness.setRemoteState(11, awareness);
      assert.deepEqual(rightViewYjs.remoteCursor(11)?.selection, {
        anchor: point(5),
        focus: point(6),
      });
      if (proposed) {
        assert.equal(rightEditorYjs.remoteCursor(11)?.selection, null);
      }
      let publications = 0;
      const unsubscribe = rightViewYjs.subscribeRemoteCursors(() => {
        publications += 1;
      });
      left.editor.update.text.insert('!', { at: point(0) });
      sync(left.doc, right.doc);
      assert.deepEqual(rightViewYjs.remoteCursor(11)?.selection, {
        anchor: point(6),
        focus: point(7),
      });
      assert.equal(publications, 1);
      if (proposed) {
        right.editor.update.authored.decide({
          action: 'reject',
          selection: right.editor.read.authored.select({ status: 'pending' }),
        });
        assert.equal(rightViewYjs.remoteCursor(11)?.selection, null);
      }
      unsubscribe();
      rightAwareness.removeRemoteState(11);
      assert.equal(rightViewYjs.remoteCursor(11), null);
    });
  }

  for (const proposed of [false, true]) {
    it(`rejects a provisional ${proposed ? 'proposal' : 'accepted edit'} before app readiness`, () => {
      const doc = createDocument();
      const initialReady = new TestInitialReadiness(doc, false);
      const binding = yjs({
        doc,
        initialReady,
        rootName,
        seed: true,
      });
      const editor = createEditor({
        plugins: [
          authored({ authorId: 'alice', retainHistory: true }),
          history(),
          binding,
        ],
        initialValue: [paragraph('Base')],
      });
      const view = createEditorView(editor, {
        authored: { intent: 'propose', projection: 'proposed' },
      });
      const before = JSON.stringify(editor.read.value());
      let publications = 0;
      const unsubscribe = editor.subscribeCommit(() => {
        publications += 1;
      });
      assert.throws(() => {
        (proposed ? view : editor).update.text.insert('q', { at: point(4) });
      }, /waiting for load/);
      assert.equal(JSON.stringify(editor.read.value()), before);
      assert.deepEqual(view.read.children(), [paragraph('Base')]);
      assert.equal(editor.read.history().undos.length, 0);
      assert.equal(doc.getArray(`${rootName}:shared-effect-events`).length, 0);
      assert.equal(publications, 0);
      initialReady.setReady(true);
      assert.equal(editor.plugin(binding).api.admissionStatus().state, 'ready');
      view.update.text.insert('z', { at: point(4) });
      const remoteDoc = createDocument();
      sync(doc, remoteDoc);
      const remote = createPeer('bob', remoteDoc);
      assert.deepEqual(remote.view.read.children(), [paragraph('Basez')]);
      assert.equal(remote.editor.read.authored.changes({}).items.length, 1);
      unsubscribe();
    });
  }

  it('delivers a pending edit to a connected peer with the same saved base', () => {
    const { left, right } = connected();
    left.view.update.text.insert(' draft', { at: point(4) });
    const change = left.editor.read.authored.changes({ status: 'pending' })
      .items[0];
    assert.ok(change);
    let commits = 0;
    right.editor.subscribeCommit(() => {
      commits += 1;
    });
    sync(left.doc, right.doc);
    assert.deepEqual(left.editor.read.children(), [paragraph('Base')]);
    assert.deepEqual(right.editor.read.children(), left.editor.read.children());
    assert.equal(
      right.editor.read.authored.change(change.id)?.authorId,
      'alice'
    );
    assert.equal(
      right.editor.read.authored.change(change.id)?.status,
      'pending'
    );
    assert.deepEqual(right.view.read.children(), [paragraph('Base draft')]);
    assert.equal(right.editor.read.history().undos.length, 0);
    assert.equal(commits, 1);
    sync(left.doc, right.doc);
    assert.equal(commits, 1);
  });

  it('restores pending edits when a peer joins from the shared document', () => {
    const left = createPeer('alice', createDocument(), [paragraph('Base')]);
    left.view.update.text.insert(' draft', { at: point(4) });
    const change = left.editor.read.authored.changes({ status: 'pending' })
      .items[0];
    assert.ok(change);
    const rightDoc = createDocument();
    sync(left.doc, rightDoc);
    const right = createPeer('bob', rightDoc);
    assert.deepEqual(right.editor.read.children(), [paragraph('Base')]);
    assert.equal(
      right.editor.read.authored.change(change.id)?.status,
      'pending'
    );
    assert.deepEqual(right.view.read.children(), [paragraph('Base draft')]);
  });

  it('shares the initial authored identity before either peer edits', () => {
    const left = createPeer('alice', createDocument(), [paragraph('Base')]);
    const rightDoc = createDocument();
    sync(left.doc, rightDoc);
    const right = createPeer('bob', rightDoc);
    assert.deepEqual(
      right.editor.read.authored.select({}),
      left.editor.read.authored.select({})
    );
    right.view.update.text.insert(' draft', { at: point(4) });
    sync(right.doc, left.doc);
    assert.deepEqual(left.view.read.children(), [paragraph('Base draft')]);
    assert.equal(
      left.editor.read.authored.changes({ authorId: 'bob' }).items.length,
      1
    );
    assert.equal(
      left.editor.read.authored.changes({ authorId: 'alice' }).items.length,
      0
    );
  });

  for (const reviewed of [false, true]) {
    it(`joins a genesis checkpoint followed by accepted edits and ${reviewed ? 'a review' : 'a pending proposal'}`, () => {
      const left = createPeer('alice', createDocument(), [paragraph('Base')]);
      left.editor.update.text.insert('!', { at: point(0) });
      left.view.update.text.insert('q', { at: point(5) });
      if (reviewed) {
        assert.equal(
          left.editor.update.authored.decide({
            action: 'accept',
            selection: left.editor.read.authored.select({ status: 'pending' }),
          }).status,
          'applied'
        );
      }
      const doc = createDocument();
      sync(left.doc, doc);
      const right = createPeer('bob', doc);
      assert.deepEqual(right.editor.read.children(), [
        paragraph(reviewed ? '!Baseq' : '!Base'),
      ]);
      assert.deepEqual(right.view.read.children(), [paragraph('!Baseq')]);
      const restored = createEditor({
        plugins: [authored({ authorId: 'bob' })],
        initialValue: JSON.parse(JSON.stringify(right.editor.read.value())),
      });
      const view = createEditorView(restored, {
        authored: { intent: 'propose', projection: 'proposed' },
      });
      view.update.text.insert('z', { at: point(0) });
      assert.deepEqual(view.read.children(), [paragraph('z!Baseq')]);
      assert.deepEqual(restored.read.children(), right.editor.read.children());
    });
  }

  for (const mutation of ['delete', 'format'] as const) {
    for (const action of ['accept', 'reject'] as const) {
      it(`retains a remote ${mutation} through ${action} and a saved-value reload`, () => {
        const { left, right } = connected();
        if (mutation === 'delete') {
          left.view.update.text.delete({
            at: { anchor: point(1), focus: point(3) },
          });
        } else {
          left.view.update.nodes.set({ bold: true }, { at: [0, 0] });
        }
        sync(left.doc, right.doc);
        assert.deepEqual(right.view.read.children(), left.view.read.children());
        const { id } = left.editor.read.authored.changes({ status: 'pending' })
          .items[0];
        const restored = createEditor({
          plugins: [authored({ authorId: 'bob' })],
          initialValue: JSON.parse(JSON.stringify(right.editor.read.value())),
        });
        const selection = right.editor.read.authored.select({ ids: [id] });
        assert.equal(
          restored.update.authored.decide({ action, selection }).status,
          'applied'
        );
        assert.equal(
          right.editor.update.authored.decide({ action, selection }).status,
          'applied'
        );
        sync(right.doc, left.doc);
        const expected =
          action === 'reject'
            ? [paragraph('Base')]
            : mutation === 'delete'
              ? [paragraph('Be')]
              : [
                  {
                    type: 'paragraph',
                    children: [{ text: 'Base', bold: true }],
                  },
                ];
        assert.deepEqual(restored.read.children(), expected);
        for (const peer of [left, right]) {
          assert.deepEqual(peer.editor.read.children(), expected);
          assert.deepEqual(peer.view.read.children(), expected);
        }
      });
    }
  }

  it('restores a compacted checkpoint and its later operation tail', () => {
    const left = createPeer(
      'alice',
      createDocument(),
      [paragraph('Base')],
      true
    );
    left.view.update.text.insert(' draft', { at: point(4) });
    const events = left.doc.getArray(`${rootName}:shared-effect-events`);
    const rightDoc = createDocument();
    sync(left.doc, rightDoc);
    const right = createPeer('bob', rightDoc);
    sync(right.doc, left.doc);
    assert.equal(events.length, 0);
    assert.ok(
      left.doc.getMap(`${rootName}:shared-effect-checkpoint`).get('current')
    );
    left.view.update.text.insert('!', { at: point(10) });
    assert.equal(events.length, 1);
    sync(left.doc, rightDoc);
    assert.deepEqual(right.editor.read.children(), [paragraph('Base')]);
    assert.deepEqual(right.view.read.children(), [paragraph('Base draft!')]);
    assert.deepEqual(
      right.editor.read.authored.select({}),
      left.editor.read.authored.select({})
    );
    assert.equal(
      right.editor.update.authored.decide({
        action: 'reject',
        selection: right.editor.read.authored.select({ status: 'pending' }),
      }).status,
      'applied'
    );
    sync(right.doc, left.doc);
    assert.deepEqual(left.view.read.children(), [paragraph('Base')]);
  });

  for (const layout of [
    'paragraphs',
    'into a quote',
    'out of a quote',
  ] as const) {
    it(`restores remote retained context across ${layout} after accepted typing`, () => {
      const quote = (text: string) => ({
        type: 'quote',
        children: [paragraph(text)],
      });
      const first = layout === 'out of a quote' ? quote('AB') : paragraph('AB');
      const second = layout === 'into a quote' ? quote('CD') : paragraph('CD');
      const anchor = {
        path: layout === 'out of a quote' ? [0, 0, 0] : [0, 0],
        offset: 1,
      };
      const focus = {
        path: layout === 'into a quote' ? [1, 0, 0] : [1, 0],
        offset: 1,
      };
      const { left, right } = connected([first, second]);
      left.view.update.text.delete({ at: { anchor, focus } });
      sync(left.doc, right.doc);
      assert.deepEqual(right.view.read.children(), left.view.read.children());
      right.editor.update.text.insert('!', { at: focus });
      sync(right.doc, left.doc);
      const expected = [
        first,
        layout === 'into a quote' ? quote('C!D') : paragraph('C!D'),
      ];
      for (const peer of [left, right]) {
        assert.deepEqual(peer.editor.read.children(), expected);
      }
      const restored = createEditor({
        plugins: [authored({ authorId: 'reader' })],
        initialValue: JSON.parse(JSON.stringify(right.editor.read.value())),
      });
      for (const editor of [restored, right.editor]) {
        assert.equal(
          editor.update.authored.decide({
            action: 'reject',
            selection: editor.read.authored.select({ status: 'pending' }),
          }).status,
          'applied'
        );
        assert.deepEqual(editor.read.children(), expected);
      }
      sync(right.doc, left.doc);
      for (const peer of [left, right]) {
        assert.deepEqual(peer.editor.read.children(), expected);
        assert.deepEqual(peer.view.read.children(), expected);
      }
    });
  }

  it('keeps an offline contribution when receiving a newer compacted checkpoint', () => {
    const left = createPeer(
      'alice',
      createDocument(),
      [paragraph('Base')],
      true
    );
    const rightDoc = createDocument();
    sync(left.doc, rightDoc);
    const right = createPeer('bob', rightDoc);
    getYjsCompactionTestApi(left.editor, left.binding).retireSharedEffectPeer(
      right.doc.clientID
    );
    right.view.update.text.insert('z', { at: point(0) });
    let changeId = '';
    left.editor.update((tx) => {
      changeId = tx.authored.propose();
      tx.text.insert('q', { at: point(4) });
    });
    left.editor.update((tx) => {
      tx.authored.propose({ changeId });
      tx.text.insert('!', { at: point(5) });
    });
    settleYjsInput(left.editor);
    assert.ok(
      left.doc.getMap(`${rootName}:shared-effect-checkpoint`).get('current')
    );
    assert.equal(
      left.doc.getArray(`${rootName}:shared-effect-events`).length,
      1
    );
    sync(left.doc, right.doc);
    sync(right.doc, left.doc);
    for (const peer of [left, right]) {
      assert.deepEqual(peer.editor.read.children(), [paragraph('Base')]);
      assert.deepEqual(peer.view.read.children(), [paragraph('zBaseq!')]);
      assert.equal(
        peer.editor.read.authored.changes({ status: 'pending' }).items.length,
        2
      );
      const restored = createEditor({
        plugins: [authored({ authorId: 'reader' })],
        initialValue: JSON.parse(JSON.stringify(peer.editor.read.value())),
      });
      assert.deepEqual(
        createEditorView(restored, {
          authored: { intent: 'propose', projection: 'proposed' },
        }).read.children(),
        [paragraph('zBaseq!')]
      );
    }
  });

  it('receives an accepted edit once while preserving a pending proposal', () => {
    const { left, right } = connected();
    left.view.update.text.insert(' draft', { at: point(4) });
    sync(left.doc, right.doc);
    left.editor.update.text.insert('!', { at: point(0) });
    sync(left.doc, right.doc);
    for (const peer of [left, right]) {
      assert.deepEqual(peer.editor.read.children(), [paragraph('!Base')]);
      assert.deepEqual(peer.view.read.children(), [paragraph('!Base draft')]);
      assert.equal(
        peer.editor.read.authored.changes({ status: 'pending' }).items.length,
        1
      );
      assert.equal(
        peer.editor.read.authored.changes({ status: 'accepted' }).items.length,
        1
      );
      assert.equal(
        peer.editor.read.authored.changes({ authorId: 'bob' }).items.length,
        0
      );
    }
  });

  for (const proposed of [true, false]) {
    it(`receives repeated ${proposed ? 'proposed' : 'accepted'} edits at one boundary`, () => {
      const { left, right } = connected();
      left.view.update.text.insert('q', { at: point(4) });
      sync(left.doc, right.doc);
      for (let count = 1; count <= 5; count++) {
        (proposed ? left.view : left.editor).update.text.insert('x', {
          at: point(0),
        });
        sync(left.doc, right.doc);
        assert.deepEqual(right.view.read.children(), [
          paragraph(`${'x'.repeat(count)}Baseq`),
        ]);
        assert.deepEqual(right.editor.read.children(), [
          paragraph(`${proposed ? '' : 'x'.repeat(count)}Base`),
        ]);
      }
      const restored = createEditor({
        plugins: [authored({ authorId: 'bob' })],
        initialValue: JSON.parse(JSON.stringify(right.editor.read.value())),
      });
      const restoredView = createEditorView(restored, {
        authored: { intent: 'propose', projection: 'proposed' },
      });
      assert.deepEqual(
        restoredView.read.children(),
        right.view.read.children()
      );
      assert.deepEqual(restored.read.children(), right.editor.read.children());
    });
  }

  for (const action of ['accept', 'reject'] as const) {
    it(`publishes a remote ${action} with matching accepted and proposed commits`, () => {
      const { left, right } = connected();
      left.view.update.text.insert(' draft', { at: point(4) });
      sync(left.doc, right.doc);
      const selection = right.editor.read.authored.select({
        status: 'pending',
      });
      const published: Array<{
        accepted: unknown;
        proposed: unknown;
        status: unknown;
      }> = [];
      left.view.subscribeCommit(() =>
        published.push({
          accepted: left.editor.read.children(),
          proposed: left.view.read.children(),
          status: left.editor.read.authored.change(selection.changes[0].id)
            ?.status,
        })
      );
      assert.equal(
        right.editor.update.authored.decide({ action, selection }).status,
        'applied'
      );
      sync(right.doc, left.doc);
      const expected = [paragraph(action === 'accept' ? 'Base draft' : 'Base')];
      for (const peer of [left, right]) {
        assert.deepEqual(peer.editor.read.children(), expected);
        assert.deepEqual(peer.view.read.children(), expected);
      }
      assert.deepEqual(published, [
        {
          accepted: expected,
          proposed: expected,
          status: action === 'accept' ? 'accepted' : 'rejected',
        },
      ]);
    });
  }

  it('replays a peer local undo and redo without recording remote history', () => {
    const { left, right } = connected();
    left.view.update.text.insert(' draft', { at: point(4) });
    sync(left.doc, right.doc);
    left.view.api.history.undo();
    sync(left.doc, right.doc);
    assert.deepEqual(right.view.read.children(), [paragraph('Base')]);
    left.view.api.history.redo();
    sync(left.doc, right.doc);
    assert.deepEqual(right.view.read.children(), [paragraph('Base draft')]);
    assert.deepEqual(right.editor.read.children(), [paragraph('Base')]);
    assert.equal(right.editor.read.history().undos.length, 0);
  });

  it('merges independent proposals from disconnected peers', () => {
    const { left, right } = connected([paragraph('A'), paragraph('B')]);
    left.view.update.text.insert('q', { at: point(1) });
    right.view.update.text.insert('z', { at: point(1, 1) });
    sync(left.doc, right.doc);
    sync(right.doc, left.doc);
    for (const peer of [left, right]) {
      assert.deepEqual(peer.editor.read.children(), [
        paragraph('A'),
        paragraph('B'),
      ]);
      assert.deepEqual(peer.view.read.children(), [
        paragraph('Aq'),
        paragraph('Bz'),
      ]);
      assert.equal(
        peer.editor.read.authored.changes({ status: 'pending' }).items.length,
        2
      );
      const restored = createEditor({
        plugins: [authored({ authorId: 'reader' })],
        initialValue: JSON.parse(JSON.stringify(peer.editor.read.value())),
      });
      const restoredView = createEditorView(restored, {
        authored: { intent: 'propose', projection: 'proposed' },
      });
      assert.deepEqual(restoredView.read.children(), peer.view.read.children());
    }
  });

  it('keeps concurrent opposite decisions conflicted on both peers', () => {
    const { left, right } = connected();
    left.view.update.text.insert('q', { at: point(4) });
    sync(left.doc, right.doc);
    const selection = left.editor.read.authored.select({ status: 'pending' });
    assert.equal(
      left.editor.update.authored.decide({ action: 'accept', selection })
        .status,
      'applied'
    );
    assert.equal(
      right.editor.update.authored.decide({ action: 'reject', selection })
        .status,
      'applied'
    );
    sync(left.doc, right.doc);
    sync(right.doc, left.doc);
    for (const peer of [left, right]) {
      assert.equal(
        peer.editor.read.authored.change(selection.changes[0].id)?.status,
        'conflicted'
      );
      assert.deepEqual(peer.editor.read.children(), [paragraph('Base')]);
      assert.deepEqual(peer.view.read.children(), [paragraph('Baseq')]);
      const restored = createEditor({
        plugins: [authored({ authorId: 'reader' })],
        initialValue: JSON.parse(JSON.stringify(peer.editor.read.value())),
      });
      const view = createEditorView(restored, {
        authored: { intent: 'propose', projection: 'proposed' },
      });
      assert.deepEqual(view.read.children(), peer.view.read.children());
      assert.equal(
        restored.read.authored.change(selection.changes[0].id)?.status,
        'conflicted'
      );
    }
  });

  it('replays a concurrent late decision through compact closed content', () => {
    const payload = 'late-decision-retained-body-'.repeat(128);
    const left = createPeer(
      'alice',
      createDocument(),
      [paragraph('')],
      false,
      undefined,
      false
    );
    const rightDoc = createDocument();
    sync(left.doc, rightDoc);
    const right = createPeer(
      'bob',
      rightDoc,
      undefined,
      false,
      undefined,
      false
    );
    left.view.update.text.insert(payload, { at: point(0) });
    sync(left.doc, right.doc);
    const selection = left.editor.read.authored.select({ status: 'pending' });
    assert.equal(
      left.editor.update.authored.decide({ action: 'reject', selection })
        .status,
      'applied'
    );
    assert.equal(
      JSON.stringify(left.editor.read.value()).includes(payload),
      false
    );
    assert.equal(
      right.editor.update.authored.decide({ action: 'accept', selection })
        .status,
      'applied'
    );
    sync(left.doc, right.doc);
    sync(right.doc, left.doc);
    for (const peer of [left, right]) {
      assert.equal(
        peer.editor.read.authored.change(selection.changes[0].id)?.status,
        'conflicted'
      );
      assert.deepEqual(peer.editor.read.children(), [paragraph('')]);
      assert.deepEqual(peer.view.read.children(), [paragraph(payload)]);
    }
  });

  it('replays a concurrent late amendment through compact closed content', () => {
    const payload = 'late-amendment-retained-body-'.repeat(128);
    const left = createPeer(
      'alice',
      createDocument(),
      [paragraph('')],
      false,
      undefined,
      false
    );
    const rightDoc = createDocument();
    sync(left.doc, rightDoc);
    const right = createPeer(
      'bob',
      rightDoc,
      undefined,
      false,
      undefined,
      false
    );
    let changeId = '';
    left.editor.update((tx) => {
      changeId = tx.authored.propose();
      tx.text.insert(payload, { at: point(0) });
    });
    sync(left.doc, right.doc);
    assert.equal(
      right.editor.update.authored.decide({
        action: 'reject',
        selection: right.editor.read.authored.select({ ids: [changeId] }),
      }).status,
      'applied'
    );
    assert.equal(
      JSON.stringify(right.editor.read.value()).includes(payload),
      false
    );
    left.editor.update((tx) => {
      tx.authored.propose({ changeId });
      tx.text.insert('!', { at: point(payload.length) });
    });
    sync(right.doc, left.doc);
    sync(left.doc, right.doc);
    for (const peer of [left, right]) {
      assert.equal(
        peer.editor.read.authored.change(changeId)?.status,
        'conflicted'
      );
      assert.deepEqual(peer.editor.read.children(), [paragraph('')]);
      assert.deepEqual(peer.view.read.children(), [paragraph(`${payload}!`)]);
    }
  });

  it('keeps overlapping atomic decisions in one conflicted component', () => {
    const { left, right } = connected(['A', 'B', 'C'].map(paragraph));
    for (let block = 0; block < 3; block++) {
      left.view.update.text.insert('q', { at: point(1, block) });
    }
    sync(left.doc, right.doc);
    const ids = left.editor.read.authored
      .changes({ status: 'pending' })
      .items.map((change) => change.id);
    assert.equal(
      left.editor.update.authored.decide({
        action: 'accept',
        selection: left.editor.read.authored.select({ ids: ids.slice(0, 2) }),
      }).status,
      'applied'
    );
    assert.equal(
      right.editor.update.authored.decide({
        action: 'reject',
        selection: right.editor.read.authored.select({ ids: ids.slice(1) }),
      }).status,
      'applied'
    );
    sync(left.doc, right.doc);
    sync(right.doc, left.doc);
    for (const peer of [left, right]) {
      assert.deepEqual(
        peer.editor.read.children(),
        ['A', 'B', 'C'].map(paragraph)
      );
      assert.deepEqual(
        peer.view.read.children(),
        ['Aq', 'Bq', 'Cq'].map(paragraph)
      );
      for (const id of ids) {
        assert.equal(
          peer.editor.read.authored.change(id)?.status,
          'conflicted'
        );
      }
    }
  });

  for (const action of ['accept', 'reject'] as const) {
    for (const first of ['amendment', 'decision'] as const) {
      it(`preserves an amendment concurrent with ${action} when ${first} arrives first`, () => {
        const { left, right } = connected();
        let changeId = '';
        left.editor.update((tx) => {
          changeId = tx.authored.propose();
          tx.text.insert('q', { at: point(4) });
        });
        sync(left.doc, right.doc);
        assert.equal(
          right.editor.update.authored.decide({
            action,
            selection: right.editor.read.authored.select({ ids: [changeId] }),
          }).status,
          'applied'
        );
        left.editor.update((tx) => {
          tx.authored.propose({ changeId });
          tx.text.insert('x', { at: point(5) });
        });
        const peers = first === 'amendment' ? [left, right] : [right, left];
        sync(peers[0].doc, peers[1].doc);
        sync(peers[1].doc, peers[0].doc);
        for (const peer of [left, right]) {
          assert.equal(
            peer.editor.read.authored.change(changeId)?.status,
            'conflicted'
          );
          assert.deepEqual(peer.editor.read.children(), [paragraph('Base')]);
          assert.deepEqual(peer.view.read.children(), [paragraph('Baseqx')]);
          const restored = createEditor({
            plugins: [authored({ authorId: 'reader' })],
            initialValue: JSON.parse(JSON.stringify(peer.editor.read.value())),
          });
          const view = createEditorView(restored, {
            authored: { intent: 'propose', projection: 'proposed' },
          });
          assert.deepEqual(view.read.children(), peer.view.read.children());
          assert.equal(
            restored.read.authored.change(changeId)?.status,
            'conflicted'
          );
        }
      });
    }
  }

  for (const proposed of [true, false]) {
    it(`keeps three concurrent ${proposed ? 'proposed' : 'accepted'} insertion sequences contiguous`, () => {
      const first = createPeer('alice', createDocument(), [paragraph('Base')]);
      const peers = [first];
      for (const authorId of ['bob', 'carol']) {
        const doc = createDocument();
        sync(first.doc, doc);
        peers.push(createPeer(authorId, doc));
      }
      for (const [index, peer] of peers.entries()) {
        const editor = proposed ? peer.view : peer.editor;
        editor.update.text.insert(['a', 'b', 'c'][index], { at: point(4) });
        editor.update.text.insert('1', { at: point(5) });
      }
      for (let round = 0; round < 3; round++) {
        sync(peers[1].doc, peers[2].doc);
        sync(peers[0].doc, peers[1].doc);
        sync(peers[2].doc, peers[0].doc);
      }
      const expected = peers[0].view.read.children();
      const { text } = expected[0].children[0];
      assert.match(text, /^Base(?:a1|b1|c1){3}$/);
      for (const sequence of ['a1', 'b1', 'c1']) {
        assert.equal(text.split(sequence).length, 2);
      }
      for (const peer of peers) {
        assert.deepEqual(peer.view.read.children(), expected);
        assert.deepEqual(
          peer.editor.read.children(),
          proposed ? [paragraph('Base')] : expected
        );
        const restored = createEditor({
          plugins: [authored({ authorId: 'reader' })],
          initialValue: JSON.parse(JSON.stringify(peer.editor.read.value())),
        });
        assert.deepEqual(
          createEditorView(restored, {
            authored: { intent: 'propose', projection: 'proposed' },
          }).read.children(),
          expected
        );
      }
    });

    it(`converges concurrent ${proposed ? 'proposed' : 'accepted'} insertions at the same gap`, () => {
      const { left, right } = connected();
      (proposed ? left.view : left.editor).update.text.insert('q', {
        at: point(4),
      });
      (proposed ? right.view : right.editor).update.text.insert('z', {
        at: point(4),
      });
      sync(left.doc, right.doc);
      sync(right.doc, left.doc);
      assert.deepEqual(
        left.editor.read.children(),
        right.editor.read.children()
      );
      assert.deepEqual(left.view.read.children(), right.view.read.children());
      const { text } = left.view.read.children()[0].children[0];
      assert.ok(text === 'Baseqz' || text === 'Basezq');
      assert.deepEqual(left.editor.read.children(), [
        paragraph(proposed ? 'Base' : text),
      ]);
      assert.equal(left.editor.read.authored.changes().items.length, 2);
      assert.equal(right.editor.read.authored.changes().items.length, 2);
    });
  }
});
