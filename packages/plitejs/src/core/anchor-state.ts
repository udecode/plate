import type {
  AnyEditor as Editor,
  EditorCommit,
  EditorDocumentValue,
  NodeKey,
} from '../interfaces/editor';
import { PointApi } from '../interfaces/point';
import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
} from './change/document-change';
import { DocumentIndex } from './change/document-index';
import { getRangeEndpointAssociations } from './change/range-association';
import type { JsonEditorValue, JsonNode } from './change/tokens';
import { toPublicRoot } from './public-root';

export const RECOVERY_RECORD_SIZE = 7;
export const RECOVERY_ID = 0;
export const RECOVERY_ROOT = 1;
export const RECOVERY_FLAGS = 2;
export const RECOVERY_BEFORE_A = 3;
export const RECOVERY_BEFORE_B = 4;
export const RECOVERY_AFTER_A = 5;
export const RECOVERY_AFTER_B = 6;
export const RECOVERY_NULL_POSITION = -1;

export const RECOVERY_KIND_MASK = 0b11;
export const RECOVERY_KIND_PATH = 0;
export const RECOVERY_KIND_POINT = 1;
export const RECOVERY_KIND_RANGE = 2;
export const RECOVERY_PATH_MODE_SHIFT = 2;
export const RECOVERY_PATH_MODE_MASK = 0b11 << RECOVERY_PATH_MODE_SHIFT;
export const RECOVERY_PATH_MODE_ROOT = 1;
export const RECOVERY_PATH_MODE_NODE = 2;
export const RECOVERY_PATH_MODE_BOUNDARY = 3;
export const RECOVERY_ASSOCIATION_SHIFT = 4;
export const RECOVERY_ASSOCIATION_MASK = 0b11 << RECOVERY_ASSOCIATION_SHIFT;
export const RECOVERY_ASSOCIATION_BACKWARD = 0;
export const RECOVERY_ASSOCIATION_FORWARD = 1;
export const RECOVERY_ASSOCIATION_INWARD = 2;
export const RECOVERY_ASSOCIATION_OUTWARD = 3;
export const RECOVERY_INCLUDE_ROOT_A = 1 << 6;
export const RECOVERY_INCLUDE_ROOT_B = 1 << 7;
export const RECOVERY_BEFORE_A_FORWARD = 1 << 8;
export const RECOVERY_BEFORE_B_FORWARD = 1 << 9;
export const RECOVERY_AFTER_A_FORWARD = 1 << 10;
export const RECOVERY_AFTER_B_FORWARD = 1 << 11;

export type AnchorHistoryRecoveryTarget = 'after' | 'before';

export type AnchorHistoryRecovery = Readonly<{
  data: Int32Array;
  roots: readonly string[];
}>;

export type AnchorHistoryCapture = Readonly<{
  anchorCeiling: number;
  recovery: AnchorHistoryRecovery | null;
}>;

type AnchorHistoryListener = Readonly<{
  capture: (
    data: Int32Array,
    offset: number,
    id: number,
    rootIndex: number,
    before: DocumentIndex,
    after: DocumentIndex,
    memoize: <T>(
      phase: 'after' | 'before',
      nodeKey: NodeKey | null,
      path: readonly number[],
      pointOffset: number,
      read: () => T
    ) => T
  ) => boolean;
  restore: (
    data: Int32Array,
    offset: number,
    target: AnchorHistoryRecoveryTarget,
    value: EditorDocumentValue,
    memoize: <T>(position: number, side: -1 | 1, read: () => T) => T,
    defer: boolean
  ) => boolean;
}>;

export type AnchorStateListener = {
  begin: () => void;
  change: (context: AnchorChangeContext) => void;
  commit: (value?: EditorDocumentValue, commit?: EditorCommit) => void;
  discard: (value: EditorDocumentValue) => void;
  fallback: () => boolean;
  history?: AnchorHistoryListener;
  nodeKeys: () => readonly NodeKey[];
  root: string;
};

export type AnchorChangeContext = Readonly<{
  after: EditorDocumentValue;
  before: EditorDocumentValue;
  change: DocumentChange;
  afterRoot: (root: string) => DocumentIndex;
  beforeRoot: (root: string) => DocumentIndex;
  mapRecoveryPoint: (
    root: string,
    position: number,
    association: -1 | 1
  ) => number | null;
  memoize: <T>(key: string, read: () => T) => T;
  replace: boolean;
  structural: (root: string) => boolean;
}>;

export type AnchorStateWork = Readonly<{
  phase: 'begin' | 'change' | 'commit' | 'discard';
  recoveryBytes?: number;
  recoveryEntries?: number;
  visitedAnchors: number;
}>;

type ActiveAnchorState = {
  activeTransaction: Set<AnchorStateListener> | null;
  fallbackListeners: Map<string, Set<AnchorStateListener>>;
  indexes: Map<string, DocumentIndex>;
  historyListeners: number;
  listenerNodeKeys: Map<AnchorStateListener, readonly NodeKey[]>;
  listeners: Set<AnchorStateListener>;
  listenersByNodeKey: Map<NodeKey, Set<AnchorStateListener>>;
  listenersByRuntimeId: Map<number, AnchorStateListener>;
  listenersByRoot: Map<string, Set<AnchorStateListener>>;
  runtimeIds: Map<AnchorStateListener, number>;
  transactionBeforeValue: EditorDocumentValue | null;
  value: EditorDocumentValue;
};

const ACTIVE_ANCHORS = new WeakMap<Editor, ActiveAnchorState>();
const ANCHOR_SCOPES = new WeakMap<Editor, ActiveAnchorState[]>();
const ANCHOR_STATE_WORK_OBSERVERS = new WeakMap<
  Editor,
  (work: AnchorStateWork) => void
>();
const ANCHOR_RUNTIME_ID = new WeakMap<Editor, number>();
const ANCHOR_TRANSACTION_CEILING = new WeakMap<Editor, number>();
const COMMIT_ANCHOR_HISTORY = new WeakMap<EditorCommit, AnchorHistoryCapture>();
const STAGED_ANCHOR_HISTORY = new WeakMap<
  Editor,
  Readonly<{
    recovery: AnchorHistoryRecovery | null;
    target: AnchorHistoryRecoveryTarget;
  }>
>();

export const observeAnchorStateWork = (
  editor: Editor,
  observer: (work: AnchorStateWork) => void
) => {
  ANCHOR_STATE_WORK_OBSERVERS.set(editor, observer);

  return () => {
    if (ANCHOR_STATE_WORK_OBSERVERS.get(editor) === observer) {
      ANCHOR_STATE_WORK_OBSERVERS.delete(editor);
    }
  };
};

const recordAnchorStateWork = (
  editor: Editor,
  phase: AnchorStateWork['phase'],
  visitedAnchors: number,
  recoveryEntries = 0,
  recoveryBytes = 0
) => {
  ANCHOR_STATE_WORK_OBSERVERS.get(editor)?.({
    phase,
    recoveryBytes,
    recoveryEntries,
    visitedAnchors,
  });
};

const getActiveAnchorState = (editor: Editor) =>
  ANCHOR_SCOPES.get(editor)?.at(-1) ?? ACTIVE_ANCHORS.get(editor);

const createActiveAnchorState = (
  value: EditorDocumentValue
): ActiveAnchorState => ({
  activeTransaction: null,
  fallbackListeners: new Map(),
  historyListeners: 0,
  indexes: new Map(),
  listenerNodeKeys: new Map(),
  listeners: new Set(),
  listenersByNodeKey: new Map(),
  listenersByRuntimeId: new Map(),
  listenersByRoot: new Map(),
  runtimeIds: new Map(),
  transactionBeforeValue: null,
  value,
});

const addToIndex = <TKey>(
  index: Map<TKey, Set<AnchorStateListener>>,
  key: TKey,
  listener: AnchorStateListener
) => {
  const listeners = index.get(key) ?? new Set<AnchorStateListener>();

  listeners.add(listener);
  index.set(key, listeners);
};

const removeFromIndex = <TKey>(
  index: Map<TKey, Set<AnchorStateListener>>,
  key: TKey,
  listener: AnchorStateListener
) => {
  const listeners = index.get(key);

  listeners?.delete(listener);
  if (listeners?.size === 0) index.delete(key);
};

const unindexAnchorListener = (
  state: ActiveAnchorState,
  listener: AnchorStateListener
) => {
  for (const nodeKey of state.listenerNodeKeys.get(listener) ?? []) {
    removeFromIndex(state.listenersByNodeKey, nodeKey, listener);
  }
  state.listenerNodeKeys.delete(listener);
  removeFromIndex(state.fallbackListeners, listener.root, listener);
};

const indexAnchorListener = (
  state: ActiveAnchorState,
  listener: AnchorStateListener
) => {
  const nodeKeys = Object.freeze([...new Set(listener.nodeKeys())]);
  const previousNodeKeys = state.listenerNodeKeys.get(listener);

  if (
    previousNodeKeys?.length === nodeKeys.length &&
    previousNodeKeys.every((nodeKey, index) => nodeKey === nodeKeys[index])
  ) {
    return;
  }

  unindexAnchorListener(state, listener);
  state.listenerNodeKeys.set(listener, nodeKeys);
  for (const nodeKey of nodeKeys) {
    addToIndex(state.listenersByNodeKey, nodeKey, listener);
  }
  if (nodeKeys.length === 0 && listener.fallback()) {
    addToIndex(state.fallbackListeners, listener.root, listener);
  }
};

const addAnchorListener = (
  state: ActiveAnchorState,
  listener: AnchorStateListener,
  runtimeId?: number
) => {
  state.listeners.add(listener);
  if (listener.history) state.historyListeners += 1;
  addToIndex(state.listenersByRoot, listener.root, listener);
  if (runtimeId !== undefined) {
    state.listenersByRuntimeId.set(runtimeId, listener);
    state.runtimeIds.set(listener, runtimeId);
  }
  indexAnchorListener(state, listener);
};

const removeAnchorListener = (
  state: ActiveAnchorState,
  listener: AnchorStateListener
) => {
  state.activeTransaction?.delete(listener);
  state.listeners.delete(listener);
  if (listener.history) state.historyListeners -= 1;
  removeFromIndex(state.listenersByRoot, listener.root, listener);
  const runtimeId = state.runtimeIds.get(listener);

  if (runtimeId !== undefined) {
    state.listenersByRuntimeId.delete(runtimeId);
    state.runtimeIds.delete(listener);
  }
  unindexAnchorListener(state, listener);
};

/** Temporarily hide every draft anchor scope from an ambient editor read. */
export const suspendAnchorScopes = (editor: Editor) => {
  const scopes = ANCHOR_SCOPES.get(editor);

  if (!scopes || scopes.length === 0) return () => {};

  ANCHOR_SCOPES.delete(editor);

  return () => {
    if ((ANCHOR_SCOPES.get(editor)?.length ?? 0) > 0) {
      throw new Error(
        'Draft anchor scopes leaked from an ambient editor read.'
      );
    }

    ANCHOR_SCOPES.set(editor, scopes);
  };
};

/** Isolate live anchors created while building a non-publishing transaction. */
export const enterAnchorScope = (
  editor: Editor,
  value: EditorDocumentValue
) => {
  const scopes = ANCHOR_SCOPES.get(editor) ?? [];
  const state = createActiveAnchorState(value);

  scopes.push(state);
  ANCHOR_SCOPES.set(editor, scopes);

  return () => {
    if (scopes.at(-1) !== state) {
      throw new Error('Anchor scopes must close in stack order.');
    }

    scopes.pop();
    if (scopes.length === 0) ANCHOR_SCOPES.delete(editor);
  };
};

export const hasActiveAnchors = (editor: Editor) =>
  (getActiveAnchorState(editor)?.listeners.size ?? 0) > 0;

export const getAnchorStateValue = (editor: Editor) =>
  getActiveAnchorState(editor)?.value;

const rootNodes = (value: JsonEditorValue, root: string) =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);

const indexRoot = (
  value: EditorDocumentValue,
  indexes: Map<string, DocumentIndex>,
  root: string
) => {
  let index = indexes.get(root);

  if (!index) {
    index = DocumentIndex.fromValue(rootNodes(value, root));
    indexes.set(root, index);
  }

  return index;
};

const createAnchorChangeContext = (
  before: EditorDocumentValue,
  after: EditorDocumentValue,
  change: DocumentChange,
  beforeIndexes: Map<string, DocumentIndex>,
  afterIndexes: Map<string, DocumentIndex>,
  replace: boolean,
  commit?: EditorCommit
): AnchorChangeContext => {
  const memo = new Map<string, unknown>();
  const recoveryPoints = new Map<
    string,
    Readonly<{
      backward: Map<number, number | null>;
      forward: Map<number, number | null>;
    }>
  >();

  return {
    after,
    afterRoot: (root) => indexRoot(after, afterIndexes, root),
    before,
    beforeRoot: (root) => indexRoot(before, beforeIndexes, root),
    change,
    mapRecoveryPoint: (root, position, association) => {
      if (
        position === RECOVERY_NULL_POSITION ||
        !hasDocumentRoot(after, root)
      ) {
        return null;
      }
      let rootPoints = recoveryPoints.get(root);

      if (!rootPoints) {
        rootPoints = {
          backward: new Map(),
          forward: new Map(),
        };
        recoveryPoints.set(root, rootPoints);
      }
      const points =
        association === -1 ? rootPoints.backward : rootPoints.forward;

      if (points.has(position)) return points.get(position) ?? null;
      const mapped = mapRecoveryPosition(change, position, association, root);
      const result =
        mapped !== null &&
        indexRoot(after, afterIndexes, root).pointAt(mapped, association)
          ? mapped
          : null;

      points.set(position, result);

      return result;
    },
    memoize: <T>(key: string, read: () => T) => {
      if (memo.has(key)) return memo.get(key) as T;
      const value = read();

      memo.set(key, value);
      return value;
    },
    replace,
    structural: (root) =>
      commit?.changed.has('structure', toPublicRoot(root)) ?? true,
  };
};

export const getAnchorRootIndex = (
  editor: Editor,
  value: EditorDocumentValue,
  root: string
) => {
  const state = getActiveAnchorState(editor);

  return state?.value === value
    ? indexRoot(value, state.indexes, root)
    : DocumentIndex.fromValue(rootNodes(value, root));
};

const hasDocumentRoot = (value: EditorDocumentValue, root: string) =>
  root === 'main' || Object.hasOwn(value.roots ?? {}, root);

const recoveryKind = (flags: number) => flags & RECOVERY_KIND_MASK;

const recoveryPathMode = (flags: number) =>
  (flags & RECOVERY_PATH_MODE_MASK) >> RECOVERY_PATH_MODE_SHIFT;

const recoveryAssociation = (flags: number) =>
  (flags & RECOVERY_ASSOCIATION_MASK) >> RECOVERY_ASSOCIATION_SHIFT;

const recoverySide = (flags: number, bit: number): -1 | 1 =>
  (flags & bit) === 0 ? -1 : 1;

const withRecoverySide = (flags: number, bit: number, side: -1 | 1) =>
  side === 1 ? flags | bit : flags & ~bit;

const createAnchorHistoryRecovery = (
  roots: readonly string[],
  values: ArrayLike<number>
): AnchorHistoryRecovery | null =>
  values.length === 0
    ? null
    : Object.freeze({
        data: values instanceof Int32Array ? values : new Int32Array(values),
        roots: Object.freeze([...roots]),
      });

const mapRecoveryPosition = (
  change: DocumentChange,
  position: number,
  association: -1 | 1,
  root: string,
  source?: DocumentIndex,
  targetNodes?: ReadonlyMap<
    JsonNode,
    Readonly<{
      contentFrom: number;
      from: number;
      kind: 'element' | 'text';
      path: readonly number[];
    }>
  >
) => {
  if (position === RECOVERY_NULL_POSITION) return null;
  const options = {
    association:
      association === -1 ? ('backward' as const) : ('forward' as const),
    ...(root === 'main' ? {} : { root }),
  };
  const tracked = change.mapPosition(position, {
    ...options,
    track: 'around',
  });

  if (tracked !== null) return tracked;
  const sourcePoint = source?.pointAt(position, association);
  const targetEntry =
    source && sourcePoint
      ? targetNodes?.get(source.node(sourcePoint.path))
      : undefined;

  if (sourcePoint && targetEntry?.kind === 'text') {
    return targetEntry.contentFrom + sourcePoint.offset;
  }

  return change.mapPosition(position, options);
};

/** Map one private recovery side through the same change as its history base. */
export const mapAnchorHistoryRecovery = (
  recovery: AnchorHistoryRecovery | null,
  target: AnchorHistoryRecoveryTarget,
  change: DocumentChange,
  before: EditorDocumentValue,
  after: EditorDocumentValue
): AnchorHistoryRecovery | null => {
  if (!recovery || change.empty) return recovery;

  const values = new Int32Array(recovery.data);
  const sourceDocuments = new Map<string, DocumentIndex>();
  const targetDocuments = new Map<string, DocumentIndex>();
  const targetNodes = new Map<
    string,
    Map<
      JsonNode,
      Readonly<{
        contentFrom: number;
        from: number;
        kind: 'element' | 'text';
        path: readonly number[];
      }>
    >
  >();
  const mappedPoints = new Map<
    string,
    Readonly<{
      backward: Map<number, number | null>;
      forward: Map<number, number | null>;
    }>
  >();
  const sourceDocument = (root: string) => {
    let document = sourceDocuments.get(root);

    if (!document) {
      document = DocumentIndex.fromValue(rootNodes(before, root));
      sourceDocuments.set(root, document);
    }

    return document;
  };
  const targetDocument = (root: string) => {
    let document = targetDocuments.get(root);

    if (!document) {
      document = DocumentIndex.fromValue(rootNodes(after, root));
      targetDocuments.set(root, document);
    }

    return document;
  };
  const targetNodeIndex = (root: string) => {
    let index = targetNodes.get(root);

    if (!index) {
      const document = targetDocument(root);

      index = new Map();
      for (const entry of document.nodeRangesTouching(0, document.length)) {
        index.set(document.node(entry.path), entry);
      }
      targetNodes.set(root, index);
    }

    return index;
  };
  const mapPointPosition = (
    root: string,
    position: number,
    association: -1 | 1
  ) => {
    let rootPoints = mappedPoints.get(root);

    if (!rootPoints) {
      rootPoints = { backward: new Map(), forward: new Map() };
      mappedPoints.set(root, rootPoints);
    }
    const points =
      association === -1 ? rootPoints.backward : rootPoints.forward;

    if (points.has(position)) return points.get(position) ?? null;
    const mapped = mapRecoveryPosition(
      change,
      position,
      association,
      root,
      sourceDocument(root),
      targetNodeIndex(root)
    );

    points.set(position, mapped);

    return mapped;
  };
  const firstPosition =
    target === 'before' ? RECOVERY_BEFORE_A : RECOVERY_AFTER_A;
  const secondPosition =
    target === 'before' ? RECOVERY_BEFORE_B : RECOVERY_AFTER_B;
  const firstSideBit =
    target === 'before' ? RECOVERY_BEFORE_A_FORWARD : RECOVERY_AFTER_A_FORWARD;
  const secondSideBit =
    target === 'before' ? RECOVERY_BEFORE_B_FORWARD : RECOVERY_AFTER_B_FORWARD;

  for (let offset = 0; offset < values.length; offset += RECOVERY_RECORD_SIZE) {
    let flags = values[offset + RECOVERY_FLAGS];
    const root = recovery.roots[values[offset + RECOVERY_ROOT]];

    if (!root) throw new Error('Invalid anchor recovery root.');

    const first = values[offset + firstPosition];
    const second = values[offset + secondPosition];
    const kind = recoveryKind(flags);

    if (kind === RECOVERY_KIND_PATH) {
      if (recoveryPathMode(flags) === RECOVERY_PATH_MODE_ROOT) {
        values[offset + firstPosition] = hasDocumentRoot(after, root)
          ? 0
          : RECOVERY_NULL_POSITION;
        continue;
      }
      if (first === RECOVERY_NULL_POSITION || !hasDocumentRoot(after, root)) {
        values[offset + firstPosition] = RECOVERY_NULL_POSITION;
        continue;
      }

      const association =
        recoveryAssociation(flags) === RECOVERY_ASSOCIATION_BACKWARD ? -1 : 1;
      const mode = recoveryPathMode(flags);
      const source = sourceDocument(root);
      const sourceEntry =
        mode === RECOVERY_PATH_MODE_NODE ? source.nodeStartingAt(first) : null;
      const sourceBoundary =
        mode === RECOVERY_PATH_MODE_BOUNDARY
          ? source.childBoundaryAt(first)
          : null;
      const movedEntry = sourceEntry
        ? targetNodeIndex(root).get(source.node(sourceEntry.path))
        : sourceBoundary && sourceBoundary.parentPath.length > 0
          ? targetNodeIndex(root).get(source.node(sourceBoundary.parentPath))
          : null;
      const movedPosition =
        sourceEntry && movedEntry
          ? movedEntry.from
          : sourceBoundary && movedEntry
            ? targetDocument(root).childPosition(
                movedEntry.path,
                sourceBoundary.index
              )
            : null;
      const mapped =
        movedPosition ?? mapRecoveryPosition(change, first, association, root);
      const valid =
        mapped !== null &&
        (mode === RECOVERY_PATH_MODE_NODE
          ? targetDocument(root).nodeStartingAt(mapped) !== null
          : targetDocument(root).childBoundaryAt(mapped) !== null);

      values[offset + firstPosition] = valid ? mapped : RECOVERY_NULL_POSITION;
      continue;
    }

    if (
      first === RECOVERY_NULL_POSITION ||
      (kind === RECOVERY_KIND_RANGE && second === RECOVERY_NULL_POSITION) ||
      !hasDocumentRoot(after, root)
    ) {
      values[offset + firstPosition] = RECOVERY_NULL_POSITION;
      values[offset + secondPosition] = RECOVERY_NULL_POSITION;
      continue;
    }

    let associations: ReadonlyArray<-1 | 1>;

    if (kind === RECOVERY_KIND_POINT) {
      associations = [
        recoveryAssociation(flags) === RECOVERY_ASSOCIATION_BACKWARD ? -1 : 1,
      ];
    } else {
      const source = sourceDocument(root);
      const anchor = source.pointAt(first, recoverySide(flags, firstSideBit));
      const focus = source.pointAt(second, recoverySide(flags, secondSideBit));

      if (!anchor || !focus) {
        values[offset + firstPosition] = RECOVERY_NULL_POSITION;
        values[offset + secondPosition] = RECOVERY_NULL_POSITION;
        continue;
      }

      const direction = PointApi.equals(anchor, focus)
        ? 'collapsed'
        : PointApi.isBefore(anchor, focus)
          ? 'forward'
          : 'backward';
      const association = recoveryAssociation(flags);

      associations = getRangeEndpointAssociations(
        direction,
        association === RECOVERY_ASSOCIATION_BACKWARD
          ? 'backward'
          : association === RECOVERY_ASSOCIATION_FORWARD
            ? 'forward'
            : association === RECOVERY_ASSOCIATION_INWARD
              ? 'inward'
              : 'outward'
      );
    }

    const mappedFirst = mapPointPosition(root, first, associations[0]);
    const mappedSecond =
      kind === RECOVERY_KIND_RANGE
        ? mapPointPosition(root, second, associations[1])
        : null;
    const firstPoint =
      mappedFirst === null
        ? null
        : targetDocument(root).pointAt(mappedFirst, associations[0]);
    const secondPoint =
      kind === RECOVERY_KIND_RANGE && mappedSecond !== null
        ? targetDocument(root).pointAt(mappedSecond, associations[1])
        : null;

    if (
      mappedFirst === null ||
      !firstPoint ||
      (kind === RECOVERY_KIND_RANGE && (mappedSecond === null || !secondPoint))
    ) {
      values[offset + firstPosition] = RECOVERY_NULL_POSITION;
      values[offset + secondPosition] = RECOVERY_NULL_POSITION;
      continue;
    }

    values[offset + firstPosition] = mappedFirst;
    flags = withRecoverySide(flags, firstSideBit, associations[0]);
    if (kind === RECOVERY_KIND_RANGE) {
      if (mappedSecond === null) {
        throw new Error('Expected mapped range recovery endpoint.');
      }
      values[offset + secondPosition] = mappedSecond;
      flags = withRecoverySide(flags, secondSideBit, associations[1]);
    }
    values[offset + RECOVERY_FLAGS] = flags;
  }

  return Object.freeze({ data: values, roots: recovery.roots });
};

/** Merge the earliest before side with the latest after side by runtime ID. */
export const mergeAnchorHistoryRecovery = (
  previous: AnchorHistoryRecovery | null,
  current: AnchorHistoryRecovery | null,
  anchorCeiling: number
): AnchorHistoryRecovery | null => {
  if (!previous && !current) return null;

  const previousById = new Map<number, number>();
  const currentById = new Map<number, number>();

  for (
    let offset = 0;
    offset < (previous?.data.length ?? 0);
    offset += RECOVERY_RECORD_SIZE
  ) {
    if (!previous) break;
    previousById.set(previous.data[offset + RECOVERY_ID], offset);
  }
  for (
    let offset = 0;
    offset < (current?.data.length ?? 0);
    offset += RECOVERY_RECORD_SIZE
  ) {
    if (!current) break;
    const id = current.data[offset + RECOVERY_ID];

    if (id <= anchorCeiling || previousById.has(id)) {
      currentById.set(id, offset);
    }
  }

  const ids = [
    ...new Set([...previousById.keys(), ...currentById.keys()]),
  ].sort((left, right) => left - right);
  const roots: string[] = [];
  const rootIndexes = new Map<string, number>();
  const data: number[] = [];
  const appendRoot = (root: string) => {
    const found = rootIndexes.get(root);

    if (found !== undefined) return found;
    const index = roots.length;

    roots.push(root);
    rootIndexes.set(root, index);

    return index;
  };

  for (const id of ids) {
    const previousOffset = previousById.get(id);
    const currentOffset = currentById.get(id);
    const beforePacket = previousOffset === undefined ? current : previous;
    const afterPacket = currentOffset === undefined ? previous : current;
    const beforeOffset = previousOffset ?? currentOffset;
    const afterOffset = currentOffset ?? previousOffset;

    if (
      !beforePacket ||
      !afterPacket ||
      beforeOffset === undefined ||
      afterOffset === undefined
    ) {
      throw new Error('Cannot merge incomplete anchor recovery records.');
    }
    const beforeFlags = beforePacket.data[beforeOffset + RECOVERY_FLAGS];
    const afterFlags = afterPacket.data[afterOffset + RECOVERY_FLAGS];
    const beforeRoot =
      beforePacket.roots[beforePacket.data[beforeOffset + RECOVERY_ROOT]];
    const afterRoot =
      afterPacket.roots[afterPacket.data[afterOffset + RECOVERY_ROOT]];

    if (!beforeRoot || beforeRoot !== afterRoot) {
      throw new Error('Cannot merge incompatible anchor recovery roots.');
    }
    const staticMask = ~(
      RECOVERY_BEFORE_A_FORWARD |
      RECOVERY_BEFORE_B_FORWARD |
      RECOVERY_AFTER_A_FORWARD |
      RECOVERY_AFTER_B_FORWARD
    );

    if ((beforeFlags & staticMask) !== (afterFlags & staticMask)) {
      throw new Error('Cannot merge incompatible anchor recovery records.');
    }

    data.push(
      id,
      appendRoot(beforeRoot),
      (beforeFlags & ~(RECOVERY_AFTER_A_FORWARD | RECOVERY_AFTER_B_FORWARD)) |
        (afterFlags & (RECOVERY_AFTER_A_FORWARD | RECOVERY_AFTER_B_FORWARD)),
      beforePacket.data[beforeOffset + RECOVERY_BEFORE_A],
      beforePacket.data[beforeOffset + RECOVERY_BEFORE_B],
      afterPacket.data[afterOffset + RECOVERY_AFTER_A],
      afterPacket.data[afterOffset + RECOVERY_AFTER_B]
    );
  }

  return createAnchorHistoryRecovery(roots, data);
};

export const consumeAnchorHistoryCapture = (commit: EditorCommit) => {
  const capture = COMMIT_ANCHOR_HISTORY.get(commit);

  COMMIT_ANCHOR_HISTORY.delete(commit);

  return capture;
};

export const stageAnchorHistoryRecovery = (
  editor: Editor,
  recovery: AnchorHistoryRecovery | null,
  target: AnchorHistoryRecoveryTarget
) => {
  STAGED_ANCHOR_HISTORY.set(editor, { recovery, target });
};

const applyAnchorChange = (
  state: ActiveAnchorState,
  change: DocumentChange,
  indexedAfter?: ReadonlyMap<string, DocumentIndex>
) => {
  const before = state.value;
  const beforeIndexes = new Map(state.indexes);
  const afterIndexes = new Map(beforeIndexes);
  let { children } = before;
  let roots = before.roots ? { ...before.roots } : undefined;

  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    const next =
      indexedAfter?.get(root) ??
      rootChange.apply(indexRoot(before, beforeIndexes, root));

    afterIndexes.set(root, next);

    if (root === 'main') {
      children = next.value as EditorDocumentValue['children'];
    } else {
      roots ??= {};
      roots[root] = next.value as EditorDocumentValue['children'];
    }
  }

  for (const root of change.createRoots) {
    roots ??= {};
    const index =
      indexedAfter?.get(root) ?? DocumentIndex.fromValue(roots[root] ?? []);

    roots[root] = index.value as EditorDocumentValue['children'];
    afterIndexes.set(root, index);
  }

  for (const root of change.deleteRoots) {
    if (roots) delete roots[root];
    afterIndexes.delete(root);
  }

  if (roots && Object.keys(roots).length === 0) {
    roots = undefined;
  }

  const { roots: _roots, ...withoutRoots } = before;
  const after = Object.freeze(
    roots
      ? { ...withoutRoots, children, roots: Object.freeze(roots) }
      : { ...withoutRoots, children }
  ) as EditorDocumentValue;

  return { after, afterIndexes, before, beforeIndexes };
};

export const subscribeAnchorState = (
  editor: Editor,
  listener: AnchorStateListener,
  getInitialValue: () => EditorDocumentValue
) => {
  const scoped = ANCHOR_SCOPES.get(editor)?.at(-1);
  const state =
    scoped ??
    ACTIVE_ANCHORS.get(editor) ??
    createActiveAnchorState(getInitialValue());
  const runtimeId = scoped
    ? undefined
    : (() => {
        const id = (ANCHOR_RUNTIME_ID.get(editor) ?? 0) + 1;

        if (id > 0x7f_ff_ff_ff) {
          throw new Error('Anchor runtime identity space is exhausted.');
        }
        ANCHOR_RUNTIME_ID.set(editor, id);

        return id;
      })();

  addAnchorListener(state, listener, runtimeId);
  if (!scoped) ACTIVE_ANCHORS.set(editor, state);

  return {
    runtimeId,
    isShadowed() {
      return !scoped && (ANCHOR_SCOPES.get(editor)?.length ?? 0) > 0;
    },
    unsubscribe() {
      removeAnchorListener(state, listener);

      if (!scoped && state.listeners.size === 0) ACTIVE_ANCHORS.delete(editor);
    },
    value: state.value,
  };
};

const addIndexedListeners = (
  target: Set<AnchorStateListener>,
  listeners: ReadonlySet<AnchorStateListener> | undefined
) => {
  for (const listener of listeners ?? []) target.add(listener);
};

const getAffectedAnchorListeners = (
  state: ActiveAnchorState,
  change: DocumentChange,
  commit: EditorCommit | undefined,
  replace: boolean
) => {
  if (!commit) return state.listeners;
  const affected = new Set<AnchorStateListener>();
  const changedRoots = new Set([
    ...[...getInternalDocumentChangeEntries(change)].map(([root]) => root),
    ...change.createRoots,
    ...change.deleteRoots,
  ]);

  for (const root of changedRoots) {
    const resetsRoot =
      replace || change.createRoots.has(root) || change.deleteRoots.has(root);

    if (resetsRoot) {
      addIndexedListeners(affected, state.listenersByRoot.get(root));
      continue;
    }

    const publicRoot = toPublicRoot(root);

    for (const nodeKey of commit.changed.nodeKeys('decoration', publicRoot)) {
      addIndexedListeners(affected, state.listenersByNodeKey.get(nodeKey));
    }
    if (commit.changed.has('structure', publicRoot)) {
      addIndexedListeners(affected, state.fallbackListeners.get(root));
    }
  }

  return affected;
};

export const beginAnchorTransaction = (editor: Editor) => {
  const state = getActiveAnchorState(editor);

  ANCHOR_TRANSACTION_CEILING.set(editor, ANCHOR_RUNTIME_ID.get(editor) ?? 0);
  if (state) {
    state.activeTransaction = new Set();
    state.transactionBeforeValue = state.value;
  }
  recordAnchorStateWork(editor, 'begin', 0);
};

export const notifyAnchorChanges = (
  editor: Editor,
  change: DocumentChange,
  indexedAfter?: ReadonlyMap<string, DocumentIndex>,
  options: Readonly<{ commit?: EditorCommit; replace?: boolean }> = {}
) => {
  const state = getActiveAnchorState(editor);

  if (!state) return;

  const { after, afterIndexes, before, beforeIndexes } = applyAnchorChange(
    state,
    change,
    indexedAfter
  );
  const context = createAnchorChangeContext(
    before,
    after,
    change,
    beforeIndexes,
    afterIndexes,
    options.replace === true,
    options.commit
  );

  state.value = after;
  state.indexes = afterIndexes;

  const listeners = getAffectedAnchorListeners(
    state,
    change,
    options.commit,
    options.replace === true
  );

  recordAnchorStateWork(editor, 'change', listeners.size);
  for (const listener of listeners) {
    if (state.activeTransaction && !state.activeTransaction.has(listener)) {
      listener.begin();
      state.activeTransaction.add(listener);
    }
    listener.change(context);
    indexAnchorListener(state, listener);
  }
};

export const commitAnchorTransaction = (
  editor: Editor,
  value?: EditorDocumentValue,
  commit?: EditorCommit
) => {
  const state = getActiveAnchorState(editor);
  const staged = STAGED_ANCHOR_HISTORY.get(editor);

  STAGED_ANCHOR_HISTORY.delete(editor);

  if (value && state && value !== state.value) {
    state.value = value;
    state.indexes = new Map();
  }

  const listeners = state?.activeTransaction;
  const visitedAnchors = listeners?.size ?? 0;
  let recoveredAnchors = 0;

  if (
    state &&
    listeners &&
    staged?.recovery &&
    commit?.tags.includes('historic')
  ) {
    const { data } = staged.recovery;
    const deferRecovery =
      !commit.changed.hasAny('structure') && !commit.changed.hasAny('replace');
    const restoreMemos = new Map<
      string,
      <T>(position: number, side: -1 | 1, read: () => T) => T
    >();
    const deferredMemoize = <T>(
      _position: number,
      _side: -1 | 1,
      read: () => T
    ) => read();

    for (let offset = 0; offset < data.length; offset += RECOVERY_RECORD_SIZE) {
      const listener = state.listenersByRuntimeId.get(
        data[offset + RECOVERY_ID]
      );

      if (!listener?.history) continue;
      if (deferRecovery) {
        listener.history.restore(
          data,
          offset,
          staged.target,
          state.value,
          deferredMemoize,
          true
        );
        recoveredAnchors += 1;
        continue;
      }
      if (!listeners.has(listener)) {
        listener.begin();
        listeners.add(listener);
      }
      let memoize = restoreMemos.get(listener.root);

      if (!memoize) {
        const values = new Map<number, unknown>();

        memoize = <T>(position: number, side: -1 | 1, read: () => T) => {
          const key = position * 2 + (side === 1 ? 1 : 0);

          if (values.has(key)) return values.get(key) as T;
          const result = read();

          values.set(key, result);

          return result;
        };
        restoreMemos.set(listener.root, memoize);
      }
      if (
        listener.history.restore(
          data,
          offset,
          staged.target,
          state.value,
          memoize,
          false
        )
      ) {
        indexAnchorListener(state, listener);
      }
      listener.commit(value, commit);
      listeners.delete(listener);
      recoveredAnchors += 1;
    }
  }

  const roots: string[] = [];
  const rootIndexes = new Map<string, number>();
  const beforeDocuments = new Map<string, DocumentIndex>();
  const captureMemos = new Map<
    string,
    <T>(
      phase: 'after' | 'before',
      nodeKey: NodeKey | null,
      path: readonly number[],
      pointOffset: number,
      read: () => T
    ) => T
  >();
  const shouldCapture = commit && !commit.tags.includes('historic');
  const recoveryData = new Int32Array(
    shouldCapture && state?.historyListeners
      ? (listeners?.size ?? 0) * RECOVERY_RECORD_SIZE
      : 0
  );
  let recoveryOffset = 0;

  if (state && listeners && shouldCapture && state.transactionBeforeValue) {
    for (const listener of listeners) {
      const id = state.runtimeIds.get(listener);

      if (id === undefined || !listener.history) continue;
      let rootIndex = rootIndexes.get(listener.root);

      if (rootIndex === undefined) {
        rootIndex = roots.length;
        roots.push(listener.root);
        rootIndexes.set(listener.root, rootIndex);
      }
      let memoize = captureMemos.get(listener.root);

      if (!memoize) {
        const phases = {
          after: new Map<NodeKey | readonly number[], Map<number, unknown>>(),
          before: new Map<NodeKey | readonly number[], Map<number, unknown>>(),
        };

        memoize = <T>(
          phase: 'after' | 'before',
          nodeKey: NodeKey | null,
          path: readonly number[],
          pointOffset: number,
          read: () => T
        ) => {
          const values = phases[phase];
          const key = nodeKey ?? path;
          let offsets = values.get(key);

          if (!offsets) {
            offsets = new Map();
            values.set(key, offsets);
          }
          if (offsets.has(pointOffset)) {
            return offsets.get(pointOffset) as T;
          }
          const result = read();

          offsets.set(pointOffset, result);

          return result;
        };
        captureMemos.set(listener.root, memoize);
      }
      const captured = listener.history.capture(
        recoveryData,
        recoveryOffset,
        id,
        rootIndex,
        indexRoot(state.transactionBeforeValue, beforeDocuments, listener.root),
        indexRoot(state.value, state.indexes, listener.root),
        memoize
      );
      if (captured) recoveryOffset += RECOVERY_RECORD_SIZE;
    }
  }

  const recovery = createAnchorHistoryRecovery(
    roots,
    recoveryOffset === recoveryData.length
      ? recoveryData
      : recoveryData.slice(0, recoveryOffset)
  );
  const anchorCeiling =
    ANCHOR_TRANSACTION_CEILING.get(editor) ??
    ANCHOR_RUNTIME_ID.get(editor) ??
    0;

  ANCHOR_TRANSACTION_CEILING.delete(editor);
  if (commit && shouldCapture) {
    COMMIT_ANCHOR_HISTORY.set(
      commit,
      Object.freeze({ anchorCeiling, recovery })
    );
  }

  recordAnchorStateWork(
    editor,
    'commit',
    visitedAnchors,
    recovery ? recovery.data.length / RECOVERY_RECORD_SIZE : recoveredAnchors,
    recovery?.data.byteLength ?? staged?.recovery?.data.byteLength ?? 0
  );
  for (const listener of listeners ?? []) {
    listener.commit(value, commit);
  }
  if (state) {
    state.activeTransaction = null;
    state.transactionBeforeValue = null;
  }
};

export const discardAnchorTransaction = (
  editor: Editor,
  value: EditorDocumentValue
) => {
  const state = getActiveAnchorState(editor);

  if (state) {
    state.value = value;
    state.indexes = new Map();
    state.transactionBeforeValue = null;
  }

  ANCHOR_TRANSACTION_CEILING.delete(editor);
  STAGED_ANCHOR_HISTORY.delete(editor);

  const listeners = state?.activeTransaction ?? state?.listeners;

  recordAnchorStateWork(editor, 'discard', listeners?.size ?? 0);
  for (const listener of listeners ?? []) {
    listener.discard(value);
  }
  if (state) state.activeTransaction = null;
};
