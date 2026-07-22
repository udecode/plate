import type {
  Ancestor,
  Descendant,
  DescendantIn,
  Location,
  Node,
  NodeEntry,
  Path,
  Point,
  Text,
} from '../interfaces';
import type {
  BaseEditor,
  Editor,
  EditorAboveOptions,
  EditorCommit,
  EditorCommitListener,
  EditorCommitSource,
  EditorCommandDispatch,
  EditorExtension,
  EditorExtensionInput,
  EditorExtensionReconfigureOptions,
  EditorDocumentValue,
  EditorLeafOptions,
  EditorLevelsOptions,
  EditorNextOptions,
  EditorPointOptions,
  EditorPreviousOptions,
  EditorSnapshot,
  EditorStateView,
  EditorStaticApi,
  EditorUpdateContext,
  EditorUpdateTransaction,
  RootKey,
  RuntimeId,
  Selection,
  SnapshotListener,
  Value,
} from '../interfaces/editor';
import type { InternalEditorSchemaApi } from './editor-schema';
import type { DocumentChange } from './document-change';
import type { InternalEditorUpdateOptions } from './update-policy';

type BindEditorMethod<T> = T extends (
  editor: Editor,
  ...args: infer Args
) => infer Result
  ? (...args: Args) => Result
  : never;

type RuntimeMethods<TKey extends keyof EditorStaticApi> = {
  [Key in TKey]: BindEditorMethod<EditorStaticApi[Key]>;
};

export type InternalEditorQueryRuntime = RuntimeMethods<
  | 'after'
  | 'before'
  | 'edges'
  | 'elementReadOnly'
  | 'first'
  | 'fragment'
  | 'hasBlocks'
  | 'hasInlines'
  | 'hasPath'
  | 'hasTexts'
  | 'isBlock'
  | 'isEdge'
  | 'isEmpty'
  | 'isEnd'
  | 'isStart'
  | 'last'
  | 'parent'
  | 'path'
  | 'positions'
  | 'projectRange'
  | 'range'
  | 'shouldMergeNodesRemovePrevNode'
  | 'string'
  | 'unhangRange'
  | 'void'
> & {
  above: <T extends Ancestor>(
    options?: EditorAboveOptions<T>
  ) => NodeEntry<T> | undefined;
  leaf: (at: Location, options?: EditorLeafOptions) => NodeEntry<Text>;
  levels: <T extends Node>(
    options?: EditorLevelsOptions<T>
  ) => Generator<NodeEntry<T>, void, undefined>;
  next: <T extends Descendant>(
    options?: EditorNextOptions<T>
  ) => NodeEntry<T> | undefined;
  point: (at: Location, options?: EditorPointOptions) => Point;
  previous: <T extends Node>(
    options?: EditorPreviousOptions<T>
  ) => NodeEntry<T> | undefined;
};

export type InternalEditorSnapshotRuntime<V extends Value = Value> = {
  getChildren: () => V;
  getFragment: () => DescendantIn<V>[];
  getLastCommit: () => EditorCommit<V> | null;
  getPathByRuntimeId: (runtimeId: RuntimeId) => Path | null;
  getRuntimeId: (path: Path) => RuntimeId | null;
  getSelection: () => Selection;
  getSnapshot: () => EditorSnapshot<V>;
};

export type InternalEditorTransactionRuntime<V extends Value = Value> = {
  read: <T>(fn: (state: EditorStateView<V>) => T) => T;
  runCommand: EditorCommandDispatch;
  subscribe: (listener: SnapshotListener<V>) => () => void;
  subscribeCommit: (listener: EditorCommitListener<V>) => () => void;
  subscribeSource: (
    source: EditorCommitSource,
    listener: SnapshotListener<V>
  ) => () => void;
  update: (
    fn: (
      transaction: EditorUpdateTransaction<V>,
      context: EditorUpdateContext<Editor<V>>
    ) => void,
    options?: InternalEditorUpdateOptions
  ) => void;
};

export type InternalEditorExtensionRuntime<V extends Value = Value> = {
  extend: (
    extension: EditorExtensionInput<Editor<V>>,
    options?: EditorExtensionReconfigureOptions
  ) => () => void;
  prepareExtensionPublication: (
    entries: readonly InternalEditorExtensionPublicationEntry[],
    options?: EditorExtensionReconfigureOptions
  ) => Readonly<{
    cleanup: () => void;
    commit: () => void;
    configurationChanged: boolean;
    documentChange: DocumentChange;
    finalize: () => void;
    ready: () => void;
    rollback: () => void;
    stage: () => void;
    validateDocument: (value: EditorDocumentValue) => void;
  }>;
  schema: InternalEditorSchemaApi<V>;
};

export type InternalEditorExtensionPublicationEntry = Readonly<{
  editor?: Editor;
  extension: EditorExtension<any, any>;
}>;

export type InternalEditorRuntime<V extends Value = Value> =
  InternalEditorExtensionRuntime<V> &
    InternalEditorQueryRuntime &
    InternalEditorSnapshotRuntime<V> &
    InternalEditorTransactionRuntime<V>;

const EDITOR_RUNTIME = new WeakMap<Editor, InternalEditorRuntime>();
const EDITOR_RUNTIME_OWNER = new WeakMap<Editor, Editor>();
const EDITOR_RUNTIME_ROOT = new WeakMap<Editor, RootKey>();

export const setEditorRuntime = <V extends Value>(
  editor: Editor<V>,
  runtime: InternalEditorRuntime<V>,
  owner: Editor = editor,
  root: RootKey = 'main'
) => {
  EDITOR_RUNTIME.set(editor, runtime as unknown as InternalEditorRuntime);
  EDITOR_RUNTIME_OWNER.set(editor, owner);
  EDITOR_RUNTIME_ROOT.set(editor, root);
};

export const hasEditorRuntime = (value: unknown): value is Editor =>
  typeof value === 'object' &&
  value !== null &&
  EDITOR_RUNTIME.has(value as Editor);

export const getEditorRuntime = <V extends Value = Value>(
  editor: Editor<V>
): InternalEditorRuntime<V> => {
  const runtime = EDITOR_RUNTIME.get(editor);

  if (!runtime) {
    throw new Error('Editor runtime has not been initialized');
  }

  return runtime as unknown as InternalEditorRuntime<V>;
};

export const getEditorRuntimeOwner = <TEditor extends BaseEditor<any, any>>(
  editor: TEditor
): Editor =>
  EDITOR_RUNTIME_OWNER.get(editor as Editor) ?? (editor as unknown as Editor);

export const getEditorRuntimeRoot = (editor: Editor): RootKey =>
  EDITOR_RUNTIME_ROOT.get(editor) ?? 'main';

export const getEditorSchema = <V extends Value>(
  editor: Editor<V, any>
): InternalEditorSchemaApi<V> => getEditorRuntime(editor).schema;
