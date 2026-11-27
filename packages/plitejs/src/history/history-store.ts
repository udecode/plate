import type { Editor, EditorSchemaIdentity, Value } from '..';
import { getEditorRuntimeOwner } from '../core/editor-runtime';
import { reportEditorLifecycleError } from '../core/lifecycle-error';
import type { AnyEditor } from '../interfaces/editor';
import type { History } from './history';

export type CrossingDrop = Readonly<{
  cause: unknown;
  direction: 'redo' | 'undo';
  editor: AnyEditor;
}>;

export type DropSink = CrossingDrop[];

type BranchWithDepth = Readonly<{ depth: number }>;

export type HistoryStoreBase<
  V extends Value,
  Branch extends BranchWithDepth,
  PendingReplay,
> = Readonly<{
  crossingDrops: number;
  maxDepth: number;
  pendingReplay: PendingReplay | null;
  /** The steps whose running first writes keep `redos` listed but frozen. */
  redoFreeze: Readonly<{ steps: readonly object[] }> | null;
  redos: Branch | null;
  revision: number;
  schema: EditorSchemaIdentity;
  snapshot: History<V> | null;
  undos: Branch | null;
  unreportedDrops: readonly CrossingDrop[];
}>;

type AnyStore = HistoryStoreBase<Value, BranchWithDepth, unknown>;

const HISTORY = new WeakMap<AnyEditor, AnyStore>();
const HISTORY_DRAFTS = new WeakMap<
  AnyEditor,
  Array<{ state: AnyStore | undefined }>
>();
const PUBLISHED_HISTORY_READ_DEPTH = new WeakMap<AnyEditor, number>();

export const NO_DROPS: readonly CrossingDrop[] = Object.freeze([]);

export const withDrops = <S extends AnyStore>(
  store: S,
  drops: readonly CrossingDrop[]
): S =>
  drops.length === 0
    ? store
    : Object.freeze({
        ...store,
        crossingDrops: store.crossingDrops + drops.length,
        unreportedDrops: [...store.unreportedDrops, ...drops],
      });

const holdStore = (owner: AnyEditor, store: AnyStore) => {
  const { unreportedDrops } = store;

  HISTORY.set(
    owner,
    unreportedDrops.length === 0
      ? store
      : Object.freeze({ ...store, unreportedDrops: NO_DROPS })
  );
  for (const { cause, direction, editor } of unreportedDrops) {
    reportEditorLifecycleError({
      cause,
      direction,
      editor,
      phase: 'replay',
      source: 'history',
    });
  }
};

const getHistoryDraft = (editor: AnyEditor) => {
  const owner = getEditorRuntimeOwner(editor);

  if ((PUBLISHED_HISTORY_READ_DEPTH.get(owner) ?? 0) > 0) return undefined;

  return HISTORY_DRAFTS.get(owner)?.at(-1);
};

export const withHistoryStateDraft = <T, S extends AnyStore = AnyStore>(
  editor: AnyEditor,
  state: S | undefined,
  fn: () => T
) => {
  const owner = getEditorRuntimeOwner(editor);
  const drafts = HISTORY_DRAFTS.get(owner) ?? [];
  const draft = { state: state as AnyStore | undefined };

  drafts.push(draft);
  HISTORY_DRAFTS.set(owner, drafts);

  try {
    return { result: fn(), state: draft.state as S | undefined } as const;
  } finally {
    drafts.pop();
    if (drafts.length === 0) HISTORY_DRAFTS.delete(owner);
  }
};

export const withPublishedHistoryState = <T>(
  editor: AnyEditor,
  fn: () => T
): T => {
  const owner = getEditorRuntimeOwner(editor);
  const depth = PUBLISHED_HISTORY_READ_DEPTH.get(owner) ?? 0;

  PUBLISHED_HISTORY_READ_DEPTH.set(owner, depth + 1);
  try {
    return fn();
  } finally {
    if (depth === 0) PUBLISHED_HISTORY_READ_DEPTH.delete(owner);
    else PUBLISHED_HISTORY_READ_DEPTH.set(owner, depth);
  }
};

export const captureHistoryState = <
  V extends Value,
  Branch extends BranchWithDepth,
  PendingReplay,
>(
  editor: AnyEditor
) => {
  const draft = getHistoryDraft(editor);

  return (draft ? draft.state : HISTORY.get(getEditorRuntimeOwner(editor))) as
    | HistoryStoreBase<V, Branch, PendingReplay>
    | undefined;
};

export const restoreHistoryState = (
  editor: AnyEditor,
  state: AnyStore | undefined
) => {
  const owner = getEditorRuntimeOwner(editor);
  const draft = getHistoryDraft(owner);

  if (draft) {
    draft.state = state;
    return;
  }
  if (state) holdStore(owner, state);
  else HISTORY.delete(owner);
};

export const deleteHistoryStore = (editor: AnyEditor) => {
  HISTORY.delete(getEditorRuntimeOwner(editor));
};

const createStore = <
  V extends Value,
  Branch extends BranchWithDepth,
  PendingReplay,
>(
  editor: Editor<V>
): HistoryStoreBase<V, Branch, PendingReplay> => ({
  crossingDrops: 0,
  maxDepth: 100,
  pendingReplay: null,
  redoFreeze: null,
  redos: null,
  revision: 0,
  schema: editor.read.schema.identity(),
  snapshot: null,
  undos: null,
  unreportedDrops: NO_DROPS,
});

export const getStore = <
  V extends Value,
  Branch extends BranchWithDepth,
  PendingReplay,
>(
  editor: Editor<V>
): HistoryStoreBase<V, Branch, PendingReplay> => {
  const owner = getEditorRuntimeOwner(editor);
  const draft = getHistoryDraft(owner);
  let store = (draft ? draft.state : HISTORY.get(owner)) as
    | HistoryStoreBase<V, Branch, PendingReplay>
    | undefined;

  if (!store) {
    store = createStore(editor);
    if (draft) draft.state = store;
    else HISTORY.set(owner, store);
  }

  return store;
};

/** Write the store; a freeze never outlives the redo list it froze. */
export const setStore = <
  V extends Value,
  Branch extends BranchWithDepth,
  PendingReplay,
>(
  editor: Editor<V>,
  value: HistoryStoreBase<V, Branch, PendingReplay>
) => {
  const owner = getEditorRuntimeOwner(editor);
  const draft = getHistoryDraft(owner);
  const store =
    value.redos || !value.redoFreeze
      ? value
      : Object.freeze({ ...value, redoFreeze: null });

  if (draft) {
    draft.state = store;
    return;
  }
  holdStore(owner, store);
};

export const publishStore = <
  V extends Value,
  Branch extends BranchWithDepth,
  PendingReplay,
>(
  editor: Editor<V>,
  store: HistoryStoreBase<V, Branch, PendingReplay>,
  patch: Partial<
    Omit<HistoryStoreBase<V, Branch, PendingReplay>, 'revision' | 'snapshot'>
  >
) => {
  const next = Object.freeze({
    ...store,
    ...patch,
    revision: store.revision + 1,
    snapshot: null,
  });

  setStore(editor, next);

  return next;
};
