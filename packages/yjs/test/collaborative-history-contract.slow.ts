import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineExtension,
  defineEffect,
  defineStateField,
  type Descendant,
  type Path,
  valueCodecs,
} from '@platejs/plite';
import { history } from '@platejs/plite-history';

import { paragraph } from './support/collaboration';
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

describe('@platejs/yjs collaborative history contract', () => {
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

  const exactScenarios: readonly {
    readonly allowedFallbacks?: readonly ['remote-event-projected-content'];
    readonly children: readonly Descendant[];
    readonly name: string;
    readonly trace: CollaborativeHistoryTrace;
  }[] = [
    {
      children: initialValue(),
      name: 'node properties',
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
    });
  }

  const structuralBlockers: readonly {
    readonly allowedFallbacks?: readonly [
      'remote-event-projected-content',
      'remote-event-invalid-delta',
    ];
    readonly children: readonly Descendant[];
    readonly identityPaths: readonly Path[];
    readonly minimized: CollaborativeHistoryTrace;
    readonly name: string;
    readonly offline: CollaborativeHistoryTrace;
  }[] = [
    {
      children: [paragraph('alphabeta'), paragraph('gamma')],
      identityPaths: [[0], [0], [0]],
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

  it('replays twelve deterministic text and property seeds', () => {
    const seeds = Array.from({ length: 12 }, (_, index) => 14_100 + index);

    for (const seed of seeds) {
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
      codec: valueCodecs.number,
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
    const effects = defineExtension('c14-counter-effects', {
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
          extensions: [history(), effects] as const,
        }),
      numericClientIds,
      observeExtension: (editor) =>
        editor.read((state) => state.getField(counter)),
      trace,
    } satisfies CollaborativeHistoryRunOptions;
    const run = runCollaborativeHistoryTrace(options);

    assertRunProjectionExact(run);
    assert.equal(run.observations[3]?.peers.a?.extension, 0);
    assert.equal(run.observations[3]?.peers.b?.extension, 0);
    assert.deepEqual(run.observations[3]?.peers.b?.history, {
      redos: 1,
      undos: 0,
    });
    assert.equal(run.observations.at(-1)?.peers.a?.extension, 2);
  });
});
