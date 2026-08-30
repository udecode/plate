import type {
  Ancestor,
  Descendant,
  DescendantIn,
  Location,
  Node,
  NodeEntry,
  NodeTypeSelector,
  Path,
  Point,
  Text,
} from '../interfaces';
import type {
  AnyEditor as Editor,
  EditorAboveOptions,
  EditorCommit,
  EditorCommitListener,
  EditorCommitSource,
  EditorCommandDispatch,
  EditorExtensionReference,
  EditorExtensionInput,
  EditorExtensionReconfigureOptions,
  EditorDocumentValue,
  EditorLeafOptions,
  EditorLevelsOptions,
  EditorNextOptions,
  EditorParentOptions,
  EditorPointOptions,
  EditorPreviousOptions,
  EditorSnapshot,
  EditorStateView,
  EditorStaticApi,
  EditorUpdateContext,
  EditorUpdateTransaction,
  RootKey,
  NodeKey,
  Selection,
  SnapshotListener,
  Value,
} from '../interfaces/editor';
import type { DocumentChange } from './change/document-change';
import type { InternalEditorSchemaApi } from './editor-schema';
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

export type InternalEditorReadRuntime = RuntimeMethods<
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
  parent: {
    (
      at: Location,
      options: EditorParentOptions & {
        type: NodeTypeSelector;
      }
    ): NodeEntry<Ancestor> | undefined;
    (
      at: Location,
      options?: EditorParentOptions<Ancestor, undefined>
    ): NodeEntry<Ancestor>;
  };
  point: (at: Location, options?: EditorPointOptions) => Point;
  previous: <T extends Node>(
    options?: EditorPreviousOptions<T>
  ) => NodeEntry<T> | undefined;
};

export type InternalEditorSnapshotRuntime<V extends Value = Value> = {
  getChildren: () => V;
  getFragment: () => Array<DescendantIn<V>>;
  getLastCommit: () => EditorCommit<V> | null;
  getPathByNodeKey: (nodeKey: NodeKey) => Path | null;
  getNodeKey: (path: Path) => NodeKey | null;
  getSelection: () => Selection;
  getSnapshot: () => EditorSnapshot<V>;
};

export type InternalEditorTransactionRuntime<V extends Value = Value> = {
  read: <T>(fn: (state: EditorStateView<V, any>) => T) => T;
  runCommand: EditorCommandDispatch<Editor<V>>;
  subscribe: (listener: SnapshotListener<V>) => () => void;
  subscribeCommit: (listener: EditorCommitListener<V>) => () => void;
  subscribeSource: (
    source: EditorCommitSource,
    listener: SnapshotListener<V>
  ) => () => void;
  update: (
    fn: (
      transaction: EditorUpdateTransaction<V, any>,
      context: EditorUpdateContext<Editor<V>>
    ) => void,
    options?: InternalEditorUpdateOptions
  ) => void;
};

export type InternalEditorExtensionRuntime<V extends Value = Value> = {
  install: (
    extension: EditorExtensionInput,
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
    afterPublish: () => void;
    rollback: () => void;
    stage: () => void;
    validateDocument: (value: EditorDocumentValue) => void;
  }>;
  schema: InternalEditorSchemaApi<V>;
};

export type InternalEditorExtensionPublicationEntry = Readonly<{
  editor?: Editor;
  extension: EditorExtensionReference;
}>;

export type InternalEditorRuntime<V extends Value = Value> =
  InternalEditorExtensionRuntime<V> &
    InternalEditorReadRuntime &
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

type EditorRuntimeCarrier = Readonly<{
  id: string;
  read: object;
  update: object;
}>;

export const getEditorRuntimeOwner = (editor: EditorRuntimeCarrier): Editor =>
  EDITOR_RUNTIME_OWNER.get(editor as Editor) ?? (editor as Editor);

export const getEditorRuntimeRoot = (editor: Editor): RootKey =>
  EDITOR_RUNTIME_ROOT.get(editor) ?? 'main';

export const getEditorSchema = <V extends Value>(
  editor: Editor<V>
): InternalEditorSchemaApi<V> => getEditorRuntime(editor).schema;
