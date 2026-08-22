import assert from 'node:assert/strict';

import type {
  Descendant,
  Element,
  Editor as BasePlateEditor,
  EditorUpdateTransaction,
  Path,
  Point,
  Selection,
} from '@platejs/plite';
import type { HistoryTxApi } from '@platejs/plite-history';
import * as Y from 'yjs';

import {
  getYjsVisibleChildren,
  readPliteValueFromYjs,
} from '../../src/core/document';
import type { YjsTraceFallback } from '../../src/core/types';
import {
  connectYjsPeer,
  createSeededYjsHistoryPeers,
  disconnectYjsPeer,
  getHistoryRedoCount,
  getHistoryUndoCount,
  getYjsRoot,
  getYjsTrace,
  isYjsPeerConnected,
  type Peer,
  readPeerPliteValue,
  readPeerSelection,
  redoEditorHistory,
  syncConnectedPeers,
  undoEditorHistory,
} from './collaboration';

type TextPoint = Point & {
  readonly root?: string;
};

export type CanonicalTestOperation =
  | {
      readonly at: TextPoint;
      readonly kind: 'delete-text';
      readonly distance: number;
      readonly selection?: Selection;
    }
  | {
      readonly at: TextPoint;
      readonly kind: 'insert-text';
      readonly selection?: Selection;
      readonly text: string;
    }
  | {
      readonly at: Path;
      readonly kind: 'insert-node';
      readonly nodes: readonly Descendant[];
      readonly selection?: Selection;
    }
  | {
      readonly at: Path;
      readonly kind: 'lift-node';
      readonly selection?: Selection;
    }
  | {
      readonly at: Path;
      readonly kind: 'merge-node';
      readonly selection?: Selection;
    }
  | {
      readonly at: Path;
      readonly kind: 'move-node';
      readonly selection?: Selection;
      readonly to: Path;
    }
  | {
      readonly at: Path;
      readonly kind: 'set-node';
      readonly properties: Readonly<Record<string, unknown>>;
      readonly selection?: Selection;
    }
  | {
      readonly at: Path | TextPoint;
      readonly kind: 'split-node';
      readonly position?: number;
      readonly selection?: Selection;
    }
  | {
      readonly at: Path;
      readonly element: Element;
      readonly kind: 'wrap-node';
      readonly selection?: Selection;
    }
  | {
      readonly at: Path;
      readonly kind: 'unwrap-node';
      readonly selection?: Selection;
    }
  | {
      readonly children: readonly Descendant[];
      readonly kind: 'create-root';
      readonly root: string;
      readonly selection?: Selection;
    }
  | {
      readonly kind: 'delete-root';
      readonly root: string;
      readonly selection?: Selection;
    }
  | {
      readonly kind: 'custom';
      readonly name: string;
      readonly selection?: Selection;
      readonly value?: unknown;
    };

export type CollaborativeHistoryStep =
  | {
      readonly kind: 'edit';
      readonly operation: CanonicalTestOperation;
      readonly peer: string;
    }
  | {
      readonly kind: 'disconnect' | 'reconnect' | 'redo' | 'sync' | 'undo';
      readonly peer: string;
    }
  | {
      readonly kind: 'select';
      readonly peer: string;
      readonly selection: Selection;
    };

export type CollaborativeHistoryTrace = {
  readonly seed: number;
  readonly steps: readonly CollaborativeHistoryStep[];
};

export type CollaborativeHistoryPeerObservation = {
  readonly connected: boolean;
  readonly document: unknown;
  readonly extension: unknown;
  readonly fallbacks: readonly YjsTraceFallback[];
  readonly history: Readonly<{
    redos: number;
    undos: number;
  }>;
  readonly selection: Selection;
  readonly stateVector: readonly number[];
  readonly rawYjsProjection: unknown;
  readonly yjsIdentities: readonly CollaborativeYjsIdentityNode[];
  readonly yjsProjection: unknown;
};

export type CollaborativeYjsIdentityNode = Readonly<{
  children?: readonly CollaborativeYjsIdentityNode[];
  id: number;
}>;

export type CollaborativeHistoryStepObservation = {
  readonly peers: Readonly<Record<string, CollaborativeHistoryPeerObservation>>;
  readonly step: CollaborativeHistoryStep;
  readonly stepIndex: number;
};

export type CollaborativeHistoryRun = {
  readonly observations: readonly CollaborativeHistoryStepObservation[];
  readonly seed: number;
};

export type CollaborativeHistoryRunOptions = {
  readonly allowedFallbacks?: readonly YjsTraceFallback[];
  readonly applyCustomOperation?: (
    tx: EditorUpdateTransaction,
    operation: Extract<CanonicalTestOperation, { readonly kind: 'custom' }>
  ) => void;
  readonly children: readonly Descendant[];
  readonly clientIds: readonly string[];
  readonly createEditor?: () => BasePlateEditor;
  readonly numericClientIds?: Readonly<Record<string, number>>;
  readonly observeExtension?: (editor: BasePlateEditor) => unknown;
  readonly roots?: Readonly<Record<string, readonly Descendant[]>>;
  readonly trace: CollaborativeHistoryTrace;
};

const historyRootName = '@platejs/plite';

const clone = <T>(value: T): T => structuredClone(value);

const applyOperation = (
  peer: Peer,
  operation: CanonicalTestOperation,
  applyCustomOperation: CollaborativeHistoryRunOptions['applyCustomOperation']
): void => {
  peer.editor.update((tx) => {
    (
      tx as EditorUpdateTransaction & {
        readonly history: HistoryTxApi;
      }
    ).history.newBatch();

    if (operation.selection !== undefined) {
      tx.selection.set(operation.selection);
    }

    switch (operation.kind) {
      case 'create-root': {
        tx.roots.create(operation.root, operation.children);
        break;
      }
      case 'custom': {
        if (!applyCustomOperation) {
          throw new Error(
            `Missing custom collaborative-history operation "${operation.name}".`
          );
        }
        applyCustomOperation(tx, operation);
        break;
      }
      case 'delete-root': {
        tx.roots.delete(operation.root);
        break;
      }
      case 'delete-text': {
        tx.text.delete({
          at: operation.at,
          distance: operation.distance,
        });
        break;
      }
      case 'insert-node': {
        tx.nodes.insert([...operation.nodes], { at: operation.at });
        break;
      }
      case 'insert-text': {
        tx.text.insert(operation.text, { at: operation.at });
        break;
      }
      case 'lift-node': {
        tx.nodes.lift({ at: operation.at });
        break;
      }
      case 'merge-node': {
        tx.nodes.merge({ at: operation.at });
        break;
      }
      case 'move-node': {
        tx.nodes.move({ at: operation.at, to: operation.to });
        break;
      }
      case 'set-node': {
        tx.nodes.set(operation.properties, { at: operation.at });
        break;
      }
      case 'split-node': {
        tx.nodes.split({
          at: operation.at,
          ...(operation.position === undefined
            ? {}
            : { position: operation.position }),
        });
        break;
      }
      case 'unwrap-node': {
        tx.nodes.unwrap({ at: operation.at });
        break;
      }
      case 'wrap-node': {
        tx.nodes.wrap(operation.element, { at: operation.at });
        break;
      }
    }
  });
};

const peerFor = (
  peers: Readonly<Record<string, Peer>>,
  peerId: string
): Peer => {
  const peer = peers[peerId];

  if (!peer) {
    throw new Error(`Unknown collaborative-history peer "${peerId}".`);
  }

  return peer;
};

const syncUntilStable = (peers: readonly Peer[]): void => {
  const connected = () => peers.filter(isYjsPeerConnected);
  const stateVectors = () =>
    connected().map((peer) => [...Y.encodeStateVector(peer.doc)].join(','));

  for (let round = 0; round < peers.length + 3; round++) {
    const before = stateVectors();

    syncConnectedPeers(peers);

    const after = stateVectors();

    if (after.every((value, index) => value === before[index])) return;
  }

  throw new Error('Collaborative-history sync did not reach a fixed point.');
};

const applyStep = ({
  applyCustomOperation,
  peers,
  step,
}: {
  applyCustomOperation: CollaborativeHistoryRunOptions['applyCustomOperation'];
  peers: Readonly<Record<string, Peer>>;
  step: CollaborativeHistoryStep;
}): void => {
  const peer = peerFor(peers, step.peer);

  switch (step.kind) {
    case 'disconnect': {
      disconnectYjsPeer(peer);
      break;
    }
    case 'edit': {
      applyOperation(peer, step.operation, applyCustomOperation);
      break;
    }
    case 'reconnect': {
      connectYjsPeer(peer);
      syncUntilStable(Object.values(peers));
      break;
    }
    case 'redo': {
      redoEditorHistory(peer.editor);
      break;
    }
    case 'select': {
      peer.editor.update.selection.set(step.selection);
      break;
    }
    case 'sync': {
      syncUntilStable(Object.values(peers));
      break;
    }
    case 'undo': {
      undoEditorHistory(peer.editor);
      break;
    }
  }
};

const readRawYjsProjection = (peer: Peer) => {
  const namedRoots = peer.doc.getMap<Y.XmlElement>(`${historyRootName}:roots`);
  const roots = Object.fromEntries(
    [...namedRoots]
      .filter(
        (entry): entry is [string, Y.XmlElement] =>
          entry[1] instanceof Y.XmlElement
      )
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([root, value]) => [root, clone(readPliteValueFromYjs(value))])
  );

  return {
    children: clone(readPeerPliteValue(peer)),
    roots,
  };
};

const canonicalizeYjsProjection = (
  peer: Peer,
  projection: ReturnType<typeof readRawYjsProjection>
) => clone(peer.editor.read.schema.fitDocument(projection));

const createYjsIdentityReader = (peer: Peer) => {
  const ids = new WeakMap<Y.AbstractType<unknown>, number>();
  const root = getYjsRoot(peer);
  let nextId = 0;
  const readId = (node: Y.AbstractType<unknown>): number => {
    const current = ids.get(node);

    if (current !== undefined) return current;

    const id = (nextId += 1) - 1;

    ids.set(node, id);

    return id;
  };
  const readNode = (
    node: Y.XmlElement | Y.XmlText
  ): CollaborativeYjsIdentityNode => ({
    ...(node instanceof Y.XmlElement
      ? {
          children: getYjsVisibleChildren(root, node).map(readNode),
        }
      : {}),
    id: readId(node),
  });

  return (): readonly CollaborativeYjsIdentityNode[] =>
    getYjsVisibleChildren(root, root).map(readNode);
};

const observePeer = (
  peer: Peer,
  observeExtension: CollaborativeHistoryRunOptions['observeExtension'],
  readYjsIdentities: ReturnType<typeof createYjsIdentityReader>
): CollaborativeHistoryPeerObservation => {
  const rawYjsProjection = readRawYjsProjection(peer);

  return {
    connected: isYjsPeerConnected(peer),
    document: clone(peer.editor.read.value()),
    extension: clone(observeExtension?.(peer.editor) ?? null),
    fallbacks: getYjsTrace(peer)
      .flatMap((entry) => (entry.fallback ? [entry.fallback] : []))
      .sort(),
    history: {
      redos: getHistoryRedoCount(peer.editor),
      undos: getHistoryUndoCount(peer.editor),
    },
    rawYjsProjection,
    selection: clone(readPeerSelection(peer)),
    stateVector: [...Y.encodeStateVector(peer.doc)],
    yjsIdentities: readYjsIdentities(),
    yjsProjection: canonicalizeYjsProjection(peer, rawYjsProjection),
  };
};

const assertConnectedPeersConverged = (
  observation: CollaborativeHistoryStepObservation
): void => {
  const connected = Object.entries(observation.peers).filter(
    ([, peer]) => peer.connected
  );
  const [, first] = connected[0] ?? [];

  if (!first) return;

  for (const [peerId, peer] of connected.slice(1)) {
    assert.deepEqual(
      peer.document,
      first.document,
      `connected document mismatch for peer ${peerId}`
    );
    assert.deepEqual(
      peer.yjsProjection,
      first.yjsProjection,
      `connected Yjs projection mismatch for peer ${peerId}`
    );
    assert.deepEqual(
      peer.rawYjsProjection,
      first.rawYjsProjection,
      `connected raw Yjs projection mismatch for peer ${peerId}`
    );
    assert.deepEqual(
      peer.stateVector,
      first.stateVector,
      `connected Yjs state vector mismatch for peer ${peerId}`
    );
  }
};

const collaborativeHistoryFailure = ({
  cause,
  trace,
  stepIndex,
}: {
  cause: unknown;
  trace: CollaborativeHistoryTrace;
  stepIndex: number;
}): Error => {
  const minimized = {
    seed: trace.seed,
    steps: trace.steps.slice(0, stepIndex + 1),
  };
  const message = cause instanceof Error ? cause.message : String(cause);

  return new Error(
    [
      `Collaborative history mismatch at seed ${trace.seed}, step ${stepIndex}.`,
      message,
      `Minimized failing prefix: ${JSON.stringify(minimized)}`,
      `Full trace: ${JSON.stringify(trace)}`,
    ].join('\n'),
    { cause }
  );
};

export const runCollaborativeHistoryTrace = (
  options: CollaborativeHistoryRunOptions
): CollaborativeHistoryRun => {
  const peersList = createSeededYjsHistoryPeers({
    children: options.children,
    clientIds: options.clientIds,
    createEditor: options.createEditor,
    numericClientIds: options.numericClientIds,
    roots: options.roots,
  });
  const peers = Object.fromEntries(
    options.clientIds.map((clientId, index) => {
      const peer = peersList[index];

      if (!peer) {
        throw new Error(
          `Missing collaborative-history peer "${clientId}" at index ${index}.`
        );
      }

      return [clientId, peer];
    })
  );
  const identityReaders = Object.fromEntries(
    options.clientIds.map((clientId) => [
      clientId,
      createYjsIdentityReader(peerFor(peers, clientId)),
    ])
  );
  const observations: CollaborativeHistoryStepObservation[] = [];

  try {
    for (const [stepIndex, step] of options.trace.steps.entries()) {
      try {
        applyStep({
          applyCustomOperation: options.applyCustomOperation,
          peers,
          step,
        });
        const observation = {
          peers: Object.fromEntries(
            options.clientIds.map((clientId) => [
              clientId,
              observePeer(
                peerFor(peers, clientId),
                options.observeExtension,
                identityReaders[clientId]
              ),
            ])
          ),
          step,
          stepIndex,
        };
        const allowedFallbacks = new Set(options.allowedFallbacks);

        for (const [peerId, peer] of Object.entries(observation.peers)) {
          assert.deepEqual(
            peer.fallbacks.filter(
              (fallback) => !allowedFallbacks.has(fallback)
            ),
            [],
            `unexpected Yjs fallback for peer ${peerId}`
          );
        }
        if (step.kind === 'reconnect' || step.kind === 'sync') {
          assertConnectedPeersConverged(observation);
        }
        observations.push(observation);
      } catch (error) {
        throw collaborativeHistoryFailure({
          cause: error,
          stepIndex,
          trace: options.trace,
        });
      }
    }
  } finally {
    for (const peer of Object.values(peers)) {
      peer.cleanup();
      peer.doc.destroy();
    }
  }

  return {
    observations,
    seed: options.trace.seed,
  };
};
