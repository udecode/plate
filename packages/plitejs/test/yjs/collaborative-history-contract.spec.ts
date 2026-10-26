import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { history } from '../../src/history';
import {
  createEditor,
  defineEditorSchema,
  definePlugin,
  defineEffect,
  defineStateField,
  type Descendant,
  NodeApi,
  type Path,
  property,
  schema,
  valueCodecs,
} from '../../src/index';
import {
  createSeededYjsHistoryPeers,
  createYjsPeerWithEditor,
  getPeerTopLevelTexts,
  paragraph,
  readPeerChildren,
  syncConnectedPeers,
} from './support/collaboration';
import {
  type CanonicalTestOperation,
  type CollaborativeHistoryRun,
  type CollaborativeHistoryRunOptions,
  type CollaborativeHistoryTrace,
  type CollaborativeYjsIdentityNode,
  runCollaborativeHistoryTrace,
} from './support/collaborative-history';

const clientIds = ['a', 'b', 'c'] as const;
const numericClientIds = { a: 101, b: 202, c: 303 } as const;

const initialValue = (): Descendant[] => [
  paragraph('alpha'),
  paragraph('beta'),
  paragraph('gamma'),
];

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
};

const offlineTrace = (
  seed: number,
  local: CanonicalTestOperation,
  remote: CanonicalTestOperation
): CollaborativeHistoryTrace => ({
  seed,
  steps: [
    { kind: 'disconnect', peer: 'b' },
    { kind: 'edit', operation: local, peer: 'b' },
    { kind: 'edit', operation: remote, peer: 'a' },
    { kind: 'sync', peer: 'a' },
    { kind: 'reconnect', peer: 'b' },
    { kind: 'undo', peer: 'b' },
    { kind: 'sync', peer: 'b' },
    { kind: 'redo', peer: 'b' },
    { kind: 'sync', peer: 'b' },
  ],
});

const readChildren = (value: unknown): unknown => {
  assert.ok(value && typeof value === 'object' && 'children' in value);

  return value.children;
};

const assertRunProjectionExact = (run: CollaborativeHistoryRun): void => {
  for (const observation of run.observations) {
    for (const clientId of clientIds) {
      const peer = observation.peers[clientId];

      assert.ok(peer);
      assert.deepEqual(
        readChildren(peer.yjsProjection),
        readChildren(peer.document),
        `peer ${clientId} projection mismatch at step ${observation.stepIndex}`
      );
    }
  }
};

type ReplayDocuments = Readonly<{ redo?: unknown; undo: unknown }>;

const assertReplayDocuments = (
  run: CollaborativeHistoryRun,
  expected: ReplayDocuments
): void => {
  let replay: 'redo' | 'undo' | undefined;

  for (const observation of run.observations) {
    const { kind } = observation.step;

    if (kind === 'undo' || kind === 'redo') replay = kind;
    else if (kind !== 'sync') replay = undefined;
    if (!replay) continue;

    assert.deepEqual(
      observation.peers.b?.document,
      expected[replay],
      `peer b ${replay} document mismatch at step ${observation.stepIndex}`
    );
  }
};

const readIdentityAt = (
  nodes: readonly CollaborativeYjsIdentityNode[],
  path: Path
): number => {
  let current = nodes;
  let node: CollaborativeYjsIdentityNode | undefined;

  for (const index of path) {
    node = current[index];
    assert.ok(node, `Missing Yjs identity at ${path.join('.')}.`);
    current = node.children ?? [];
  }

  assert.ok(node, 'A Yjs identity path must not be empty.');

  return node.id;
};

const assertMinimizedIdentityStable = (
  run: CollaborativeHistoryRun,
  paths: readonly Path[]
): void => {
  const identities = paths.map((path, stepIndex) => {
    const observation = run.observations[stepIndex];

    assert.ok(observation);
    const peer = observation.peers.b;

    assert.ok(peer);

    return readIdentityAt(peer.yjsIdentities, path);
  });

  assert.equal(
    new Set(identities).size,
    1,
    'history changed the structurally replayed Yjs node identity'
  );
};

describe('plitejs/yjs collaborative history contract', () => {
  it('publishes a remote update while a session replay is pending', async () => {
    type Transition = Readonly<{ previous: string; value: string }>;
    const gate = deferred<void>();
    const sessionEffect = defineEffect<Transition>({
      history: {
        replay: async (_editor, transition) => {
          await gate.promise;
          return { status: 'applied', value: transition };
        },
      },
      invert: ({ previous, value }) => ({ previous: value, value: previous }),
      key: 'c14.pending-session',
    });
    const effects = definePlugin('c14-pending-session-effects', {
      effectTypes: [sessionEffect],
    });
    const peers = createSeededYjsHistoryPeers({
      children: [paragraph('alpha')],
      clientIds: ['a', 'b'],
      createEditor: () =>
        createEditor({ plugins: [effects, history()] as const }),
      numericClientIds,
    });
    const [source, target] = peers;

    assert.ok(source && target);
    try {
      target.editor.update((tx) => {
        tx.effects.emit(sessionEffect, { previous: '', value: 'comment' });
      });
      const pending = target.editor.api.history.undo();

      assert.ok(pending.status === 'pending');

      source.editor.update((tx) => {
        tx.text.insert('!', { at: { offset: 5, path: [0, 0] } });
      });
      syncConnectedPeers(peers);

      assert.deepEqual(getPeerTopLevelTexts(target), ['alpha!']);
      assert.equal(target.editor.read.history.pending(), 'undo');

      gate.resolve();
      assert.deepEqual(await pending.settled, { status: 'applied' });
      assert.deepEqual(getPeerTopLevelTexts(target), ['alpha!']);
      assert.equal(target.editor.read.history.pending(), null);
    } finally {
      for (const peer of peers) peer.cleanup();
    }
  });

  it('replays offline text undo and redo through Plite history', () => {
    const trace: CollaborativeHistoryTrace = {
      seed: 14_001,
      steps: [
        { kind: 'disconnect', peer: 'b' },
        {
          kind: 'edit',
          operation: {
            at: { path: [1, 0], offset: 'beta'.length },
            kind: 'insert-text',
            text: '!',
          },
          peer: 'b',
        },
        {
          kind: 'edit',
          operation: {
            at: { path: [0, 0], offset: 'alpha'.length },
            kind: 'insert-text',
            text: '?',
          },
          peer: 'a',
        },
        { kind: 'sync', peer: 'a' },
        { kind: 'reconnect', peer: 'b' },
        { kind: 'undo', peer: 'b' },
        { kind: 'sync', peer: 'b' },
        { kind: 'redo', peer: 'b' },
        { kind: 'sync', peer: 'b' },
      ],
    };
    const run = runCollaborativeHistoryTrace({
      children: initialValue(),
      clientIds,
      numericClientIds,
      trace,
    });
    const final = run.observations.at(-1);

    if (!final) throw new Error('Missing final collaborative observation.');
    assert.deepEqual(final.peers.b?.history, { redos: 0, undos: 1 });
    assert.deepEqual(final.peers.b?.document, {
      children: [paragraph('alpha?'), paragraph('beta!'), paragraph('gamma')],
    });
  });

  const exactScenarios: ReadonlyArray<{
    readonly allowedFallbacks?: readonly ['remote-event-projected-content'];
    readonly children: readonly Descendant[];
    readonly name: string;
    readonly redo: Readonly<{ children: readonly Descendant[] }>;
    readonly trace: CollaborativeHistoryTrace;
    readonly undo: Readonly<{ children: readonly Descendant[] }>;
  }> = [
    {
      children: initialValue(),
      name: 'node properties',
      redo: {
        children: [
          paragraph('alpha?'),
          paragraph('beta', { role: 'title' }),
          paragraph('gamma'),
        ],
      },
      undo: {
        children: [paragraph('alpha?'), paragraph('beta'), paragraph('gamma')],
      },
      trace: offlineTrace(
        14_002,
        {
          at: [1],
          kind: 'set-node',
          properties: { role: 'title' },
        },
        {
          at: { path: [0, 0], offset: 'alpha'.length },
          kind: 'insert-text',
          text: '?',
        }
      ),
    },
    {
      children: initialValue(),
      name: 'text deletion',
      redo: {
        children: [paragraph('alpha?'), paragraph('ba'), paragraph('gamma')],
      },
      undo: {
        children: [paragraph('alpha?'), paragraph('beta'), paragraph('gamma')],
      },
      trace: offlineTrace(
        14_003,
        {
          at: { path: [1, 0], offset: 1 },
          distance: 2,
          kind: 'delete-text',
        },
        {
          at: { path: [0, 0], offset: 'alpha'.length },
          kind: 'insert-text',
          text: '?',
        }
      ),
    },
    {
      allowedFallbacks: ['remote-event-projected-content'],
      children: initialValue(),
      name: 'move',
      redo: {
        children: [paragraph('gamma'), paragraph('alpha'), paragraph('beta?')],
      },
      undo: {
        children: [paragraph('alpha'), paragraph('beta?'), paragraph('gamma')],
      },
      trace: offlineTrace(
        14_006,
        { at: [2], kind: 'move-node', to: [0] },
        {
          at: { path: [1, 0], offset: 'beta'.length },
          kind: 'insert-text',
          text: '?',
        }
      ),
    },
  ];

  for (const scenario of exactScenarios) {
    it(`replays offline ${scenario.name}`, () => {
      const run = runCollaborativeHistoryTrace({
        allowedFallbacks: scenario.allowedFallbacks,
        children: scenario.children,
        clientIds,
        numericClientIds,
        trace: scenario.trace,
      });

      assertRunProjectionExact(run);
      assertReplayDocuments(run, scenario);
    });
  }

  const structuralBlockers: ReadonlyArray<{
    readonly allowedFallbacks?: readonly [
      'remote-event-projected-content',
      'remote-event-invalid-delta',
    ];
    readonly children: readonly Descendant[];
    readonly identityPaths: readonly Path[];
    readonly minimized: CollaborativeHistoryTrace;
    readonly minimizedReplay: ReplayDocuments;
    readonly name: string;
    readonly offline: CollaborativeHistoryTrace;
    readonly offlineReplay: ReplayDocuments;
  }> = [
    {
      children: [paragraph('alphabeta'), paragraph('gamma')],
      identityPaths: [[0], [0], [0]],
      minimizedReplay: {
        redo: {
          children: [paragraph('alph'), paragraph('abeta'), paragraph('gamma')],
        },
        undo: { children: [paragraph('alphabeta'), paragraph('gamma')] },
      },
      offlineReplay: {
        redo: {
          children: [
            paragraph('alph'),
            paragraph('abeta'),
            paragraph('gamma?'),
          ],
        },
        undo: { children: [paragraph('alphabeta'), paragraph('gamma?')] },
      },
      minimized: {
        seed: 14_004,
        steps: [
          {
            kind: 'edit',
            operation: {
              at: { path: [0, 0], offset: 'alph'.length },
              kind: 'split-node',
            },
            peer: 'b',
          },
          { kind: 'undo', peer: 'b' },
          { kind: 'redo', peer: 'b' },
          { kind: 'sync', peer: 'b' },
        ],
      },
      name: 'split redo',
      offline: offlineTrace(
        14_104,
        {
          at: { path: [0, 0], offset: 'alph'.length },
          kind: 'split-node',
        },
        {
          at: { path: [1, 0], offset: 'gamma'.length },
          kind: 'insert-text',
          text: '?',
        }
      ),
    },
    {
      allowedFallbacks: [
        'remote-event-projected-content',
        'remote-event-invalid-delta',
      ],
      children: [paragraph('alpha'), paragraph('beta')],
      identityPaths: [[0], [0]],
      minimizedReplay: {
        undo: { children: [paragraph('alpha'), paragraph('beta')] },
      },
      offlineReplay: {
        redo: { children: [paragraph('alpha?beta')] },
        undo: { children: [paragraph('alpha?'), paragraph('beta')] },
      },
      minimized: {
        seed: 14_005,
        steps: [
          {
            kind: 'edit',
            operation: { at: [1], kind: 'merge-node' },
            peer: 'b',
          },
          { kind: 'undo', peer: 'b' },
          { kind: 'sync', peer: 'b' },
        ],
      },
      name: 'merge undo',
      offline: offlineTrace(
        14_105,
        { at: [1], kind: 'merge-node' },
        {
          at: { path: [0, 0], offset: 'alpha'.length },
          kind: 'insert-text',
          text: '?',
        }
      ),
    },
    {
      children: [paragraph('alpha'), paragraph('beta')],
      identityPaths: [[0, 0], [0], [0, 0]],
      minimizedReplay: {
        redo: {
          children: [
            { children: [paragraph('alpha')], type: 'quote' },
            paragraph('beta'),
          ],
        },
        undo: { children: [paragraph('alpha'), paragraph('beta')] },
      },
      offlineReplay: {
        redo: {
          children: [
            { children: [paragraph('alpha')], type: 'quote' },
            paragraph('beta?'),
          ],
        },
        undo: { children: [paragraph('alpha'), paragraph('beta?')] },
      },
      minimized: {
        seed: 14_007,
        steps: [
          {
            kind: 'edit',
            operation: {
              at: [0],
              element: { children: [], type: 'quote' },
              kind: 'wrap-node',
            },
            peer: 'b',
          },
          { kind: 'undo', peer: 'b' },
          { kind: 'redo', peer: 'b' },
          { kind: 'sync', peer: 'b' },
        ],
      },
      name: 'wrap redo',
      offline: offlineTrace(
        14_107,
        {
          at: [0],
          element: { children: [], type: 'quote' },
          kind: 'wrap-node',
        },
        {
          at: { path: [1, 0], offset: 'beta'.length },
          kind: 'insert-text',
          text: '?',
        }
      ),
    },
    {
      children: [
        {
          children: [paragraph('alpha')],
          type: 'quote',
        },
        paragraph('beta'),
      ],
      identityPaths: [[0], [0, 0]],
      minimizedReplay: {
        undo: {
          children: [
            { children: [paragraph('alpha')], type: 'quote' },
            paragraph('beta'),
          ],
        },
      },
      offlineReplay: {
        redo: { children: [paragraph('alpha'), paragraph('beta?')] },
        undo: {
          children: [
            { children: [paragraph('alpha')], type: 'quote' },
            paragraph('beta?'),
          ],
        },
      },
      minimized: {
        seed: 14_008,
        steps: [
          {
            kind: 'edit',
            operation: { at: [0], kind: 'unwrap-node' },
            peer: 'b',
          },
          { kind: 'undo', peer: 'b' },
          { kind: 'sync', peer: 'b' },
        ],
      },
      name: 'unwrap undo',
      offline: offlineTrace(
        14_108,
        { at: [0], kind: 'unwrap-node' },
        {
          at: { path: [1, 0], offset: 'beta'.length },
          kind: 'insert-text',
          text: '?',
        }
      ),
    },
    {
      children: [
        {
          children: [paragraph('alpha'), paragraph('beta')],
          type: 'quote',
        },
        paragraph('gamma'),
      ],
      identityPaths: [[1], [0, 1]],
      minimizedReplay: {
        undo: {
          children: [
            {
              children: [paragraph('alpha'), paragraph('beta')],
              type: 'quote',
            },
            paragraph('gamma'),
          ],
        },
      },
      offlineReplay: {
        redo: {
          children: [
            { children: [paragraph('alpha')], type: 'quote' },
            paragraph('beta'),
            paragraph('gamma?'),
          ],
        },
        undo: {
          children: [
            {
              children: [paragraph('alpha'), paragraph('beta')],
              type: 'quote',
            },
            paragraph('gamma?'),
          ],
        },
      },
      minimized: {
        seed: 14_009,
        steps: [
          {
            kind: 'edit',
            operation: { at: [0, 1], kind: 'lift-node' },
            peer: 'b',
          },
          { kind: 'undo', peer: 'b' },
          { kind: 'sync', peer: 'b' },
        ],
      },
      name: 'lift undo',
      offline: offlineTrace(
        14_109,
        { at: [0, 1], kind: 'lift-node' },
        {
          at: { path: [1, 0], offset: 'gamma'.length },
          kind: 'insert-text',
          text: '?',
        }
      ),
    },
  ];

  for (const blocker of structuralBlockers) {
    it(`replays offline and minimized ${blocker.name}`, () => {
      const offline = runCollaborativeHistoryTrace({
        allowedFallbacks: blocker.allowedFallbacks ?? [
          'remote-event-projected-content',
        ],
        children: blocker.children,
        clientIds,
        numericClientIds,
        trace: blocker.offline,
      });
      const minimized = runCollaborativeHistoryTrace({
        allowedFallbacks: blocker.allowedFallbacks ?? [
          'remote-event-projected-content',
        ],
        children: blocker.children,
        clientIds,
        numericClientIds,
        trace: blocker.minimized,
      });

      assertRunProjectionExact(offline);
      assertRunProjectionExact(minimized);
      assertReplayDocuments(offline, blocker.offlineReplay);
      assertReplayDocuments(minimized, blocker.minimizedReplay);
      assertMinimizedIdentityStable(minimized, blocker.identityPaths);
    });
  }

  it('replays a named root while the primary root changes remotely', () => {
    const trace: CollaborativeHistoryTrace = {
      seed: 14_010,
      steps: [
        { kind: 'disconnect', peer: 'b' },
        {
          kind: 'edit',
          operation: {
            at: { path: [0, 0], offset: 'header'.length, root: 'header' },
            kind: 'insert-text',
            text: '!',
          },
          peer: 'b',
        },
        {
          kind: 'edit',
          operation: {
            at: { path: [0, 0], offset: 'alpha'.length },
            kind: 'insert-text',
            text: '?',
          },
          peer: 'a',
        },
        { kind: 'sync', peer: 'a' },
        { kind: 'reconnect', peer: 'b' },
        { kind: 'undo', peer: 'b' },
        { kind: 'sync', peer: 'b' },
        { kind: 'redo', peer: 'b' },
        { kind: 'sync', peer: 'b' },
      ],
    };

    const run = runCollaborativeHistoryTrace({
      allowedFallbacks: ['remote-event-projected-content'],
      children: initialValue(),
      clientIds,
      numericClientIds,
      roots: { header: [paragraph('header')] },
      trace,
    });

    assertRunProjectionExact(run);
    assertReplayDocuments(run, {
      redo: {
        children: [paragraph('alpha?'), paragraph('beta'), paragraph('gamma')],
        roots: { header: [paragraph('header!')] },
      },
      undo: {
        children: [paragraph('alpha?'), paragraph('beta'), paragraph('gamma')],
        roots: { header: [paragraph('header')] },
      },
    });
  });

  it('invalidates redo after a new local edit', () => {
    const trace: CollaborativeHistoryTrace = {
      seed: 14_011,
      steps: [
        {
          kind: 'edit',
          operation: {
            at: { path: [1, 0], offset: 'beta'.length },
            kind: 'insert-text',
            text: '!',
          },
          peer: 'b',
        },
        { kind: 'sync', peer: 'b' },
        { kind: 'undo', peer: 'b' },
        { kind: 'sync', peer: 'b' },
        {
          kind: 'edit',
          operation: {
            at: { path: [1, 0], offset: 'beta'.length },
            kind: 'insert-text',
            text: '?',
          },
          peer: 'b',
        },
        { kind: 'sync', peer: 'b' },
        { kind: 'redo', peer: 'b' },
        { kind: 'sync', peer: 'b' },
      ],
    };
    const run = runCollaborativeHistoryTrace({
      children: initialValue(),
      clientIds,
      numericClientIds,
      trace,
    });
    const final = run.observations.at(-1);

    if (!final) throw new Error('Missing redo-invalidation observation.');
    assert.deepEqual(final.peers.b?.history, { redos: 0, undos: 1 });
    assert.deepEqual(final.peers.b?.document, {
      children: [paragraph('alpha'), paragraph('beta?'), paragraph('gamma')],
    });
  });

  const deletedMergeTraces: ReadonlyArray<{
    readonly children: readonly Descendant[];
    readonly deleted: number;
    readonly name: string;
    readonly offline: CollaborativeHistoryTrace['steps'];
  }> = [
    {
      children: [paragraph('alpha'), paragraph('beta'), paragraph('tail')],
      deleted: 'alpha'.length + 2,
      name: 'one edit',
      offline: [
        {
          kind: 'edit',
          operation: {
            at: { path: [1, 0], offset: 0 },
            kind: 'insert-text',
            text: '!',
          },
          peer: 'b',
        },
      ],
    },
    {
      children: [paragraph('ab'), paragraph('c'), paragraph('tail')],
      deleted: 'a'.length + 2,
      name: 'two edits',
      offline: [
        {
          kind: 'edit',
          operation: {
            at: { path: [0, 0], offset: 1 },
            distance: 1,
            kind: 'delete-text',
          },
          peer: 'b',
        },
        {
          kind: 'edit',
          operation: {
            at: { path: [1, 0], offset: 0 },
            kind: 'insert-text',
            text: 'Q',
          },
          peer: 'b',
        },
      ],
    },
  ];

  for (const { children, deleted, name, offline } of deletedMergeTraces) {
    it(`undoes ${name} below an offline merge into a block a peer deleted`, () => {
      const run = runCollaborativeHistoryTrace({
        allowedFallbacks: [
          'remote-event-projected-content',
          'remote-event-invalid-delta',
          'remote-event-empty-root',
        ],
        children,
        clientIds,
        numericClientIds,
        trace: {
          seed: 14_013,
          steps: [
            ...offline,
            { kind: 'sync', peer: 'b' },
            { kind: 'disconnect', peer: 'b' },
            {
              kind: 'edit',
              operation: {
                at: { path: [0, 0], offset: 0 },
                distance: deleted,
                kind: 'delete-text',
              },
              peer: 'a',
            },
            {
              kind: 'edit',
              operation: { at: [1], kind: 'merge-node' },
              peer: 'b',
            },
            { kind: 'sync', peer: 'a' },
            { kind: 'reconnect', peer: 'b' },
            ...offline.map(() => ({ kind: 'undo', peer: 'b' }) as const),
            { kind: 'undo', peer: 'b' },
            { kind: 'sync', peer: 'b' },
          ],
        },
      });
      const final = run.observations.at(-1)?.peers;

      assert.deepEqual(
        {
          a: final?.a?.document,
          b: final?.b?.document,
          history: final?.b?.history,
        },
        {
          a: { children: [paragraph('tail')] },
          b: { children: [paragraph('tail')] },
          history: { redos: 0, undos: 0 },
        }
      );
    });
  }

  it('drops an undo the schema rejects after a peer’s join, so the undo below still replays', () => {
    const LinkSchema = defineEditorSchema('collaborative-history-link', {
      elements: {
        heading: schema.element.textBlock(),
        link: { content: schema.content.text(), inline: true },
        paragraph: schema.element.textBlock(),
      },
      id: 'collaborative-history-link',
      properties: [schema.textProperty('bold', property.boolean())],
      root: schema.content.types(['paragraph', 'heading'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      version: 1,
    });
    const children: Descendant[] = [
      {
        type: 'heading',
        children: [{ text: 'ab' }, { bold: true, text: 'cd' }],
      },
      paragraph('ef'),
      {
        type: 'paragraph',
        children: [
          { text: 'gh' },
          { type: 'link', children: [{ text: 'a' }] },
          { text: '' },
        ],
      },
    ];
    const errors: string[] = [];
    const run = runCollaborativeHistoryTrace({
      allowedFallbacks: ['remote-event-projected-content'],
      applyCustomOperation: (tx, operation) => {
        if (operation.name === 'remove-link') tx.nodes.remove({ at: [2, 1] });
        else {
          tx.text.delete({
            at: {
              anchor: { offset: 'cd'.length, path: [0, 1] },
              focus: { offset: 'gh'.length, path: [2, 0] },
            },
          });
        }
      },
      children,
      clientIds: ['a', 'b'],
      createEditor: () =>
        createEditor({
          initialValue: structuredClone(children),
          lifecycleErrorSink: (error) => errors.push(String(error.cause)),
          plugins: [LinkSchema, history()],
        }),
      numericClientIds,
      trace: {
        seed: 14_014,
        steps: [
          {
            kind: 'edit',
            operation: {
              at: { path: [0, 0], offset: 0 },
              kind: 'insert-text',
              text: 'Z',
            },
            peer: 'b',
          },
          { kind: 'sync', peer: 'b' },
          { kind: 'disconnect', peer: 'b' },
          {
            kind: 'edit',
            operation: { kind: 'custom', name: 'join-lines' },
            peer: 'a',
          },
          {
            kind: 'edit',
            operation: { kind: 'custom', name: 'remove-link' },
            peer: 'b',
          },
          { kind: 'sync', peer: 'a' },
          { kind: 'reconnect', peer: 'b' },
          { kind: 'undo', peer: 'b' },
          { kind: 'undo', peer: 'b' },
          { kind: 'sync', peer: 'b' },
          { kind: 'redo', peer: 'b' },
          { kind: 'sync', peer: 'b' },
        ],
      },
    });
    const heading = (first: string) => ({
      children: [
        {
          type: 'heading',
          children: [{ text: first }, { bold: true, text: 'cd' }],
        },
      ],
    });

    assert.deepEqual(
      {
        errors,
        replays: run.observations.flatMap(({ peers, step }) =>
          step.kind === 'undo' || step.kind === 'redo'
            ? [{ document: peers.b?.document, history: peers.b?.history }]
            : []
        ),
      },
      {
        errors: [
          'EditorSchemaValidationError: Editor primary root cannot contain "link".',
        ],
        replays: [
          { document: heading('Zab'), history: { redos: 0, undos: 1 } },
          { document: heading('ab'), history: { redos: 1, undos: 0 } },
          { document: heading('Zab'), history: { redos: 0, undos: 1 } },
        ],
      }
    );
  });

  it('replays twelve deterministic text and property seeds', () => {
    const seeds = [
      { alpha: 'ialpha', beta: paragraph('betaI'), seed: 14_100 },
      { alpha: 'ajlpha', beta: paragraph('bta'), seed: 14_101 },
      {
        alpha: 'alkpha',
        beta: paragraph('beta', { tone: 'seed-14102' }),
        seed: 14_102,
      },
      { alpha: 'alplha', beta: paragraph('betaL'), seed: 14_103 },
      { alpha: 'alphma', beta: paragraph('bta'), seed: 14_104 },
      {
        alpha: 'alphan',
        beta: paragraph('beta', { tone: 'seed-14105' }),
        seed: 14_105,
      },
      { alpha: 'oalpha', beta: paragraph('betaO'), seed: 14_106 },
      { alpha: 'aplpha', beta: paragraph('bta'), seed: 14_107 },
      {
        alpha: 'alqpha',
        beta: paragraph('beta', { tone: 'seed-14108' }),
        seed: 14_108,
      },
      { alpha: 'alprha', beta: paragraph('betaR'), seed: 14_109 },
      { alpha: 'alphsa', beta: paragraph('bta'), seed: 14_110 },
      {
        alpha: 'alphat',
        beta: paragraph('beta', { tone: 'seed-14111' }),
        seed: 14_111,
      },
    ];

    for (const { alpha, beta, seed } of seeds) {
      const variant = seed % 3;
      const local: CanonicalTestOperation =
        variant === 0
          ? {
              at: { path: [1, 0], offset: 'beta'.length },
              kind: 'insert-text',
              text: String.fromCharCode(65 + (seed % 26)),
            }
          : variant === 1
            ? {
                at: { path: [1, 0], offset: 1 },
                distance: 1,
                kind: 'delete-text',
              }
            : {
                at: [1],
                kind: 'set-node',
                properties: { tone: `seed-${seed}` },
              };

      const run = runCollaborativeHistoryTrace({
        children: initialValue(),
        clientIds,
        numericClientIds,
        trace: offlineTrace(seed, local, {
          at: { path: [0, 0], offset: seed % ('alpha'.length + 1) },
          kind: 'insert-text',
          text: String.fromCharCode(97 + (seed % 26)),
        }),
      });

      assertRunProjectionExact(run);
      assertReplayDocuments(run, {
        redo: { children: [paragraph(alpha), beta, paragraph('gamma')] },
        undo: {
          children: [paragraph(alpha), paragraph('beta'), paragraph('gamma')],
        },
      });
    }
  });

  it('restores the Plite historic selection', () => {
    const selection = {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 'hello '.length },
      focus: { path: [0, 0], offset: 'hello world'.length },
    };
    const trace: CollaborativeHistoryTrace = {
      seed: 14_012,
      steps: [
        { kind: 'select', peer: 'b', selection },
        {
          kind: 'edit',
          operation: {
            at: selection.anchor,
            kind: 'insert-text',
            text: 'test',
          },
          peer: 'b',
        },
        { kind: 'sync', peer: 'b' },
        { kind: 'undo', peer: 'b' },
        { kind: 'sync', peer: 'b' },
        { kind: 'redo', peer: 'b' },
        { kind: 'sync', peer: 'b' },
      ],
    };
    const options = {
      children: [paragraph('hello world')],
      clientIds,
      numericClientIds,
      trace,
    } as const;
    const run = runCollaborativeHistoryTrace(options);
    const undo = run.observations[3]?.peers.b;

    assertRunProjectionExact(run);
    assert.deepEqual(undo?.selection, selection);
    assert.deepEqual(undo?.history, { redos: 1, undos: 0 });
  });

  it('undoes and redoes shared reversible effects only through Plite history', () => {
    const increment = defineEffect<number>({
      persist: { ...valueCodecs.number, version: 1 },
      collab: 'shared',
      collabReplay: 'live',
      history: 'push',
      invert: (value) => -value,
      key: 'c14.counter.increment',
    });
    const counter = defineStateField({
      key: 'c14.counter',
      initial: () => 0,
      reduce: (value, effect) =>
        effect.type === increment ? value + effect.value : value,
    });
    const effects = definePlugin('c14-counter-effects', {
      effectTypes: [increment],
      stateFields: [counter],
    });
    const trace: CollaborativeHistoryTrace = {
      seed: 14_013,
      steps: [
        {
          kind: 'edit',
          operation: { kind: 'custom', name: increment.key, value: 2 },
          peer: 'b',
        },
        { kind: 'sync', peer: 'b' },
        { kind: 'undo', peer: 'b' },
        { kind: 'sync', peer: 'b' },
        { kind: 'redo', peer: 'b' },
        { kind: 'sync', peer: 'b' },
      ],
    };
    const options = {
      applyCustomOperation(tx, operation) {
        if (operation.name !== increment.key) {
          throw new Error(`Unknown effect ${operation.name}.`);
        }
        tx.effects.emit(increment, Number(operation.value));
      },
      children: [paragraph('body')],
      clientIds,
      createEditor: () =>
        createEditor({
          plugins: [effects, history()] as const,
        }),
      numericClientIds,
      observePlugin: (editor) =>
        editor.read((state) => state.getField(counter)),
      trace,
    } satisfies CollaborativeHistoryRunOptions;
    const run = runCollaborativeHistoryTrace(options);

    assertRunProjectionExact(run);
    assert.equal(run.observations[3]?.peers.a?.plugin, 0);
    assert.equal(run.observations[3]?.peers.b?.plugin, 0);
    assert.deepEqual(run.observations[3]?.peers.b?.history, {
      redos: 1,
      undos: 0,
    });
    assert.equal(run.observations.at(-1)?.peers.a?.plugin, 2);
  });

  describe('a formatting undo across a peer’s Enter', () => {
    const BoldSchema = defineEditorSchema('collaborative-history-split-bold', {
      elements: { paragraph: { content: schema.content.text() } },
      properties: [schema.textProperty('bold', property.boolean())],
      root: schema.content.not(schema.content.text()),
      unknown: 'reject',
    });
    const createBoldEditor = () =>
      createEditor({
        initialValue: [paragraph('word')],
        plugins: [BoldSchema, history()],
      });
    const plain = [paragraph('wo'), paragraph('rd')];

    /**
     * `a` presses Enter after "wo" while `b` bolds `from..to` of "word", both
     * delivered in `order`; then `b` undoes the bold and syncs.
     */
    const boldAcrossSplit = (
      from: number,
      to: number,
      order: 'a-first' | 'b-first',
      writerFirst: boolean
    ) => {
      const peers = createSeededYjsHistoryPeers({
        children: [paragraph('word')],
        clientIds: writerFirst ? ['a', 'b'] : ['b', 'a'],
        createEditor: createBoldEditor,
        numericClientIds: { a: writerFirst ? 1 : 2, b: writerFirst ? 2 : 1 },
      });
      const [a, b] = writerFirst ? peers : [peers[1], peers[0]];
      try {
        b.editor.update.nodes.set(
          { bold: true },
          {
            at: {
              anchor: { path: [0, 0], offset: from },
              focus: { path: [0, 0], offset: to },
            },
            match: NodeApi.isText,
            split: true,
          }
        );
        a.editor.update((tx) => {
          tx.selection.set({
            kind: 'text',
            anchor: { path: [0, 0], offset: 2 },
            focus: { path: [0, 0], offset: 2 },
          });
          tx.break.insert();
        });
        syncConnectedPeers(order === 'a-first' ? [a, b] : [b, a]);
        const undosAfterSplit = b.editor.read.history().undos.length;
        b.editor.api.history.undo();
        syncConnectedPeers([b, a]);
        const fresh = createYjsPeerWithEditor(createBoldEditor(), {
          children: [paragraph('seed')],
          clientId: 'c',
          numericClientId: 3,
          seedUpdate: Y.encodeStateAsUpdate(a.doc),
        });
        const result = {
          a: readPeerChildren(a),
          b: readPeerChildren(b),
          fresh: readPeerChildren(fresh),
          undosAfterSplit,
        };
        fresh.cleanup();
        return result;
      } finally {
        a.cleanup();
        b.cleanup();
      }
    };

    for (const order of ['a-first', 'b-first'] as const) {
      for (const writerFirst of [true, false]) {
        const ids = writerFirst ? 'a lower' : 'b lower';

        it(`leaves both lines plain after undoing a bold of the whole word, ${order}, ${ids}`, () => {
          assert.deepEqual(boldAcrossSplit(0, 4, order, writerFirst), {
            a: plain,
            b: plain,
            fresh: plain,
            undosAfterSplit: 1,
          });
        });

        it(`keeps and undoes a bold of the moved "r", ${order}, ${ids}`, () => {
          assert.deepEqual(boldAcrossSplit(2, 3, order, writerFirst), {
            a: plain,
            b: plain,
            fresh: plain,
            undosAfterSplit: 1,
          });
        });
      }
    }
  });
});
