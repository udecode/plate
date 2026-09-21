import type {
  AnyEditor as Editor,
  EditorCommit,
  EditorDocumentValue,
  EditorEffect,
  EditorUpdateTransaction,
  EditorViewOptions,
  EditorEffectType,
  EditorTransactionSpecBuilder,
  EditorUpdateTag,
  Selection,
  ContentSlice,
  Value,
  NodeKey,
} from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import type { AnchorOptions } from './anchor';
import type { DocumentChange } from './change/document-change';
import { getEditorRuntimeOwner } from './editor-runtime';

export type NativeAuthoredTransaction = {
  finish: (
    input: Readonly<{
      after: EditorDocumentValue;
      before: EditorDocumentValue;
      change: DocumentChange;
      discardedNodeKeys: ReadonlySet<NodeKey>;
      steps: readonly DocumentChange[];
      selectionWritten: boolean;
      tx: EditorUpdateTransaction;
    }>
  ) => void;
  prepare?: (commit: EditorCommit) => void;
  publish?: (commit: EditorCommit) => void;
  close: (commit: EditorCommit | null, failed: boolean) => void;
};

export type NativeAuthoredRangeBinding = {
  deleted: () => boolean;
  resolve: (view?: Editor) => Range | null;
  serialize: () => unknown;
};

export type NativeAuthoredFragment = Readonly<{
  authorId: string;
  changeId: string;
  id: string;
  placement:
    | Readonly<{ index: number; kind: 'children'; path: Path }>
    | Readonly<{ kind: 'text'; point: Point }>
    | null;
  root: string;
}> &
  (
    | Readonly<{
        kind: 'delete' | 'move';
        range: Range | null;
        slice: ContentSlice;
      }>
    | Readonly<{
        after: Readonly<Record<string, unknown>>;
        before: Readonly<Record<string, unknown>>;
        kind: 'properties';
        nodeKind: 'element' | 'text';
        path: Path;
      }>
  );

export type NativeAuthoredFragmentSlot = Readonly<{
  changeId: string;
  id: string;
  side: 'before' | 'after' | 'children' | 'text' | 'properties' | 'structure';
}>;

export type NativeAuthoredRenderSegment = Readonly<{
  changeId: string | null;
  childIndex: number;
  fragment: Exclude<NativeAuthoredFragment, { kind: 'properties' }> | null;
  key: string;
  node: Descendant;
  nodeKey: NodeKey;
  path: Path;
}> &
  (
    | Readonly<{
        children: readonly NativeAuthoredRenderSegment[];
        kind: 'element';
      }>
    | Readonly<{ end: number; kind: 'text'; start: number }>
  );

type NativeAuthoredRuntime = {
  view: (view: Editor) => NonNullable<EditorViewOptions['authored']>;
  fragmentVersion: (view: Editor) => object | null;
  subscribeFragment: (
    view: Editor,
    listener: (commit: EditorCommit) => void
  ) => (() => void) | undefined;
  fragmentSlots: (
    view: Editor,
    nodeKey?: NodeKey,
    root?: string
  ) => readonly NativeAuthoredFragmentSlot[];
  renderSegments: (
    view: Editor,
    children: readonly Descendant[],
    root: string,
    scope: Path
  ) => readonly NativeAuthoredRenderSegment[];
  subscribeFragmentSlots: (
    view: Editor,
    nodeKey: NodeKey | undefined,
    listener: () => void
  ) => () => void;
  fragmentView: <V extends Value>(
    view: Editor<V>
  ) => Readonly<{ fragment: NativeAuthoredFragment; parent: Editor }> | null;
  bindFragment: (
    view: Editor,
    parent: Editor,
    fragment: NativeAuthoredFragment,
    requireMarkupParent: boolean
  ) => void;
  updateFragment: (
    view: Editor,
    update: (tx: EditorTransactionSpecBuilder) => void,
    options?: { tags?: readonly EditorUpdateTag[] }
  ) => { changed: boolean; fragmentId: string; selection: Selection } | null;
  path: (
    view: Editor,
    path: Path,
    options: AnchorOptions<Path>
  ) =>
    | {
        deleted: () => boolean;
        resolve: (view?: Editor) => Path | null;
      }
    | undefined;
  range: (
    view: Editor,
    input: (
      | Readonly<{ range: Range; options: AnchorOptions<Range> }>
      | Readonly<{ saved: unknown; options: AnchorOptions<Range> }>
    ) &
      Readonly<{ projection?: 'accepted' | 'proposed' }>
  ) => NativeAuthoredRangeBinding | undefined;
  compositionChanged: (view: Editor, composing: boolean) => void;
  fragments: (
    view: Editor,
    changeId: string
  ) => readonly NativeAuthoredFragment[];
  historyEffect: EditorEffectType;
  operationEffect: EditorEffectType;
  beforeValue: (commit: EditorCommit) => EditorDocumentValue | undefined;
  inputView: (commit: EditorCommit) => Editor | null;
  inputProjection: (commit: EditorCommit) => 'accepted' | 'proposed';
  projectedChange: (commit: EditorCommit) => DocumentChange;
  readView: <T>(view: Editor, read: () => T) => T;
  replace: <T>(apply: () => T) => T;
  setView: (
    view: Editor,
    value: NonNullable<EditorViewOptions['authored']>
  ) => void;
  updateView: (view: Editor) => void;
  viewCommit: (view: Editor, commit: EditorCommit) => EditorCommit;
  beforeEffect: (effect: EditorEffect) => boolean;
  begin: () => NativeAuthoredTransaction;
  history: (commit: EditorCommit) =>
    | Readonly<{
        effects: readonly EditorEffect[];
        grouping: Readonly<{ commit: EditorCommit; scope: object }>;
      }>
    | undefined;
  historyConflict: (error: unknown) => readonly string[] | null;
  mergeHistory: (
    current: readonly EditorEffect[],
    previous: readonly EditorEffect[]
  ) => boolean;
  initialize: () => void;
};

const AUTHORED_RUNTIMES = new WeakMap<Editor, NativeAuthoredRuntime>();
const HISTORY_EFFECTS = new WeakSet<EditorEffectType>();
export const isAuthoredHistoryEffect = (effect: EditorEffect) =>
  HISTORY_EFFECTS.has(effect.type);
const UPDATE_VIEWS = new WeakMap<Editor, Editor>();
export const readAuthoredView = (view: Editor) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view))?.view(view);
export const getAuthoredCommitBefore = (editor: Editor, commit: EditorCommit) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor))?.beforeValue(commit);
export const getAuthoredCommitView = (editor: Editor, commit: EditorCommit) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor))?.inputView(commit) ??
  editor;
export const getAuthoredCommitProjection = (
  editor: Editor,
  commit: EditorCommit
) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor))?.inputProjection(commit);
export const getAuthoredProjectedChange = (
  editor: Editor,
  commit: EditorCommit
) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor))?.projectedChange(
    commit
  ) ?? commit.changes;
export const isAuthoredOperationEffect = (
  editor: Editor,
  effect: EditorEffect
) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor))?.operationEffect ===
  effect.type;
export const readAuthoredViewFragmentVersion = (view: Editor) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view))?.fragmentVersion(view) ??
  null;
const EMPTY_FRAGMENTS: readonly NativeAuthoredFragment[] = Object.freeze([]);
export const EMPTY_AUTHORED_FRAGMENT_SLOTS: readonly NativeAuthoredFragmentSlot[] =
  Object.freeze([]);

export const readAuthoredViewFragmentSlots = (
  view: Editor,
  nodeKey?: NodeKey,
  root?: string
) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view))?.fragmentSlots(
    view,
    nodeKey,
    root
  ) ?? EMPTY_AUTHORED_FRAGMENT_SLOTS;

export const readAuthoredViewRenderSegments = (
  view: Editor,
  children: readonly Descendant[],
  root: string,
  scope: Path
) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view))?.renderSegments(
    view,
    children,
    root,
    scope
  ) ?? [];

export const subscribeAuthoredViewFragmentSlots = (
  view: Editor,
  nodeKey: NodeKey | undefined,
  listener: () => void
) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view))?.subscribeFragmentSlots(
    view,
    nodeKey,
    listener
  ) ?? (() => {});

export const bindAuthoredFragmentView = (
  view: Editor,
  parent: Editor,
  fragment: NativeAuthoredFragment,
  options: Readonly<{
    retainWhile?: 'document' | 'parent-markup';
  }> = {}
) => {
  const installed = AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view));
  if (!installed) throw new Error('Authored changes are not installed.');
  installed.bindFragment(
    view,
    parent,
    fragment,
    options.retainWhile !== 'document'
  );
};

export const readAuthoredFragmentView = <V extends Value>(view: Editor<V>) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view))?.fragmentView(view) ??
  null;

/** Evaluate normal transforms in a retained deletion without changing either document projection. */
export const updateAuthoredFragment = (
  view: Editor,
  update: (tx: EditorTransactionSpecBuilder) => void,
  options?: { tags?: readonly EditorUpdateTag[] }
) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view))?.updateFragment(
    view,
    update,
    options
  ) ?? null;

export const subscribeAuthoredFragment = <V extends Value>(
  view: Editor,
  listener: (commit: EditorCommit<V>) => void
) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view))?.subscribeFragment(
    view,
    (commit) => listener(commit as EditorCommit<V>)
  );

export const readAuthoredViewFragments = (view: Editor, changeId: string) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view))?.fragments(
    view,
    changeId
  ) ?? EMPTY_FRAGMENTS;

export const bindAuthoredPath = (
  editor: Editor,
  path: Path,
  options: AnchorOptions<Path>
) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor))?.path(
    editor,
    path,
    options
  );

export const bindAuthoredRange = (
  editor: Editor,
  input: Parameters<NativeAuthoredRuntime['range']>[1]
) => {
  const installed = AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor));
  if (!installed && 'saved' in input) {
    throw new Error(
      'Install authored changes before restoring an authored range.'
    );
  }
  return installed?.range(editor, input);
};

/** Project a proposed-coordinate range into an authored document projection. */
export const projectAuthoredRange = (
  editor: Editor,
  range: Range,
  projection: 'accepted' | 'proposed'
): Range | null => {
  const installed = AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor));

  if (!installed || projection === 'proposed') return range;
  const options: AnchorOptions<Range> = {
    association: 'inward',
    deletion: 'drop',
    ...(range.anchor.root && range.anchor.root !== 'main'
      ? { root: range.anchor.root }
      : {}),
  };
  const source = installed.range(editor, {
    options,
    projection: 'proposed',
    range,
  });

  if (!source) return null;
  const target = installed.range(editor, {
    options,
    projection,
    saved: source.serialize(),
  });

  return target?.resolve() ?? null;
};

export const updateAuthoredComposition = (view: Editor, composing: boolean) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view))?.compositionChanged(
    view,
    composing
  );

export const withAuthoredViewRead = <T>(
  source: Editor,
  view: Editor,
  read: () => T
): T => {
  const installed = AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(source));
  return installed ? installed.readView(view, read) : read();
};

export const configureAuthoredView = (
  view: Editor,
  value?: NonNullable<EditorViewOptions['authored']>
) => {
  const installed = AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view));
  if (!installed) {
    if (value) throw new Error('Authored changes are not installed.');
    return;
  }
  installed.setView(view, value ?? { intent: 'edit', projection: 'accepted' });
};

export const withAuthoredUpdateView = <T>(
  source: Editor,
  view: Editor,
  update: () => T
): T => {
  const owner = getEditorRuntimeOwner(source);
  const previous = UPDATE_VIEWS.get(owner);
  UPDATE_VIEWS.set(owner, view);
  try {
    return update();
  } finally {
    if (previous) UPDATE_VIEWS.set(owner, previous);
    else UPDATE_VIEWS.delete(owner);
  }
};

export const prepareAuthoredViewUpdate = (editor: Editor) => {
  const owner = getEditorRuntimeOwner(editor);
  AUTHORED_RUNTIMES.get(owner)?.updateView(UPDATE_VIEWS.get(owner) ?? editor);
};

export const getAuthoredViewCommit = <V extends Value>(
  view: Editor,
  commit: EditorCommit<V>
): EditorCommit<V> =>
  (AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(view))?.viewCommit(
    view,
    commit
  ) ?? commit) as EditorCommit<V>;

export const registerAuthoredRuntime = (
  editor: Editor,
  runtime: NativeAuthoredRuntime
) => {
  const owner = getEditorRuntimeOwner(editor);
  const previous = AUTHORED_RUNTIMES.get(owner);
  AUTHORED_RUNTIMES.set(owner, runtime);
  HISTORY_EFFECTS.add(runtime.historyEffect);
  return (rollback: boolean) => {
    if (AUTHORED_RUNTIMES.get(owner) !== runtime) return;
    if (rollback && previous) AUTHORED_RUNTIMES.set(owner, previous);
    else AUTHORED_RUNTIMES.delete(owner);
  };
};

export const beginAuthoredTransaction = (editor: Editor) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor))?.begin();

export const initializeAuthoredDocument = (editor: Editor) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor))?.initialize();

export const withAuthoredDocumentReplacement = <T>(
  editor: Editor,
  apply: () => T
): T => {
  const installed = AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor));
  return installed ? installed.replace(apply) : apply();
};

export const shouldEmitAuthoredEffect = (
  editor: Editor,
  effect: EditorEffect
) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor))?.beforeEffect(effect) ??
  true;

export const captureAuthoredHistory = (editor: Editor, commit: EditorCommit) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor))?.history(commit);

export const getAuthoredHistoryConflicts = (
  editor: Editor,
  error: unknown
): readonly string[] | null =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor))?.historyConflict(
    error
  ) ?? null;

export const canMergeAuthoredHistory = (
  editor: Editor,
  current: readonly EditorEffect[],
  previous: readonly EditorEffect[]
) =>
  AUTHORED_RUNTIMES.get(getEditorRuntimeOwner(editor))?.mergeHistory(
    current,
    previous
  ) ?? false;
