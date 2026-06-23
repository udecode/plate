import type {
  Ancestor,
  Descendant,
  DescendantIn,
  Location,
  Node,
  NodeEntry,
  Operation,
  Path,
  Point,
  Text,
} from '../interfaces';
import type {
  Editor,
  EditorAboveOptions,
  EditorCommit,
  EditorCommitSource,
  EditorExtensionInput,
  EditorLeafOptions,
  EditorLevelsOptions,
  EditorNextOptions,
  EditorNormalizeNodeOptions,
  EditorOperationDirtinessOptions,
  EditorPointOptions,
  EditorPreviousOptions,
  EditorSchemaApi,
  EditorSnapshot,
  EditorStateView,
  EditorStaticApi,
  EditorUpdateContext,
  EditorUpdateOptions,
  EditorUpdateTransaction,
  RuntimeId,
  Selection,
  SnapshotListener,
  Value,
} from '../interfaces/editor';

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
  | 'isNormalizing'
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

export type InternalEditorRefRuntime = RuntimeMethods<
  'pathRef' | 'pathRefs' | 'pointRef' | 'pointRefs' | 'rangeRef' | 'rangeRefs'
>;

export type InternalEditorSnapshotRuntime<V extends Value = Value> = {
  getChildren: () => V;
  getDirtyPaths: (operation: Operation<V>) => Path[];
  getFragment: () => DescendantIn<V>[];
  getLastCommit: () => EditorCommit<V> | null;
  getOperationDirtiness: (
    operations: readonly Operation<V>[],
    options?: EditorOperationDirtinessOptions<V>
  ) => EditorCommit<V>;
  getOperations: (startIndex?: number) => readonly Operation<V>[];
  getPathByRuntimeId: (runtimeId: RuntimeId) => Path | null;
  getRuntimeId: (path: Path) => RuntimeId | null;
  getSelection: () => Selection;
  getSnapshot: () => EditorSnapshot<V>;
};

export type InternalEditorTransactionRuntime<V extends Value = Value> = {
  read: <T>(fn: (state: EditorStateView<V>) => T) => T;
  subscribe: (listener: SnapshotListener<V>) => () => void;
  subscribeCommit: (listener: (commit: EditorCommit<V>) => void) => () => void;
  subscribeSource: (
    source: EditorCommitSource,
    listener: SnapshotListener<V>
  ) => () => void;
  update: (
    fn: (
      transaction: EditorUpdateTransaction<V>,
      context: EditorUpdateContext<Editor<V>>
    ) => void,
    options?: EditorUpdateOptions
  ) => void;
};

export type InternalEditorTransformRuntime<V extends Value = Value> = {
  normalizeNode: (
    entry: NodeEntry,
    options?: EditorNormalizeNodeOptions<V>
  ) => void;
  shouldNormalize: (options: {
    explicit?: boolean;
    iteration: number;
    operation?: Operation;
  }) => boolean;
};

export type InternalEditorExtensionRuntime<V extends Value = Value> = {
  extend: (extension: EditorExtensionInput<Editor<V>>) => () => void;
  schema: EditorSchemaApi;
};

export type InternalEditorRuntime<V extends Value = Value> =
  InternalEditorExtensionRuntime<V> &
    InternalEditorQueryRuntime &
    InternalEditorRefRuntime &
    InternalEditorSnapshotRuntime<V> &
    InternalEditorTransactionRuntime<V> &
    InternalEditorTransformRuntime<V>;

const EDITOR_RUNTIME = new WeakMap<Editor, InternalEditorRuntime>();

export const setEditorRuntime = <V extends Value>(
  editor: Editor<V>,
  runtime: InternalEditorRuntime<V>
) => {
  EDITOR_RUNTIME.set(editor, runtime as unknown as InternalEditorRuntime);
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

export const getEditorSchema = (editor: Editor): EditorSchemaApi =>
  getEditorRuntime(editor).schema;
