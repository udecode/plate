import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineCommand,
  definePlugin,
  type Descendant,
  DocumentChange,
  type Element,
  locateAt,
  type NodeTarget,
  type NodeKey,
  type Path,
  NodeApi,
  SelectionApi,
  txLocate,
  txOnly,
  txSelection,
} from 'plitejs';
import { history } from 'plitejs/history';

import { createAuthoredPlugin } from '../src/authored/authored';
import { DocumentIndex } from '../src/core/change/document-index';
import {
  projectionMapOf,
  registerEditorCommandDocument,
} from '../src/core/command-document';
import { evaluateCommand } from '../src/core/command-registry';
import { registerEditorDocumentRecorder } from '../src/core/document-recorder';
import { txStored } from '../src/core/tx-only';
import { readCoreWork, resetCoreWork } from '../src/core/work';
import { collectUpdateDeclarations } from './support/plugin-dispatch-census';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});
const value = () => ({
  children: [paragraph('main')],
  roots: { note: [paragraph('note')] },
});
const caret = (root?: string) => ({
  offset: 0,
  path: [0, 0],
  ...(root ? { root } : {}),
});
const selected = () => SelectionApi.nodes([[0]], { mode: 'block' });
const Inner = definePlugin('inner', {
  update: ({ tx }) => ({ write: () => tx.nodes.set({ nested: true }) }),
});
const Stamp = definePlugin('stamp', {
  update: ({ tx }) => ({
    write: txLocate(locateAt(0), (_options?: { at?: NodeTarget }) => {
      const root = tx.view.root();
      const selection = tx.selection();
      tx.nodes.set({ stamped: true }, { at: [0] });
      return { root, selection, block: tx.nodes.block() };
    }),
    pair: txLocate(
      locateAt(0, 'at', 'other'),
      (_options: { at: NodeTarget; other: NodeTarget }) => {
        tx.nodes.set({ stamped: true }, { at: [0] });
      }
    ),
    move: txLocate(
      locateAt(0),
      (options: { at: NodeTarget; main: NodeKey }) => {
        tx.selection.setNodes([options.main], { mode: 'block' });
        tx.nodes.set({ explicit: true }, { at: [0] });
        tx.nodes.set({ implicit: true });
      }
    ),
    nested: txLocate(locateAt(0), (_options: { at: NodeTarget }) =>
      tx.plugin(Inner).write()
    ),
    only: txOnly(() => tx.view.root()),
    control: txOnly(
      Object.assign(() => undefined, {
        configure: (_value: number) => tx.view.root(),
      })
    ),
    stored: txStored(() => tx.view.root()),
    selection: txSelection(() => tx.view.root()),
    bad: (at: Path | NodeKey) => tx.nodes.set({ stamped: true }, { at }),
    badCallback: (fn: () => void) => fn(),
    deep: {
      nested: {
        bad: (at: Path | NodeKey) => tx.nodes.set({ stamped: true }, { at }),
      },
    },
    callable: Object.assign(() => undefined, {
      bad: (at: Path | NodeKey) => tx.nodes.set({ stamped: true }, { at }),
    }),
  }),
});

describe('plugin root dispatch', () => {
  it('runs a base command with no target in the caret root', () => {
    const editor = createEditor({ plugins: [Stamp], initialValue: value() });
    editor.update.selection.set(caret('note'));
    editor.update.stamp.write();
    assert.deepEqual(editor.read.value(), {
      ...value(),
      roots: { note: [{ ...paragraph('note'), stamped: true }] },
    });
  });

  it('routes a note key and hides a foreign default selection', () => {
    const editor = createEditor({ plugins: [Stamp], initialValue: value() });
    const key = editor.key(editor.read.root('note')[0]);
    editor.update.selection.set(caret());
    const result = editor.update.stamp.write({ at: key });
    assert.ok(result);
    assert.deepEqual(
      {
        root: result.root,
        selection: result.selection,
        block: result.block,
        value: editor.read.value(),
      },
      {
        root: 'note',
        selection: null,
        block: undefined,
        value: {
          ...value(),
          roots: { note: [{ ...paragraph('note'), stamped: true }] },
        },
      }
    );
  });

  it('routes a main key from a note view through a main view', () => {
    const editor = createEditor({ plugins: [Stamp], initialValue: value() });
    const view = createEditorView(editor, { root: 'note' });
    const result = view.update.stamp.write({
      at: editor.key(editor.read.children()[0]),
    });
    assert.ok(result);
    assert.deepEqual(
      { root: result.root, value: editor.read.value() },
      {
        root: undefined,
        value: {
          ...value(),
          children: [{ ...paragraph('main'), stamped: true }],
        },
      }
    );
  });

  it('refuses targets in two roots before running the body', () => {
    const editor = createEditor({ plugins: [Stamp], initialValue: value() });
    assert.throws(
      () =>
        editor.update.stamp.pair({
          at: editor.key(editor.read.children()[0]),
          other: editor.key(editor.read.root('note')[0]),
        }),
      /root/i
    );
    assert.deepEqual(editor.read.value(), value());
  });

  it('keeps a missing key in the caller root', () => {
    const editor = createEditor({ plugins: [Stamp], initialValue: value() });
    const key = editor.key(editor.read.root('note')[0]);
    createEditorView(editor, { root: 'note' }).update.nodes.remove({ at: [0] });
    const result = editor.update.stamp.write({ at: key });
    assert.ok(result);
    assert.equal(result.root, undefined);
    assert.equal(editor.read.children()[0].stamped, true);
  });

  it('keeps explicit writes in the routed root after moving the selection out', () => {
    const editor = createEditor({ plugins: [Stamp], initialValue: value() });
    editor.update.selection.set(caret('note'));
    editor.update.stamp.move({
      at: editor.key(editor.read.root('note')[0]),
      main: editor.key(editor.read.children()[0]),
    });
    assert.deepEqual(editor.read.value(), {
      ...value(),
      roots: { note: [{ ...paragraph('note'), explicit: true }] },
    });
  });

  it('commits routed content once and restores it with one undo', () => {
    const editor = createEditor({
      plugins: [Stamp, history()],
      initialValue: value(),
    });
    editor.update.selection.set(caret('note'));
    let commits = 0;
    const unsubscribe = editor.subscribeCommit(() => (commits += 1));
    editor.update.stamp.write();
    const written = editor.read.root('note')[0].stamped;
    editor.api.history.undo();
    unsubscribe();
    assert.deepEqual(
      { commits, written, value: editor.read.value() },
      { commits: 2, written: true, value: value() }
    );
  });

  for (const member of ['bad', 'deep', 'callable'] as const) {
    it(`refuses undeclared arguments at ${member} on every call without a review tree`, () => {
      const editor = createEditor({ plugins: [Stamp], initialValue: value() });
      for (let i = 0; i < 2; i += 1) {
        assert.throws(
          () =>
            editor.update((tx) => {
              if (member === 'bad') tx.stamp.bad([0]);
              else if (member === 'deep') tx.stamp.deep.nested.bad([0]);
              else tx.stamp.callable.bad([0]);
            }),
          /declare txLocate/
        );
      }
    });
  }

  it('refuses an undeclared function argument too', () => {
    const editor = createEditor({ plugins: [Stamp], initialValue: value() });
    assert.throws(
      () => editor.update.stamp.badCallback(() => {}),
      /declare txLocate/
    );
  });

  it('keeps non-content markers on the caller transaction', () => {
    const editor = createEditor({ plugins: [Stamp], initialValue: value() });
    editor.update.selection.set(caret('note'));
    editor.update((tx) =>
      assert.deepEqual(
        [tx.stamp.only(), tx.stamp.stored(), tx.stamp.selection()],
        [undefined, undefined, undefined]
      )
    );
    createEditorView(editor, { root: 'note' }).update((tx) =>
      assert.deepEqual(
        [tx.stamp.only(), tx.stamp.stored(), tx.stamp.selection()],
        ['note', 'note', 'note']
      )
    );
  });

  it('keeps members of a transaction-only group on the caller transaction', () => {
    const editor = createEditor({ plugins: [Stamp], initialValue: value() });
    editor.update.selection.set(caret('note'));
    editor.update((tx) =>
      assert.equal(tx.stamp.control.configure(1), undefined)
    );
    createEditorView(editor, { root: 'note' }).update((tx) =>
      assert.equal(tx.stamp.control.configure(1), 'note')
    );
  });

  it('keeps cached member identity', () => {
    const editor = createEditor({ plugins: [Stamp], initialValue: value() });
    editor.update((tx) => {
      assert.equal(tx.stamp.write, tx.stamp.write);
    });
  });

  it('does no dispatch work when an update calls no plugin method', () => {
    const editor = createEditor({ plugins: [Stamp], initialValue: value() });
    resetCoreWork();
    editor.update((tx) => tx.nodes.set({ typed: true }, { at: [0] }));
    assert.equal(
      'pluginDispatches' in readCoreWork()
        ? readCoreWork().pluginDispatches
        : 0,
      0
    );
  });

  it('keeps a nested no-target call in its outer routed root', () => {
    const editor = createEditor({
      plugins: [Stamp, Inner],
      initialValue: value(),
    });
    editor.update.selection.set(caret('note'));
    editor.update.stamp.nested({ at: editor.key(editor.read.children()[0]) });
    assert.deepEqual(editor.read.value(), value());
  });

  it('runs a nested no-target write in the routed note', () => {
    const editor = createEditor({
      plugins: [Stamp, Inner],
      initialValue: value(),
    });
    editor.update.selection.set(caret('note'));
    editor.update.stamp.nested({ at: editor.key(editor.read.root('note')[0]) });
    assert.deepEqual(editor.read.value(), {
      ...value(),
      roots: { note: [{ ...paragraph('note'), nested: true }] },
    });
  });

  it('resolves tx.plugin to the groups of the root the call runs in', () => {
    const Reader = definePlugin('reader', {
      update: ({ tx }) => ({
        first: txOnly(() => NodeApi.string(tx.children()[0])),
      }),
    });
    const Relay = definePlugin('relay', {
      update: ({ tx }) => ({
        read: txLocate(locateAt(0), (_options: { at: NodeTarget }) =>
          tx.plugin(Reader).first()
        ),
      }),
    });
    const editor = createEditor({
      plugins: [Reader, Relay],
      initialValue: value(),
    });
    let fromView: string | undefined;
    createEditorView(editor, { root: 'note' }).update((tx) => {
      fromView = tx.plugin(Reader).first();
    });
    assert.deepEqual(
      {
        fromView,
        routed: editor.update.relay.read({
          at: editor.key(editor.read.root('note')[0]),
        }),
      },
      { fromView: 'note', routed: 'note' }
    );
  });

  it('locates a routed method once and counts one dispatch', () => {
    let calls = 0;
    const Counted = definePlugin('counted', {
      update: ({ tx }) => ({
        write: txLocate(
          (args, place) => {
            calls += 1;
            return locateAt(0)(args, place);
          },
          (_options: { at: NodeTarget }) =>
            tx.nodes.set({ counted: true }, { at: [0] })
        ),
      }),
    });
    const editor = createEditor({ plugins: [Counted], initialValue: value() });
    const key = editor.key(editor.read.root('note')[0]);
    resetCoreWork();
    editor.update.counted.write({ at: key });
    assert.deepEqual(
      {
        calls,
        dispatches: readCoreWork().pluginDispatches,
        written: editor.read.root('note')[0].counted,
      },
      { calls: 1, dispatches: 1, written: true }
    );
  });

  it('routes a key without work in the roots it does not touch', () => {
    const work = (count: number) => {
      const last = `note${count - 1}`;
      const editor = createEditor({
        plugins: [Stamp],
        initialValue: {
          children: [paragraph('main')],
          roots: Object.fromEntries(
            Array.from({ length: count }, (_, index) => [
              `note${index}`,
              [paragraph(`note ${index}`)],
            ])
          ),
        },
      });
      const key = editor.key(editor.read.root(last)[0]);
      editor.update.stamp.write({ at: key });
      resetCoreWork();
      editor.update.stamp.write({ at: key });
      editor.update((tx) => tx.nodes.set({ typed: true }, { at: [0] }));
      const { rootSnapshots, snapshotIndexes } = readCoreWork();
      return { rootSnapshots, snapshotIndexes };
    };
    assert.deepEqual(work(20), work(2));
  });

  it('builds each root index once when a transaction looks up a missing key again', () => {
    const work = (calls: number) => {
      const editor = createEditor({
        plugins: [Stamp],
        initialValue: {
          children: [paragraph('main'), paragraph('gone')],
          roots: Object.fromEntries(
            Array.from({ length: 20 }, (_, index) => [
              `note${index}`,
              [paragraph(`note ${index}`)],
            ])
          ),
        },
      });
      const key = editor.key(editor.read.children()[1]);
      editor.update((tx) => tx.nodes.remove({ at: [1] }));
      resetCoreWork();
      editor.update((tx) => {
        for (let call = 0; call < calls; call += 1) tx.stamp.write({ at: key });
      });
      return readCoreWork().snapshotIndexes;
    };
    assert.equal(work(3), work(1));
  });

  it('keeps the namespace a shared method was called through', () => {
    const Alias = definePlugin('alias', {
      update: ({ tx }) => {
        const write = txLocate(false, function write(this: { label: string }) {
          tx.nodes.set({ which: this.label }, { at: [0] });
        });
        return { a: { label: 'A', write }, b: { label: 'B', write } };
      },
    });
    const editor = createEditor({ plugins: [Alias], initialValue: value() });
    editor.update.selection.set(caret('note'));
    editor.update((tx) => {
      tx.alias.a.write();
      tx.alias.b.write();
    });
    assert.deepEqual(editor.read.root('note'), [
      { ...paragraph('note'), which: 'B' },
    ]);
  });

  it('keeps root dispatch for a namespace a transaction-only group also holds', () => {
    const Alias = definePlugin('alias', {
      update: ({ tx }) => {
        const shared = {
          write: txLocate(false, () =>
            tx.nodes.set({ written: true }, { at: [0] })
          ),
        };
        return {
          direct: txOnly(Object.assign(() => {}, { nested: shared })),
          normal: shared,
        };
      },
    });
    const editor = createEditor({ plugins: [Alias], initialValue: value() });
    editor.update.selection.set(caret('note'));
    editor.update((tx) => {
      void tx.alias.direct.nested.write;
      tx.alias.normal.write();
    });
    assert.deepEqual(editor.read.value(), {
      ...value(),
      roots: { note: [{ ...paragraph('note'), written: true }] },
    });
  });

  it('keeps symbol-keyed namespaces apart when they share a method', () => {
    const first = Symbol('scope');
    const second = Symbol('scope');
    const labels: string[] = [];
    const Alias = definePlugin('alias', {
      update: ({ tx }) => {
        const write = txLocate(false, function write(this: { label: string }) {
          labels.push(this.label);
          tx.nodes.set({ which: this.label }, { at: [0] });
        });
        return {
          [first]: { label: 'A', write },
          [second]: { label: 'B', write },
        };
      },
    });
    const editor = createEditor({ plugins: [Alias], initialValue: value() });
    editor.update.selection.set(caret('note'));
    editor.update((tx) => {
      tx.alias[first].write();
      tx.alias[second].write();
    });
    assert.deepEqual(labels, ['A', 'B']);
    assert.deepEqual(editor.read.root('note'), [
      { ...paragraph('note'), which: 'B' },
    ]);
  });

  it('routes the callable update group of a plugin named plugin', () => {
    const Plugin = definePlugin('plugin', {
      update:
        ({ tx }) =>
        () =>
          tx.nodes.set({ called: true }, { at: [0] }),
    });
    const editor = createEditor({ plugins: [Plugin], initialValue: value() });
    editor.update.selection.set(caret('note'));
    editor.update((tx) => tx.plugin(Plugin)());
    assert.deepEqual(editor.read.value(), {
      ...value(),
      roots: { note: [{ ...paragraph('note'), called: true }] },
    });
  });
});

function hideMarked(nodes: readonly Element[]): readonly Element[];
function hideMarked(nodes: readonly Descendant[]): readonly Descendant[];
function hideMarked(nodes: readonly Descendant[]): readonly Descendant[] {
  return Object.freeze(
    nodes.flatMap<Descendant>((node) => {
      if (node.hidden) return [];
      return NodeApi.isElement(node)
        ? [Object.freeze({ ...node, children: hideMarked(node.children) })]
        : [node];
    })
  );
}

type Tx = Parameters<
  Parameters<ReturnType<typeof createEditor>['update']>[0]
>[0];

describe('callbacks that run in a named root', () => {
  const Calls = definePlugin('calls', {
    update: ({ tx }) => ({
      plain: () => {
        tx.text.insert('P', { at: caret() });
      },
      only: txOnly(() => {
        tx.text.insert('O', { at: caret() });
      }),
      none: txLocate(false, () => {
        tx.text.insert('N', { at: caret() });
      }),
      wrap: txLocate(false, (fn: () => void) => {
        fn();
        tx.text.insert('W', { at: caret() });
      }),
      at: txLocate(locateAt(0), ({ at }: { at: ReturnType<typeof caret> }) => {
        tx.text.insert('A', { at });
      }),
      caret: txSelection(() => {
        tx.selection.set({ path: [0, 0], offset: 1 });
      }),
    }),
  });

  for (const via of ['base editor', 'main view'] as const) {
    it(`keeps the ${via}'s root for calls in a match on a note node`, () => {
      const editor = createEditor({ plugins: [Calls], initialValue: value() });
      const noteKey = editor.key(editor.read.root('note')[0]);
      editor.update.selection.set(caret());
      const caller = via === 'base editor' ? editor : createEditorView(editor);

      caller.update((tx) => {
        tx.nodes.remove({
          at: noteKey,
          match: () => {
            tx.text.insert('R', { at: caret() });
            tx.plugin(Calls).plain();
            tx.plugin(Calls).only();
            tx.plugin(Calls).none();
            tx.plugin(Calls).wrap(() => {});
            tx.plugin(Calls).at({ at: caret() });
            tx.plugin(Calls).caret();
            return false;
          },
        });
      });

      assert.deepEqual(
        {
          main: NodeApi.string(editor.read.children()[0]),
          note: NodeApi.string(editor.read.root('note')[0]),
          selection: editor.read.selection(),
        },
        {
          main: 'AWNOPRmain',
          note: 'note',
          selection: {
            anchor: { path: [0, 0], offset: 1 },
            focus: { path: [0, 0], offset: 1 },
          },
        }
      );
    });
  }

  type Hit = <T>(result: T) => T;
  const callbacks = {
    'a read match': (tx: Tx, at: NodeKey, hit: Hit) =>
      tx.nodes.blocks({ at, match: () => hit(false) }),
    'a set compare': (tx: Tx, at: NodeKey, hit: Hit) =>
      tx.nodes.set({ checked: true }, { at, compare: () => hit(true) }),
    'a blocks.set props function': (tx: Tx, at: NodeKey, hit: Hit) =>
      tx.blocks.set(() => hit({ checked: true }), { at }),
    'an insert split match': (tx: Tx, _at: NodeKey, hit: Hit) =>
      tx.nodes.insert(paragraph('x'), {
        at: caret('note'),
        split: { match: () => hit(false) },
      }),
  };

  for (const [kind, call] of Object.entries(callbacks)) {
    for (const via of ['base editor', 'main view'] as const) {
      it(`keeps the ${via}'s root inside ${kind} on a note node`, () => {
        const editor = createEditor({ initialValue: value() });
        const noteKey = editor.key(editor.read.root('note')[0]);
        const caller =
          via === 'base editor' ? editor : createEditorView(editor);
        let hits = 0;

        caller.update((tx) => {
          call(tx, noteKey, (result) => {
            hits += 1;
            tx.text.insert('R', { at: caret() });
            return result;
          });
        });

        assert.ok(hits > 0);
        assert.equal(
          NodeApi.string(editor.read.children()[0]),
          `${'R'.repeat(hits)}main`
        );
        assert.ok(!NodeApi.string(editor.read.root('note')[0]).includes('R'));
      });
    }
  }
});

describe('named root command frames', () => {
  const Marker = definePlugin('marker', {
    update: () => ({
      mark: txLocate(
        locateAt(0, 'key'),
        ({ key }: { key: NodeKey }, done: (key: NodeKey) => void) => done(key)
      ),
    }),
  });
  const noteFrame = () => {
    const editor = createEditor({
      plugins: [Stamp, Marker],
      initialValue: {
        children: [paragraph('main')],
        roots: {
          note: [
            { ...paragraph('gone'), hidden: true },
            {
              type: 'paragraph',
              children: [{ text: 'removed', hidden: true }, { text: 'note' }],
            },
          ],
        },
      },
    });
    editor.update.selection.set({ path: [1, 1], offset: 0, root: 'note' });
    registerEditorDocumentRecorder(
      editor,
      ({ change, projection, selection }) => ({
        change: projection ? projection.map.change().compose(change) : change,
        selection,
      })
    );
    registerEditorCommandDocument(editor, {
      project(stored) {
        const kept = hideMarked(stored.roots?.note ?? []);
        const projected = Object.freeze({
          ...stored,
          roots: Object.freeze({ ...stored.roots, note: kept }),
        });
        return {
          indexes: new Map([['note', DocumentIndex.fromValue(kept)]]),
          map: projectionMapOf(DocumentChange.between(stored, projected)),
          value: projected,
        };
      },
    });
    return editor;
  };

  for (const target of ['caret', 'hidden-key', 'visible-key'] as const) {
    it(`maps the note projection for a ${target} command`, () => {
      const editor = noteFrame();
      const note = editor.read.root('note');
      const key = editor.key(note[target === 'hidden-key' ? 0 : 1]);
      const result = editor.update.stamp.write(
        target === 'caret' ? undefined : { at: key }
      );
      if (target === 'hidden-key') {
        assert.equal(result, undefined);
        assert.equal(editor.read.root('note')[1].stamped, undefined);
      } else {
        assert.equal(result?.root, 'note');
        assert.deepEqual(editor.read.value(), {
          ...value(),
          roots: { note: [{ ...paragraph('note'), stamped: true }] },
        });
      }
    });
  }

  it('maps a note key into the note projection when the call also passes a callback', () => {
    const editor = noteFrame();
    const [hidden, live] = editor.read
      .root('note')
      .map((node) => editor.key(node));
    const done: NodeKey[] = [];

    editor.update.marker.mark({ key: hidden }, (key) => done.push(key));
    editor.update.marker.mark({ key: live }, (key) => done.push(key));

    assert.deepEqual(done, [live]);
  });

  for (const root of ['main', 'note'] as const) {
    it(`keeps ${root} keys after a command reads the proposed document`, () => {
      const Writer = definePlugin('writer', {
        update: ({ tx }) => ({
          mark: txLocate(locateAt(0), ({ at }: { at: NodeKey }) =>
            tx.nodes.set({ marked: true }, { at })
          ),
        }),
      });
      let change = 0;
      const blocks = ['A', 'B', 'C', 'D', 'E'].map((text) => paragraph(text));
      const editor = createEditor({
        initialValue:
          root === 'main'
            ? blocks
            : { children: [paragraph('main')], roots: { note: blocks } },
        plugins: [
          Writer,
          createAuthoredPlugin({
            authorId: 'ann',
            createChangeId: () => `change:${(change += 1)}`,
            intent: 'propose',
            now: () => 1,
          }),
        ],
      });
      const view =
        root === 'main' ? editor : createEditorView(editor, { root });
      const key = editor.key(view.read.children()[3]);
      let read: string | undefined;

      view.update((tx) =>
        tx.nodes.remove({
          at: SelectionApi.nodes([[0], [1]], { mode: 'block' }),
        })
      );
      evaluateCommand(
        editor,
        defineCommand('test.readByKey', {
          build: ({ state }) => {
            const entry = state.nodes.get(key);
            read = entry && NodeApi.string(entry[0]);
            return false;
          },
        })
      );
      editor.update.writer.mark({ at: key });

      assert.equal(read, 'D');
      assert.deepEqual(
        createEditorView(editor, {
          authored: { preview: 'proposed' },
          ...(root === 'main' ? {} : { root }),
        })
          .read.children()
          .map((node) => [NodeApi.string(node), 'marked' in node]),
        [
          ['C', false],
          ['D', true],
          ['E', false],
        ]
      );
    });
  }
});

describe('live node and key targets', () => {
  for (const by of ['node', 'key'] as const) {
    for (const operation of [
      ...(by === 'node' ? (['set'] as const) : []),
      'replace',
      'toArray',
      'blocks',
      'toggle',
      'duplicate',
    ] as const) {
      it(`${operation} reaches a note by ${by} from main`, () => {
        const editor = createEditor({ initialValue: value() });
        const node = editor.read.root('note')[0];
        const at = by === 'node' ? node : editor.key(node);
        if (operation === 'toArray' || operation === 'blocks') {
          assert.deepEqual(
            editor.read.nodes[operation]({ at, type: 'paragraph' }),
            [[node, [0]]]
          );
          return;
        }
        editor.update((tx) => {
          if (operation === 'set') {
            tx.nodes.set({ stamped: true }, { at: node });
          }
          if (operation === 'replace') {
            tx.nodes.replace(paragraph('replacement'), { at });
          }
          if (operation === 'toggle') {
            tx.blocks.toggle({ type: 'paragraph', stamped: true }, { at });
          }
          if (operation === 'duplicate') tx.blocks.duplicate({ at });
        });
        const note =
          operation === 'replace'
            ? [paragraph('replacement')]
            : operation === 'duplicate'
              ? [paragraph('note'), paragraph('note')]
              : [{ ...paragraph('note'), stamped: true }];
        assert.deepEqual(editor.read.value(), { ...value(), roots: { note } });
      });
    }
  }
  it('keeps nodes.path scoped to its reader root', () => {
    const editor = createEditor({ initialValue: value() });
    assert.equal(
      editor.read.nodes.path(editor.read.root('note')[0]),
      undefined
    );
  });
});

describe('node selection input roots', () => {
  const stamped = (text: string) => ({ ...paragraph(text), stamped: true });
  const cases = [
    ...(
      [
        'set',
        'unset',
        'toggle',
        'duplicate',
        'string',
        'toArray',
        'blocks',
        'entries',
        'slice',
        'insert',
      ] as const
    ).map((operation) => ({ operation, stored: false })),
    ...(['set', 'unset', 'toggle', 'duplicate', 'string'] as const).map(
      (operation) => ({ operation, stored: true })
    ),
  ];

  for (const { operation, stored } of cases) {
    it(
      stored
        ? `${operation} keeps a stored note selection's root on the main editor`
        : `${operation} reads an explicit rootless node selection in the view's root`,
      () => {
        const editor = createEditor({
          initialValue: {
            children: [stamped('main')],
            roots: { note: [stamped('note')] },
          },
        });
        const reader = stored
          ? editor
          : createEditorView(editor, { root: 'note' });
        const options = stored ? undefined : { at: selected() };
        if (stored) {
          editor.update.selection.set(
            SelectionApi.nodes([[0]], { mode: 'block', root: 'note' })
          );
        }
        if (operation === 'string') {
          assert.equal(reader.read.text.string(options?.at), 'note');
          return;
        }
        if (operation === 'toArray' || operation === 'blocks') {
          assert.equal(
            NodeApi.string(reader.read.nodes[operation](options)[0][0]),
            'note'
          );
          return;
        }
        if (operation === 'entries') {
          assert.equal(
            NodeApi.string(
              Array.from(reader.read.nodes.entries(options))[0][0]
            ),
            'note'
          );
          return;
        }
        if (operation === 'slice') {
          assert.deepEqual(reader.read.slice.get(options).content, [
            stamped('note'),
          ]);
          return;
        }
        reader.update((tx) => {
          if (operation === 'set') tx.nodes.set({ changed: true }, options);
          if (operation === 'unset') tx.nodes.unset('stamped', options);
          if (operation === 'toggle') {
            tx.blocks.toggle({ type: 'paragraph', changed: true }, options);
          }
          if (operation === 'duplicate') tx.blocks.duplicate(options);
          if (operation === 'insert') {
            tx.blocks.insert(paragraph('inserted'), { after: selected() });
          }
        });
        assert.deepEqual(
          {
            main: editor.read.children(),
            note: editor.read.root('note'),
          },
          {
            main: [stamped('main')],
            note:
              operation === 'duplicate'
                ? [stamped('note'), stamped('note')]
                : operation === 'insert'
                  ? [stamped('note'), paragraph('inserted')]
                  : operation === 'unset'
                    ? [paragraph('note')]
                    : [{ ...stamped('note'), changed: true }],
          }
        );
      }
    );
  }
});

describe('plugin update census', () => {
  it('flags an undeclared method whose only parameter has a default', () => {
    const Defaulted = definePlugin('defaulted', {
      update: () => ({ set: (_options: { at?: NodeTarget } = {}) => {} }),
    });
    const editor = createEditor({
      plugins: [Defaulted],
      initialValue: value(),
    });

    assert.deepEqual(collectUpdateDeclarations(editor).undeclared, [
      'defaulted.set',
    ]);
  });

  it('counts txOnly as declaring its members, and walks symbol-keyed methods', () => {
    const write = Symbol('write');
    const Members = definePlugin('members', {
      update: ({ tx }) => ({
        control: txOnly(
          Object.assign(() => undefined, {
            configure: (_value: number) => tx.view.root(),
          })
        ),
        [write]: (_text: string) => {},
      }),
    });
    const editor = createEditor({ plugins: [Members], initialValue: value() });

    assert.deepEqual(collectUpdateDeclarations(editor).undeclared, [
      'members.Symbol(write)',
    ]);
  });
});
