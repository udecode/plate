import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { runInNewContext } from 'node:vm';

import {
  createEditor,
  defineEffect,
  definePlugin,
  definePluginSlot,
  type EditorLifecycleError,
  type Element,
  type HistoryResult,
} from 'plitejs';

import { History, history } from '../../src/history';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
};

const settled = (result: HistoryResult) => {
  assert.ok(result.status === 'pending');
  return result.settled;
};

type Transition = Readonly<{ previous: string; value: string }>;
type ReplayOutcome = 'applied' | 'blocked' | 'throw';
type ReplayResult =
  | Readonly<{ status: 'applied'; value: Transition }>
  | Readonly<{ reason: string; status: 'blocked' }>;
let nextSessionEffect = 1;

const createSessionHarness = ({
  lifecycleErrorSink,
  ...options
}: {
  lifecycleErrorSink?: (error: EditorLifecycleError) => void;
  maxDepth?: number;
} = {}) => {
  let external = 'comment';
  let replay: (transition: Transition) => Promise<ReplayResult> = async (
    transition
  ) => {
    external = transition.value;
    return { status: 'applied' as const, value: transition };
  };
  const sessionEffect = defineEffect<Transition>({
    history: {
      replay: (_editor, transition) => replay(transition),
    },
    invert: ({ previous, value }) => ({ previous: value, value: previous }),
    key: `history.session.${nextSessionEffect}`,
  });
  nextSessionEffect += 1;
  const editor = createEditor({
    lifecycleErrorSink,
    plugins: [
      history(options),
      definePlugin(`history-session-${nextSessionEffect}`, {
        effectTypes: [sessionEffect],
      }),
    ],
    initialValue: [paragraph('')],
  });

  editor.update({ history: 'new-batch' }, (tx) => {
    tx.text.insert('A', { at: { offset: 0, path: [0, 0] } });
  });
  editor.update((tx) => {
    tx.effects.emit(sessionEffect, { previous: '', value: 'comment' });
  });

  return {
    defer(outcome: ReplayOutcome) {
      const gate = deferred<void>();

      replay = async (transition) => {
        await gate.promise;
        if (outcome === 'throw') throw new Error('owner failed');
        if (outcome === 'blocked') {
          return {
            reason: 'external-diverged',
            status: 'blocked' as const,
          };
        }
        external = transition.value;
        return { status: 'applied' as const, value: transition };
      };

      return gate;
    },
    editor,
    external: () => external,
    replayAs(outcome: ReplayOutcome) {
      replay = async (transition) => {
        if (outcome === 'throw') throw new Error('owner failed');
        if (outcome === 'blocked') {
          return {
            reason: 'external-diverged',
            status: 'blocked' as const,
          };
        }
        external = transition.value;
        return { status: 'applied' as const, value: transition };
      };
    },
  };
};

describe('immutable history branches', () => {
  it('claims a session batch, refuses overlapping replay, and keeps edits live', async () => {
    const gate = deferred<void>();
    let external = 'comment';
    const sessionEffect = defineEffect<Transition>({
      history: {
        replay: async (_editor, transition) => {
          await gate.promise;
          external = transition.value;

          return { status: 'applied', value: transition };
        },
      },
      invert: ({ previous, value }) => ({ previous: value, value: previous }),
      key: 'history.session-queue',
    });
    const editor = createEditor({
      plugins: [
        history(),
        definePlugin('history-session-queue', {
          effectTypes: [sessionEffect],
        }),
      ],
      initialValue: [paragraph('')],
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('A', { at: { offset: 0, path: [0, 0] } });
    });
    editor.update((tx) => {
      tx.effects.emit(sessionEffect, { previous: '', value: 'comment' });
    });
    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('C', { at: { offset: 0, path: [0, 0] } });
    });

    assert.deepEqual(editor.api.history.undo(), { status: 'applied' });
    const { revision } = editor.read.history();
    const sessionUndo = editor.api.history.undo();

    assert.equal(editor.read.text.string([]), 'A');
    assert.equal(external, 'comment');
    assert.equal(editor.read.history().undos.length, 2);
    assert.equal(editor.read.history.pending(), 'undo');
    assert.equal(editor.read.history().revision, revision);
    assert.equal(Object.hasOwn(editor.read.history(), 'pending'), false);
    assert.equal(Object.hasOwn(History.toJSON(editor), 'pending'), false);
    assert.deepEqual(editor.api.history.undo(), { status: 'busy' });

    editor.update({ history: 'merge' }, (tx) => {
      tx.text.insert('X', { at: { offset: 1, path: [0, 0] } });
    });

    assert.equal(editor.read.text.string([]), 'AX');
    assert.equal(editor.read.history().undos.length, 3);

    gate.resolve();
    assert.deepEqual(await settled(sessionUndo), { status: 'applied' });
    assert.equal(external, '');
    assert.equal(editor.read.history.pending(), null);
    assert.equal(editor.read.text.string([]), 'AX');
    assert.equal(editor.read.history().undos.length, 2);
    assert.equal(editor.read.history().redos.length, 0);

    assert.deepEqual(editor.api.history.undo(), { status: 'applied' });
    assert.equal(editor.read.text.string([]), 'A');
  });

  it('moves an applied session claim between branches when no edit intervenes', async () => {
    const harness = createSessionHarness();
    const { editor } = harness;

    assert.deepEqual(await settled(editor.api.history.undo()), {
      status: 'applied',
    });
    assert.equal(harness.external(), '');
    assert.equal(editor.read.history().undos.length, 1);
    assert.equal(editor.read.history().redos.length, 1);

    assert.deepEqual(await settled(editor.api.history.redo()), {
      status: 'applied',
    });
    assert.equal(harness.external(), 'comment');
    assert.equal(editor.read.history().undos.length, 2);
    assert.equal(editor.read.history().redos.length, 0);
  });

  it('keeps a document batch above a session batch through repeated replay', async () => {
    const { editor } = createSessionHarness();

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
      });
    });
    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('N', { at: { offset: 0, path: [0, 0] } });
    });

    assert.deepEqual(editor.api.history.undo(), { status: 'applied' });
    assert.equal(editor.read.text.string([]), '');

    for (let cycle = 0; cycle < 5; cycle += 1) {
      assert.deepEqual(editor.api.history.undo(), { status: 'applied' });
      assert.equal(editor.read.text.string([]), 'A');
      assert.deepEqual(editor.api.history.redo(), { status: 'applied' });
      assert.equal(editor.read.text.string([]), '');
    }
  });

  it('keeps a blocked undo claim below an intervening edit', async () => {
    const harness = createSessionHarness();
    const { editor } = harness;
    const gate = harness.defer('blocked');
    const pending = editor.api.history.undo();

    editor.update((tx) => {
      tx.history.merge();
      tx.text.insert('X', { at: { offset: 1, path: [0, 0] } });
    });
    gate.resolve();

    assert.deepEqual(await settled(pending), {
      reason: 'external-diverged',
      status: 'blocked',
    });
    assert.equal(editor.read.history().undos.length, 3);
    assert.deepEqual(editor.api.history.undo(), { status: 'applied' });
    assert.equal(editor.read.text.string([]), 'A');
    assert.deepEqual(await settled(editor.api.history.undo()), {
      reason: 'external-diverged',
      status: 'blocked',
    });
  });

  it('inserts an applied redo claim below an intervening edit', async () => {
    const harness = createSessionHarness();
    const { editor } = harness;

    await settled(editor.api.history.undo());
    const gate = harness.defer('applied');
    const pending = editor.api.history.redo();

    editor.update((tx) => {
      tx.text.insert('X', { at: { offset: 1, path: [0, 0] } });
    });
    gate.resolve();

    assert.deepEqual(await settled(pending), { status: 'applied' });
    assert.equal(harness.external(), 'comment');
    assert.equal(editor.read.history().undos.length, 3);
    assert.equal(editor.read.history().redos.length, 0);

    assert.deepEqual(editor.api.history.undo(), { status: 'applied' });
    assert.equal(editor.read.text.string([]), 'A');
    assert.equal(harness.external(), 'comment');
    assert.deepEqual(await settled(editor.api.history.undo()), {
      status: 'applied',
    });
    assert.equal(editor.read.text.string([]), 'A');
    assert.equal(harness.external(), '');
  });

  it('drops a blocked redo claim after an intervening edit clears redo', async () => {
    const harness = createSessionHarness();
    const { editor } = harness;

    await settled(editor.api.history.undo());
    const gate = harness.defer('blocked');
    const pending = editor.api.history.redo();

    editor.update((tx) => {
      tx.text.insert('X', { at: { offset: 1, path: [0, 0] } });
    });
    gate.resolve();

    assert.deepEqual(await settled(pending), {
      reason: 'external-diverged',
      status: 'blocked',
    });
    assert.equal(editor.read.history().undos.length, 2);
    assert.equal(editor.read.history().redos.length, 0);
    assert.deepEqual(editor.api.history.undo(), { status: 'applied' });
    assert.equal(editor.read.text.string([]), 'A');
    assert.equal(harness.external(), '');
  });

  it('keeps a blocked redo claim at the redo head without an edit', async () => {
    const harness = createSessionHarness();
    const { editor } = harness;

    await settled(editor.api.history.undo());
    harness.replayAs('blocked');

    for (let attempt = 0; attempt < 2; attempt++) {
      assert.deepEqual(await settled(editor.api.history.redo()), {
        reason: 'external-diverged',
        status: 'blocked',
      });
      assert.equal(editor.read.history().undos.length, 1);
      assert.equal(editor.read.history().redos.length, 1);
    }
  });

  it('publishes selection and skipped document updates during a claim', async () => {
    const harness = createSessionHarness();
    const { editor } = harness;
    const gate = harness.defer('applied');
    const pending = editor.api.history.undo();

    editor.update((tx) => {
      tx.selection.set({ offset: 1, path: [0, 0] });
    });
    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert('R', { at: { offset: 1, path: [0, 0] } });
    });

    assert.equal(editor.read.text.string([]), 'AR');
    assert.equal(editor.read.selection()?.anchor.offset, 2);
    assert.equal(editor.read.selection()?.focus.offset, 2);

    gate.resolve();
    assert.deepEqual(await settled(pending), { status: 'applied' });
    assert.equal(editor.read.text.string([]), 'AR');
    assert.equal(editor.read.history().undos.length, 1);
    assert.equal(editor.read.history().redos.length, 1);
  });

  it('preserves remote mappings before and after a redo claim detaches', async () => {
    const harness = createSessionHarness();
    const { editor } = harness;

    await settled(editor.api.history.undo());
    const gate = harness.defer('applied');
    const pending = editor.api.history.redo();

    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert('R', { at: { offset: 1, path: [0, 0] } });
    });
    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('X', { at: { offset: 2, path: [0, 0] } });
    });
    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert('Q', { at: { offset: 3, path: [0, 0] } });
    });

    gate.resolve();
    assert.deepEqual(await settled(pending), { status: 'applied' });
    assert.equal(editor.read.text.string([]), 'ARXQ');

    assert.deepEqual(editor.api.history.undo(), { status: 'applied' });
    assert.equal(editor.read.text.string([]), 'ARQ');
    assert.equal(harness.external(), 'comment');
    assert.deepEqual(await settled(editor.api.history.undo()), {
      status: 'applied',
    });
    assert.equal(editor.read.text.string([]), 'ARQ');
    assert.equal(harness.external(), '');
  });

  it('keeps pending replay state isolated between editors sharing a descriptor', async () => {
    const gate = deferred<void>();
    const shared = history();
    const sessionEffect = defineEffect<Transition>({
      history: {
        replay: async (_editor, transition) => {
          await gate.promise;
          return { status: 'applied', value: transition };
        },
      },
      invert: ({ previous, value }) => ({ previous: value, value: previous }),
      key: 'history.shared-session',
    });
    const sessionPlugin = definePlugin('history-shared-session', {
      effectTypes: [sessionEffect],
    });
    const first = createEditor({
      plugins: [shared, sessionPlugin],
      initialValue: [paragraph('')],
    });
    const second = createEditor({
      plugins: [shared, sessionPlugin],
      initialValue: [paragraph('')],
    });

    first.update((tx) =>
      tx.effects.emit(sessionEffect, { previous: '', value: 'comment' })
    );
    const pending = first.api.history.undo();
    second.update((tx) => {
      tx.text.insert('B', { at: { offset: 0, path: [0, 0] } });
    });

    assert.equal(first.read.history.pending(), 'undo');
    assert.equal(second.read.history.pending(), null);
    assert.equal(second.read.text.string([]), 'B');

    gate.resolve();
    assert.deepEqual(await settled(pending), { status: 'applied' });
  });

  it('clears a claim without moving it after replacement or depth clipping', async () => {
    const replacement = createSessionHarness();
    const replacementGate = replacement.defer('applied');
    const replacementUndo = replacement.editor.api.history.undo();

    replacement.editor.update.value.replace({
      children: [paragraph('replacement')],
    });
    replacementGate.resolve();

    assert.deepEqual(await settled(replacementUndo), { status: 'applied' });
    assert.equal(replacement.editor.read.history.pending(), null);
    assert.equal(replacement.editor.read.history().undos.length, 0);
    assert.equal(replacement.editor.read.history().redos.length, 0);

    const restored = createSessionHarness();
    const restoredGate = restored.defer('applied');
    const restoredUndo = restored.editor.api.history.undo();
    const empty = History.fromJSON(restored.editor, {
      redos: [],
      schema: restored.editor.read.history().schema,
      undos: [],
      version: 4,
    });

    restored.editor.update((tx) => tx.history.restore(empty));
    restoredGate.resolve();

    assert.deepEqual(await settled(restoredUndo), { status: 'applied' });
    assert.equal(restored.editor.read.history.pending(), null);
    assert.equal(restored.editor.read.history().undos.length, 0);
    assert.equal(restored.editor.read.history().redos.length, 0);

    const clipped = createSessionHarness({ maxDepth: 2 });
    const clippedGate = clipped.defer('applied');
    const clippedUndo = clipped.editor.api.history.undo();

    for (const text of ['X', 'Y']) {
      clipped.editor.update({ history: 'new-batch' }, (tx) => {
        tx.text.insert(text, {
          at: {
            offset: clipped.editor.read.text.string([]).length,
            path: [0, 0],
          },
        });
      });
    }
    clippedGate.resolve();

    assert.deepEqual(await settled(clippedUndo), { status: 'applied' });
    assert.equal(clipped.editor.read.history.pending(), null);
    assert.equal(clipped.editor.read.history().undos.length, 2);
    assert.equal(clipped.editor.read.history().redos.length, 0);
  });

  it('reports a throwing owner once, clears its claim and preserves its head', async () => {
    const errors: EditorLifecycleError[] = [];
    const rejections: unknown[] = [];
    const onRejection = (reason: unknown) => rejections.push(reason);
    const harness = createSessionHarness({
      lifecycleErrorSink: (error) => errors.push(error),
    });
    const gate = harness.defer('throw');

    process.on('unhandledRejection', onRejection);
    try {
      harness.editor.api.history.undo();
      gate.resolve();
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
    } finally {
      process.off('unhandledRejection', onRejection);
    }

    assert.deepEqual(rejections, []);
    assert.deepEqual(
      errors.map((error) => ('source' in error ? error.source : undefined)),
      ['history']
    );
    assert.equal(harness.editor.read.history.pending(), null);
    assert.equal(harness.editor.read.history().undos.length, 2);
    assert.equal(harness.editor.read.history().redos.length, 0);
  });

  it('clears its claim and keeps undo usable when settlement throws', async () => {
    const errors: EditorLifecycleError[] = [];
    const uncloneable = (() => '') as unknown as string;
    const sessionEffect = defineEffect<Transition>({
      history: {
        replay: async (_editor, transition) => ({
          status: 'applied' as const,
          value: { ...transition, previous: uncloneable },
        }),
      },
      invert: ({ previous, value }) => ({ previous: value, value: previous }),
      key: 'history.session-settle-throw',
    });
    const editor = createEditor({
      lifecycleErrorSink: (error) => errors.push(error),
      plugins: [
        history(),
        definePlugin('history-session-settle-throw', {
          effectTypes: [sessionEffect],
        }),
      ],
      initialValue: [paragraph('')],
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('A', { at: { offset: 0, path: [0, 0] } });
    });
    editor.update((tx) => {
      tx.effects.emit(sessionEffect, { previous: '', value: 'comment' });
    });
    editor.api.history.undo();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    assert.equal(editor.read.history.pending(), null);
    assert.equal(errors.length, 1);
    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('B', { at: { offset: 0, path: [0, 0] } });
    });
    assert.deepEqual(editor.api.history.undo(), { status: 'applied' });
    assert.equal(editor.read.text.string([]), 'A');
  });

  it('waits on an owner promise from another realm', async () => {
    const sessionEffect = defineEffect<Transition>({
      history: {
        replay: () =>
          runInNewContext(
            'Promise.resolve({ reason: "external-diverged", status: "blocked" })'
          ),
      },
      invert: ({ previous, value }) => ({ previous: value, value: previous }),
      key: 'history.session-foreign-promise',
    });
    const editor = createEditor({
      plugins: [
        history(),
        definePlugin('history-session-foreign-promise', {
          effectTypes: [sessionEffect],
        }),
      ],
      initialValue: [paragraph('')],
    });

    editor.update((tx) => {
      tx.effects.emit(sessionEffect, { previous: '', value: 'comment' });
    });

    assert.deepEqual(await settled(editor.api.history.undo()), {
      reason: 'external-diverged',
      status: 'blocked',
    });
    assert.equal(editor.read.history().undos.length, 1);
    assert.equal(editor.read.history().redos.length, 0);
  });

  it('settles a synchronous owner throw in the call', () => {
    const errors: EditorLifecycleError[] = [];
    const sessionEffect = defineEffect<Transition>({
      history: {
        replay: () => {
          throw new Error('owner failed');
        },
      },
      invert: ({ previous, value }) => ({ previous: value, value: previous }),
      key: 'history.session-sync-throw',
    });
    const editor = createEditor({
      lifecycleErrorSink: (error) => errors.push(error),
      plugins: [
        history(),
        definePlugin('history-session-sync-throw', {
          effectTypes: [sessionEffect],
        }),
      ],
      initialValue: [paragraph('')],
    });

    editor.update((tx) => {
      tx.effects.emit(sessionEffect, { previous: '', value: 'comment' });
    });

    assert.deepEqual(editor.api.history.undo(), { status: 'failed' });
    assert.equal(editor.read.history.pending(), null);
    assert.equal(errors.length, 1);
    assert.equal(editor.read.history().undos.length, 1);
  });

  it('returns the session owner outcome after history retires', async () => {
    for (const outcome of ['applied', 'blocked', 'throw'] as const) {
      const errors: EditorLifecycleError[] = [];
      const gate = deferred<void>();
      const slot = definePluginSlot(`history-retirement-${outcome}`);
      const sessionEffect = defineEffect<Transition>({
        history: {
          replay: async (_editor, transition) => {
            await gate.promise;
            if (outcome === 'throw') throw new Error('owner failed');
            if (outcome === 'blocked') {
              return {
                reason: 'external-diverged',
                status: 'blocked' as const,
              };
            }
            return { status: 'applied' as const, value: transition };
          },
        },
        invert: ({ previous, value }) => ({ previous: value, value: previous }),
        key: `history.retirement.${outcome}`,
      });
      const editor = createEditor({
        lifecycleErrorSink: (error) => errors.push(error),
        plugins: [
          slot.of(history()),
          definePlugin(`history-retirement-effect-${outcome}`, {
            effectTypes: [sessionEffect],
          }),
        ],
        initialValue: [paragraph('')],
      });

      editor.update((tx) =>
        tx.effects.emit(sessionEffect, { previous: '', value: 'comment' })
      );
      const pending = editor.api.history.undo();
      editor.update.plugins.reconfigure(slot, []);
      gate.resolve();

      if (outcome === 'throw') {
        assert.deepEqual(await settled(pending), { status: 'failed' });
        assert.equal(errors.length, 1);
      } else if (outcome === 'blocked') {
        assert.deepEqual(await settled(pending), {
          reason: 'external-diverged',
          status: 'blocked',
        });
      } else {
        assert.deepEqual(await settled(pending), { status: 'applied' });
      }
    }
  });

  it('keeps a blocked session batch at the branch head', async () => {
    let attempts = 0;
    const sessionEffect = defineEffect<string>({
      history: {
        replay: () => {
          attempts += 1;

          return { reason: 'external-diverged', status: 'blocked' };
        },
      },
      key: 'history.session-blocked',
    });
    const editor = createEditor({
      plugins: [
        history(),
        definePlugin('history-session-blocked', {
          effectTypes: [sessionEffect],
        }),
      ],
      initialValue: [paragraph('')],
    });

    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('A', { at: { offset: 0, path: [0, 0] } });
    });
    editor.update((tx) => tx.effects.emit(sessionEffect, 'comment'));

    for (let attempt = 1; attempt <= 2; attempt++) {
      assert.deepEqual(editor.api.history.undo(), {
        reason: 'external-diverged',
        status: 'blocked',
      });
      assert.equal(attempts, attempt);
      assert.equal(editor.read.text.string([]), 'A');
      assert.equal(editor.read.history().undos.length, 2);
      assert.equal(editor.read.history().redos.length, 0);
    }
  });

  it('publishes frozen revisioned snapshots and clips configurable depth', () => {
    const editor = createEditor({
      plugins: [history({ maxDepth: 2 })],
      initialValue: [paragraph('')],
    });

    for (const text of ['a', 'b', 'c']) {
      editor.update((tx) => {
        tx.history.newBatch();
        tx.text.insert(text, { at: { offset: 0, path: [0, 0] } });
      });
    }

    const value = editor.read.history();

    assert.equal(value.undos.length, 2);
    assert.ok(value.revision > 0);
    assert.equal(Object.isFrozen(value), true);
    assert.equal(Object.isFrozen(value.undos), true);
    assert.equal(Object.isFrozen(value.undos[0]), true);
    assert.throws(() => {
      (value.undos as unknown[]).push({});
    }, TypeError);
  });

  it('matches eagerly resolved history after composed structural mappings', () => {
    const create = () =>
      createEditor({
        plugins: [history()],
        initialValue: [paragraph('ab'), paragraph('cd')],
      });
    const eager = create();
    const lazy = create();

    for (const editor of [eager, lazy]) {
      editor.update((tx) => tx.nodes.set({ role: 'local' }, { at: [1] }));
    }

    const applyRemoteChanges = (editor: typeof eager, resolve: boolean) => {
      editor.update({ history: 'skip' }, (tx) => {
        tx.nodes.insert(paragraph('remote'), { at: [0] });
      });
      if (resolve) editor.read.history();

      editor.update({ history: 'skip' }, (tx) => {
        tx.nodes.move({ at: [2], to: [1] });
      });
      if (resolve) editor.read.history();

      editor.update({ history: 'skip' }, (tx) => {
        tx.text.insert('!', { at: { offset: 3, path: [0, 0] } });
      });
      if (resolve) editor.read.history();
    };

    applyRemoteChanges(eager, true);
    applyRemoteChanges(lazy, false);
    eager.api.history.undo();
    lazy.api.history.undo();

    assert.deepEqual(lazy.read.value(), eager.read.value());
    assert.deepEqual(lazy.read.selection(), eager.read.selection());
    assert.deepEqual(History.toJSON(lazy), History.toJSON(eager));
  });

  it('keeps a skipped merge-boundary insert on the surviving left block', () => {
    const editor = createEditor({
      plugins: [history()],
      initialValue: [paragraph('alpha'), paragraph('beta')],
    });

    editor.update((tx) => tx.nodes.merge({ at: [1] }));
    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert('?', { at: { offset: 'alpha'.length, path: [0, 0] } });
    });
    editor.api.history.undo();

    assert.deepEqual(editor.read.children(), [
      paragraph('alpha?'),
      paragraph('beta'),
    ]);

    editor.api.history.redo();

    assert.deepEqual(editor.read.children(), [paragraph('alpha?beta')]);
  });

  it('keeps a skipped boundary insert through a broad text replacement', () => {
    const editor = createEditor({
      plugins: [history()],
      initialValue: [paragraph('alpha')],
    });

    editor.update.nodes.replaceChildren([{ text: 'alphaLin fragment' }], {
      at: [0],
    });
    editor.update({ history: 'skip' }, (tx) => {
      tx.text.insert(' Ada', { at: { offset: 5, path: [0, 0] } });
    });
    editor.api.history.undo();

    assert.deepEqual(editor.read.children(), [paragraph('alpha Ada')]);

    editor.api.history.redo();

    assert.deepEqual(editor.read.children(), [
      paragraph('alpha AdaLin fragment'),
    ]);
  });

  it('keeps a skipped sibling insert after undo restores and crosses it', () => {
    const editor = createEditor({
      plugins: [history()],
      initialValue: [paragraph('alpha')],
    });

    editor.update((tx) => {
      tx.history.newBatch();
      tx.nodes.insert(paragraph('local'), { at: [1] });
    });
    editor.update({ history: 'skip' }, (tx) => {
      tx.nodes.insert(paragraph('remote'), { at: [1] });
    });
    editor.update((tx) => {
      tx.history.newBatch();
      tx.nodes.remove({ at: [1] });
    });

    editor.api.history.undo();
    assert.deepEqual(editor.read.children(), [
      paragraph('alpha'),
      paragraph('remote'),
      paragraph('local'),
    ]);

    editor.api.history.undo();
    assert.deepEqual(editor.read.children(), [
      paragraph('alpha'),
      paragraph('remote'),
    ]);
  });

  it('does not apply one skipped change twice across consecutive undos', () => {
    const editor = createEditor({
      plugins: [history()],
      initialValue: [paragraph('alpha')],
    });

    editor.update((tx) => {
      tx.history.newBatch();
      tx.nodes.insert(paragraph('first'), { at: [1] });
    });
    editor.update((tx) => {
      tx.history.newBatch();
      tx.nodes.insert(paragraph('second'), { at: [2] });
    });
    editor.update({ history: 'skip' }, (tx) => {
      tx.nodes.insert(paragraph('remote'), { at: [1] });
    });

    editor.api.history.undo();
    assert.deepEqual(editor.read.children(), [
      paragraph('alpha'),
      paragraph('remote'),
      paragraph('first'),
    ]);

    editor.api.history.undo();
    assert.deepEqual(editor.read.children(), [
      paragraph('alpha'),
      paragraph('remote'),
    ]);
  });

  it('throws an unresolvable mapping instead of silently deleting history', () => {
    const editor = createEditor({
      plugins: [history()],
      initialValue: {
        children: [paragraph('body')],
        roots: { header: [paragraph('old')] },
      },
    });

    editor.update((tx) => tx.roots.delete('header'));
    editor.update({ history: 'skip' }, (tx) => {
      tx.roots.create('header', [paragraph('remote')]);
    });

    assert.throws(
      () => editor.api.history.undo(),
      /Cannot transform concurrent root lifecycle changes/
    );
    assert.throws(
      () => editor.api.history.undo(),
      /Cannot transform concurrent root lifecycle changes/
    );
  });

  it('decodes without mutation and restores in one observable commit', () => {
    const source = createEditor({
      plugins: [history()],
      initialValue: [paragraph('body')],
    });

    source.update((tx) => tx.text.insert('local'));
    const editor = createEditor({
      plugins: [history()],
      initialValue: source.read.value(),
    });
    const before = editor.read.history();
    const decoded = History.fromJSON(editor, History.toJSON(source));
    let commits = 0;
    let observedRevision = -1;

    editor.subscribe((_snapshot, commit) => {
      if (!commit) return;

      commits += 1;
      observedRevision = editor.read.history().revision;
      assert.ok(commit.tags.includes('history-restore'));
    });

    assert.equal(editor.read.history(), before);
    assert.equal(Object.isFrozen(decoded), true);
    assert.equal(decoded.undos.length, 1);

    assert.throws(() => {
      editor.update((tx) => {
        tx.history.restore(decoded);
        throw new Error('rollback restore');
      });
    }, /rollback restore/);
    assert.equal(editor.read.history(), before);
    assert.equal(commits, 0);

    editor.update((tx) => tx.history.restore(decoded));

    assert.equal(commits, 1);
    assert.equal(editor.read.history().undos.length, 1);
    assert.equal(observedRevision, editor.read.history().revision);
    assert.ok(observedRevision > before.revision);

    const restored = editor.read.history();
    const invalid = structuredClone(History.toJSON(source));

    (invalid.undos as unknown[]).push({});

    assert.throws(() => History.fromJSON(editor, invalid));
    assert.equal(editor.read.history(), restored);
  });
});
