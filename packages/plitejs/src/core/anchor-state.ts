import type {
  AnyEditor as Editor,
  EditorCommit,
  EditorDocumentValue,
  NodeKey,
} from '../interfaces/editor';
import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
} from './change/document-change';
import { DocumentIndex } from './change/document-index';
import type { JsonEditorValue } from './change/tokens';
import { toPublicRoot } from './public-root';

export type AnchorStateListener = {
  begin: () => void;
  change: (context: AnchorChangeContext) => void;
  commit: (value?: EditorDocumentValue, commit?: EditorCommit) => void;
  discard: (value: EditorDocumentValue) => void;
  fallback: () => boolean;
  nodeKeys: () => readonly NodeKey[];
  root: string;
};

export type AnchorChangeContext = Readonly<{
  after: EditorDocumentValue;
  before: EditorDocumentValue;
  change: DocumentChange;
  afterRoot: (root: string) => DocumentIndex;
  beforeRoot: (root: string) => DocumentIndex;
  memoize: <T>(key: string, read: () => T) => T;
  replace: boolean;
}>;

export type AnchorStateWork = Readonly<{
  phase: 'begin' | 'change' | 'commit' | 'discard';
  visitedAnchors: number;
}>;

type ActiveAnchorState = {
  activeTransaction: Set<AnchorStateListener> | null;
  fallbackListeners: Map<string, Set<AnchorStateListener>>;
  indexes: Map<string, DocumentIndex>;
  listenerNodeKeys: Map<AnchorStateListener, readonly NodeKey[]>;
  listeners: Set<AnchorStateListener>;
  listenersByNodeKey: Map<NodeKey, Set<AnchorStateListener>>;
  listenersByRoot: Map<string, Set<AnchorStateListener>>;
  value: EditorDocumentValue;
};

const ACTIVE_ANCHORS = new WeakMap<Editor, ActiveAnchorState>();
const ANCHOR_SCOPES = new WeakMap<Editor, ActiveAnchorState[]>();
const ANCHOR_STATE_WORK_OBSERVERS = new WeakMap<
  Editor,
  (work: AnchorStateWork) => void
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
  visitedAnchors: number
) => {
  ANCHOR_STATE_WORK_OBSERVERS.get(editor)?.({ phase, visitedAnchors });
};

const getActiveAnchorState = (editor: Editor) =>
  ANCHOR_SCOPES.get(editor)?.at(-1) ?? ACTIVE_ANCHORS.get(editor);

const createActiveAnchorState = (
  value: EditorDocumentValue
): ActiveAnchorState => ({
  activeTransaction: null,
  fallbackListeners: new Map(),
  indexes: new Map(),
  listenerNodeKeys: new Map(),
  listeners: new Set(),
  listenersByNodeKey: new Map(),
  listenersByRoot: new Map(),
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
  unindexAnchorListener(state, listener);
  const nodeKeys = Object.freeze([...new Set(listener.nodeKeys())]);

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
  listener: AnchorStateListener
) => {
  state.listeners.add(listener);
  addToIndex(state.listenersByRoot, listener.root, listener);
  indexAnchorListener(state, listener);
};

const removeAnchorListener = (
  state: ActiveAnchorState,
  listener: AnchorStateListener
) => {
  state.activeTransaction?.delete(listener);
  state.listeners.delete(listener);
  removeFromIndex(state.listenersByRoot, listener.root, listener);
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
  replace: boolean
): AnchorChangeContext => {
  const memo = new Map<string, unknown>();

  return {
    after,
    afterRoot: (root) => indexRoot(after, afterIndexes, root),
    before,
    beforeRoot: (root) => indexRoot(before, beforeIndexes, root),
    change,
    memoize: <T>(key: string, read: () => T) => {
      if (memo.has(key)) return memo.get(key) as T;
      const value = read();

      memo.set(key, value);
      return value;
    },
    replace,
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

  addAnchorListener(state, listener);
  if (!scoped) ACTIVE_ANCHORS.set(editor, state);

  return {
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

    for (const nodeKey of commit.changed.nodeKeys('projection', publicRoot)) {
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

  if (state) state.activeTransaction = new Set();
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
    options.replace === true
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

  if (value && state && value !== state.value) {
    state.value = value;
    state.indexes = new Map();
  }

  const listeners = state?.activeTransaction;

  recordAnchorStateWork(editor, 'commit', listeners?.size ?? 0);
  for (const listener of listeners ?? []) {
    listener.commit(value, commit);
  }
  if (state) state.activeTransaction = null;
};

export const discardAnchorTransaction = (
  editor: Editor,
  value: EditorDocumentValue
) => {
  const state = getActiveAnchorState(editor);

  if (state) {
    state.value = value;
    state.indexes = new Map();
  }

  const listeners = state?.activeTransaction ?? state?.listeners;

  recordAnchorStateWork(editor, 'discard', listeners?.size ?? 0);
  for (const listener of listeners ?? []) {
    listener.discard(value);
  }
  if (state) state.activeTransaction = null;
};
