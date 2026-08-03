import type {
  AnyEditor as Editor,
  EditorCommit,
  EditorDocumentValue,
} from '../interfaces/editor';
import {
  type DocumentChange,
  getInternalDocumentChangeEntries,
} from './change/document-change';
import { DocumentIndex } from './change/document-index';
import type { JsonEditorValue } from './change/tokens';

export type AnchorStateListener = {
  begin: () => void;
  change: (context: AnchorChangeContext) => void;
  commit: (value?: EditorDocumentValue, commit?: EditorCommit) => void;
  discard: (value: EditorDocumentValue) => void;
};

export type AnchorChangeContext = Readonly<{
  after: EditorDocumentValue;
  before: EditorDocumentValue;
  change: DocumentChange;
  afterRoot: (root: string) => DocumentIndex;
  beforeRoot: (root: string) => DocumentIndex;
  replace: boolean;
}>;

type ActiveAnchorState = {
  indexes: Map<string, DocumentIndex>;
  listeners: Set<AnchorStateListener>;
  value: EditorDocumentValue;
};

const ACTIVE_ANCHORS = new WeakMap<Editor, ActiveAnchorState>();
const ANCHOR_SCOPES = new WeakMap<Editor, ActiveAnchorState[]>();

const getActiveAnchorState = (editor: Editor) =>
  ANCHOR_SCOPES.get(editor)?.at(-1) ?? ACTIVE_ANCHORS.get(editor);

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
  const state: ActiveAnchorState = {
    indexes: new Map(),
    listeners: new Set(),
    value,
  };

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
    index = DocumentIndex.fromValue(rootNodes(value as JsonEditorValue, root));
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
): AnchorChangeContext => ({
  after,
  afterRoot: (root) => indexRoot(after, afterIndexes, root),
  before,
  beforeRoot: (root) => indexRoot(before, beforeIndexes, root),
  change,
  replace,
});

const applyAnchorChange = (
  state: ActiveAnchorState,
  change: DocumentChange,
  indexedAfter?: ReadonlyMap<string, DocumentIndex>
) => {
  const before = state.value;
  const beforeIndexes = new Map(state.indexes);
  const afterIndexes = new Map(beforeIndexes);
  let children = before.children;
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
    ({
      indexes: new Map(),
      listeners: new Set(),
      value: getInitialValue(),
    } satisfies ActiveAnchorState);

  state.listeners.add(listener);
  if (!scoped) ACTIVE_ANCHORS.set(editor, state);

  return {
    isShadowed() {
      return !scoped && (ANCHOR_SCOPES.get(editor)?.length ?? 0) > 0;
    },
    unsubscribe() {
      state.listeners.delete(listener);

      if (!scoped && state.listeners.size === 0) ACTIVE_ANCHORS.delete(editor);
    },
    value: state.value,
  };
};

export const beginAnchorTransaction = (editor: Editor) => {
  for (const listener of getActiveAnchorState(editor)?.listeners ?? []) {
    listener.begin();
  }
};

export const notifyAnchorChanges = (
  editor: Editor,
  change: DocumentChange,
  indexedAfter?: ReadonlyMap<string, DocumentIndex>,
  options: Readonly<{ replace?: boolean }> = {}
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

  for (const listener of state.listeners) {
    listener.change(context);
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

  for (const listener of state?.listeners ?? []) {
    listener.commit(value, commit);
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
  }

  for (const listener of state?.listeners ?? []) {
    listener.discard(value);
  }
};
