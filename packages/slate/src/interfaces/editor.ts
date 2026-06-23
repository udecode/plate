import type {
  Ancestor,
  Bookmark,
  BookmarkOptions,
  Descendant,
  DescendantIn,
  Element,
  ElementIn,
  ElementOrTextIn,
  Location,
  Node,
  NodeEntry,
  NodeIn,
  NodeProps,
  Operation,
  Path,
  PathRef,
  Point,
  PointRef,
  Range,
  RangeRef,
  Span,
  Text,
  TextIn,
} from '..';
import {
  defineCommand as defineEditorCommand,
  registerCommand as registerEditorCommand,
} from '../core/command-registry';
import {
  defineEditorExtension as defineEditorExtensionCore,
  extendEditor as extendEditorCore,
} from '../core/editor-extension';
import { getEditorRuntime, getEditorSchema } from '../core/editor-runtime';
import {
  getExtensionRegistry as getEditorExtensionRegistry,
  registerCapability as registerEditorCapability,
  registerCommitListener as registerEditorCommitListener,
  registerNormalizer as registerEditorNormalizer,
} from '../core/extension-registry';
import {
  getCurrentSelection,
  getCurrentSelectionRoot,
  getCollabStatePatches as getEditorCollabStatePatches,
  isInTransaction,
  replaceSnapshot,
  withEditorOperationRoot,
  withEditorOperationRootChildren,
} from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { isEditor as isEditorValue } from '../editor/is-editor';
import { getLocationRoot } from '../internal/root-location';
import type {
  LeafEdge,
  MaximizeMode,
  RangeDirection,
  RangeMode,
  SelectionMode,
  TextDirection,
  TextUnit,
  TextUnitAdjustment,
} from '../types/types';
import type {
  NodeInsertNodesOptions,
  NodeMutationMethods,
} from './transforms/node';
import type {
  SelectionCollapseOptions,
  SelectionMoveOptions,
  SelectionMutationMethods,
  SelectionSetPointOptions,
} from './transforms/selection';
import type {
  TextDeleteOptions,
  TextInsertFragmentOptions,
  TextInsertTextOptions,
  TextMutationMethods,
} from './transforms/text';

/**
 * The `Editor` interface exposes the runtime API of a Slate editor. Document
 * state is read through editor methods and mutated through `editor.update`.
 */
export type Value = Element[];

export type RootKey = string;

export type EditorDocumentValue<V extends Value = Value> = {
  children: V;
  roots?: Record<RootKey, V>;
  state?: Record<string, unknown>;
};

export type InitialValue<V extends Value = Value> =
  | V
  | {
      children: V;
      roots?: Record<RootKey, V>;
      state?: Record<string, unknown>;
    };

export type StateFieldCollabPolicy = 'local' | 'shared';

export type StateFieldHistoryPolicy = 'push' | 'skip';

export type StateFieldInitial<TValue> = TValue | (() => TValue);

export type StateFieldDescriptor<TValue = unknown> = {
  applyPatch?: (value: TValue, patch: unknown) => TValue;
  collab?: StateFieldCollabPolicy;
  diff?: (previous: TValue, value: TValue) => unknown;
  history?: StateFieldHistoryPolicy;
  initial?: StateFieldInitial<TValue>;
  invertPatch?: (patch: unknown, previous: TValue, value: TValue) => unknown;
  key: string;
  persist?: boolean;
};

export type StateFieldValueInput<TValue> =
  | TValue
  | ((previous: TValue) => TValue);

export type EditorStatePatch<TValue = unknown> = {
  key: string;
} & (
  | {
      previousValue: TValue | undefined;
      value: TValue | undefined;
    }
  | {
      inversePatch: unknown;
      patch: unknown;
    }
);

export type EditorStateField<TValue = unknown> = EditorExtension<
  Editor,
  StateFieldDescriptor<TValue>
> &
  StateFieldDescriptor<TValue>;

type BivariantMethod<TArgs extends readonly unknown[], TResult> = {
  bivarianceHack(...args: TArgs): TResult;
}['bivarianceHack'];

export type EditorStateValueApi<V extends Value = Value> = {
  get: () => EditorDocumentValue<V>;
  lastCommit: () => EditorCommit<V> | null;
  operations: (startIndex?: number) => readonly Operation<V>[];
  /**
   * Reads one document root without cloning the serializable document value.
   * Omit `root` to read the primary document.
   * Treat the returned nodes as read-only live state.
   */
  root: (root?: RootKey) => Readonly<V>;
};

export type EditorTransactionValueApi<V extends Value = Value> =
  EditorStateValueApi<V> & {
    replace: (input: SnapshotInput<V>) => void;
  };

export type EditorStateSelectionApi = {
  get: () => Selection;
};

export type EditorStateViewApi = {
  isFocused: () => boolean;
  isReadOnly: () => boolean;
  root: () => RootKey;
};

export type EditorFragmentReadOptions = {
  at?: Range;
};

export type EditorStateFragmentApi<V extends Value = Value> = {
  get: (options?: EditorFragmentReadOptions) => DescendantIn<V>[];
};

export type EditorTransactionSelectionApi = EditorStateSelectionApi & {
  clear: () => void;
  collapse: (options?: SelectionCollapseOptions) => void;
  move: (options?: SelectionMoveOptions) => void;
  set: (target: Location | null) => void;
  setPoint: (props: Partial<Point>, options?: SelectionSetPointOptions) => void;
  setRange: (props: Partial<Range>) => void;
};

export type EditorStateMarksApi<V extends Value = Value> = {
  get: () => EditorMarks<V> | null;
};

export type EditorTransactionMarksApi<V extends Value = Value> =
  EditorStateMarksApi<V> & {
    add: (key: string, value: unknown) => void;
    remove: (key: string) => void;
    set: (marks: EditorMarks<V> | null) => void;
    toggle: (key: string, value?: unknown) => void;
  };

export type EditorCanonicalUpdateTag =
  | 'history-push'
  | 'history-merge'
  | 'historic'
  | 'paste'
  | 'collaboration'
  | 'skip-collab'
  | 'skip-dom-selection'
  | 'skip-scroll-into-view'
  | 'skip-selection-focus'
  | 'focus'
  | 'composition-start'
  | 'composition-end';

export type EditorUpdateTag = EditorCanonicalUpdateTag | (string & {});

export type EditorUpdateTagInput = EditorUpdateTag | readonly EditorUpdateTag[];

export type EditorHistoryUpdateMetadata = {
  mode?: 'merge' | 'push' | 'skip';
};

export type EditorCollaborationUpdateMetadata = {
  origin?: 'local' | 'remote';
  saveToHistory?: boolean;
};

export type EditorSelectionUpdateMetadata = {
  dom?: 'export-model' | 'preserve';
  focus?: boolean;
  scroll?: boolean;
};

export type EditorUpdateMetadata = {
  collab?: EditorCollaborationUpdateMetadata;
  history?: EditorHistoryUpdateMetadata;
  origin?: { kind: string } & Record<string, unknown>;
  selection?: EditorSelectionUpdateMetadata;
};

export type EditorOperationReplayOptions = {
  tag?: EditorUpdateTagInput;
};

export type EditorTransactionOperationsApi<V extends Value = Value> = {
  replay: (
    operations: readonly Operation<V>[],
    options?: EditorOperationReplayOptions
  ) => void;
};

export type EditorTransactionRootsApi<V extends Value = Value> = {
  create: (root: RootKey, children: V) => void;
  delete: (root: RootKey) => void;
  replace: (root: RootKey, children: V) => void;
};

export type EditorTransactionStatePatchesApi = {
  replay: (statePatches: readonly EditorStatePatch[]) => void;
};

export type EditorStateNodesApi = {
  above: <T extends Ancestor>(
    options?: EditorAboveOptions<T>
  ) => NodeEntry<T> | undefined;
  children: (at?: Location) => readonly Node[];
  elementReadOnly: (
    options?: EditorElementReadOnlyOptions
  ) => NodeEntry<Element> | undefined;
  first: (at: Location) => NodeEntry;
  get: <T extends Node>(at: Location) => NodeEntry<T>;
  hasBlocks: (element: Element) => boolean;
  hasInlines: (element: Element) => boolean;
  hasPath: (path: Path) => boolean;
  hasTexts: (element: Element) => boolean;
  isBlock: (element: Element) => boolean;
  isEmpty: (element: Element) => boolean;
  last: (at: Location) => NodeEntry;
  leaf: (at: Location, options?: EditorLeafOptions) => NodeEntry<Text>;
  levels: <T extends Node>(
    options?: EditorLevelsOptions<T>
  ) => Generator<NodeEntry<T>, void, undefined>;
  path: (at: Location, options?: EditorPathOptions) => Path;
  entries: <T extends Node>(
    options?: EditorNodesOptions<T>
  ) => Generator<NodeEntry<T>, void, undefined>;
  find: <T extends Node>(
    options?: EditorNodesOptions<T>
  ) => NodeEntry<T> | undefined;
  some: <T extends Node>(options?: EditorNodesOptions<T>) => boolean;
  toArray: {
    <T extends Node>(options?: EditorNodesOptions<T>): NodeEntry<T>[];
    <T extends Node, R>(
      options: EditorNodesOptions<T> | undefined,
      map: (entry: NodeEntry<T>) => R
    ): R[];
  };
  next: <T extends Descendant>(
    options?: EditorNextOptions<T>
  ) => NodeEntry<T> | undefined;
  parent: (at: Location) => NodeEntry<Ancestor>;
  previous: <T extends Node>(
    options?: EditorPreviousOptions<T>
  ) => NodeEntry<T> | undefined;
  shouldMergeNodesRemovePrevNode: (
    previous: NodeEntry,
    current: NodeEntry
  ) => boolean;
  void: (options?: EditorVoidOptions) => NodeEntry<Element> | undefined;
};

export type EditorTransactionNodesApi<V extends Value = Value> =
  EditorStateNodesApi & {
    insert: <T extends ElementOrTextIn<V>>(
      nodes: T | T[],
      options?: NodeInsertNodesOptions<T>
    ) => void;
    lift: <T extends NodeIn<V>>(options?: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: MaximizeMode;
      voids?: boolean;
    }) => void;
    merge: <T extends NodeIn<V>>(options?: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: RangeMode;
      hanging?: boolean;
      voids?: boolean;
    }) => void;
    move: <T extends NodeIn<V>>(options: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: MaximizeMode;
      to: Path;
      voids?: boolean;
    }) => void;
    remove: <T extends NodeIn<V>>(options?: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: RangeMode;
      hanging?: boolean;
      voids?: boolean;
    }) => void;
    set: <T extends NodeIn<V>>(
      props: Partial<NodeProps<T>>,
      options?: {
        at?: Location;
        match?: NodeMatch<T>;
        mode?: MaximizeMode;
        hanging?: boolean;
        split?: boolean;
        voids?: boolean;
        compare?: PropsCompare;
        merge?: PropsMerge;
      }
    ) => void;
    split: <T extends NodeIn<V>>(options?: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: RangeMode;
      always?: boolean;
      height?: number;
      position?: number;
      voids?: boolean;
    }) => void;
    unset: <T extends NodeIn<V>>(
      props: string | string[],
      options?: {
        at?: Location;
        match?: NodeMatch<T>;
        mode?: MaximizeMode;
        hanging?: boolean;
        split?: boolean;
        voids?: boolean;
      }
    ) => void;
    unwrap: <T extends NodeIn<V>>(options?: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: MaximizeMode;
      split?: boolean;
      voids?: boolean;
    }) => void;
    wrap: <T extends NodeIn<V>, E extends ElementIn<V>>(
      element: E,
      options?: {
        at?: Location;
        match?: NodeMatch<T>;
        mode?: MaximizeMode;
        split?: boolean;
        voids?: boolean;
      }
    ) => void;
  };

export type EditorStatePointsApi = {
  after: (at: Location, options?: EditorAfterOptions) => Point | undefined;
  before: (at: Location, options?: EditorBeforeOptions) => Point | undefined;
  end: (at: Location) => Point;
  get: (at: Location, options?: EditorPointOptions) => Point;
  isEdge: (point: Point, at: Location) => boolean;
  isEnd: (point: Point, at: Location) => boolean;
  isStart: (point: Point, at: Location) => boolean;
  positions: (
    options?: EditorPositionsOptions
  ) => Generator<Point, void, undefined>;
  start: (at: Location) => Point;
};

export type EditorStateRangesApi = {
  bookmark: (range: Range, options?: BookmarkOptions) => Bookmark;
  edges: (at: Location) => [Point, Point];
  get: (at: Location, to?: Location) => Range;
  project: (range: Range) => readonly ProjectedRangeSegment[];
  unhang: (range: Range, options?: EditorUnhangRangeOptions) => Range;
};

export type EditorStateTextApi = {
  string: (at: Location, options?: EditorStringOptions) => string;
};

export type EditorTransactionFragmentApi<V extends Value = Value> =
  EditorStateFragmentApi<V> & {
    delete: (options?: EditorFragmentDeletionOptions) => void;
    insert: (
      fragment: DescendantIn<V>[],
      options?: TextInsertFragmentOptions
    ) => void;
  };

export type EditorTransactionBreakApi = {
  insert: () => void;
  insertSoft: () => void;
};

export type EditorTransactionTextApi = EditorStateTextApi & {
  delete: (options?: TextDeleteOptions) => void;
  deleteBackward: (options?: EditorDirectedDeletionOptions) => void;
  deleteForward: (options?: EditorDirectedDeletionOptions) => void;
  insert: (text: string, options?: TextInsertTextOptions) => void;
};

export type EditorStateSchemaApi = {
  getElementBehavior: (element: Element) => EditorElementBehavior;
  getElementProperty: <T = unknown>(
    element: Element,
    property: string
  ) => T | undefined;
  getElementPropertyDescriptor: (
    type: string,
    property: string
  ) => EditorElementPropertyDescriptor | null;
  getElementSpec: (type: string) => EditorElementSpec | null;
  isAtom: (element: Element) => boolean;
  isBlock: (element: Element) => boolean;
  isEditableIsland: (element: Element) => boolean;
  isElementPropertyEqual: (
    type: string,
    property: string,
    left: unknown,
    right: unknown
  ) => boolean;
  isInline: (element: Element) => boolean;
  isIsolating: (element: Element) => boolean;
  isKeyboardSelectable: (element: Element) => boolean;
  isReadOnly: (element: Element) => boolean;
  isSelectable: (element: Element) => boolean;
  isVoid: (element: Element) => boolean;
  markableVoid: (element: Element) => boolean;
};

export type EditorStateRuntimeApi<V extends Value = Value> = {
  idAt: (path: Path) => RuntimeId | null;
  pathOf: (runtimeId: RuntimeId) => Path | null;
  snapshot: () => EditorSnapshot<V>;
};

export type EditorSchemaApi = EditorStateSchemaApi & {
  define: (
    specs: EditorElementSpec | readonly EditorElementSpec[],
    options?: { source?: string }
  ) => () => void;
};

export type EditorElementVoidKind =
  | 'block'
  | 'editable-island'
  | 'inline'
  | 'markable-inline';

export type EditorElementPropertyKind =
  | 'boolean'
  | 'json'
  | 'number'
  | 'string';

export type EditorElementPropertyDescriptor<T = unknown> = {
  default?: T | (() => T);
  equals?: (left: T, right: T) => boolean;
  kind?: EditorElementPropertyKind;
};

export type EditorElementBehavior = {
  atom: boolean;
  editableIsland: boolean;
  inline: boolean;
  isolating: boolean;
  keyboardSelectable: boolean;
  markableVoid: boolean;
  readOnly: boolean;
  selectable: boolean;
  void: boolean;
};

export type EditorElementContentRootSpec = {
  /**
   * Slot key on `element.childRoots` that stores the projected content root.
   *
   * The slot is schema vocabulary. The actual root key is document data:
   * `element.childRoots[slot]`.
   */
  slot: string;
};

export type EditorElementSpec = {
  atom?: boolean;
  contentRoot?: EditorElementContentRootSpec;
  inline?: boolean;
  isolating?: boolean;
  keyboardSelectable?: boolean;
  markableVoid?: boolean;
  match?: (element: Element) => boolean;
  properties?: Readonly<Record<string, EditorElementPropertyDescriptor>>;
  readOnly?: boolean;
  selectable?: boolean;
  type: string;
  void?: EditorElementVoidKind;
};

declare const EDITOR_STATE_EXTENSION_VALUE: unique symbol;

declare const EDITOR_TX_EXTENSION_VALUE: unique symbol;

export interface EditorStateExtensionGroups<V extends Value = Value> {
  readonly [EDITOR_STATE_EXTENSION_VALUE]?: V;
}

export interface EditorTxExtensionGroups<V extends Value = Value> {
  readonly [EDITOR_TX_EXTENSION_VALUE]?: V;
}

export type EditorCoreStateView<V extends Value = Value> = {
  fragment: EditorStateFragmentApi<V>;
  getField: <TValue>(field: EditorStateField<TValue>) => TValue;
  marks: EditorStateMarksApi<V>;
  nodes: EditorStateNodesApi;
  points: EditorStatePointsApi;
  ranges: EditorStateRangesApi;
  runtime: EditorStateRuntimeApi<V>;
  schema: EditorStateSchemaApi;
  selection: EditorStateSelectionApi;
  text: EditorStateTextApi;
  value: EditorStateValueApi<V>;
  view: EditorStateViewApi;
};

export type EditorStateView<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = EditorCoreStateView<V> & EditorInstalledStateGroups<V, TExtensions>;

export type EditorCoreUpdateTransaction<V extends Value = Value> = Omit<
  EditorCoreStateView<V>,
  'marks' | 'nodes' | 'selection' | 'text' | 'value'
> & {
  break: EditorTransactionBreakApi;
  fragment: EditorTransactionFragmentApi<V>;
  marks: EditorTransactionMarksApi<V>;
  nodes: EditorTransactionNodesApi<V>;
  normalize: (options?: EditorNormalizeOptions) => void;
  operations: EditorTransactionOperationsApi<V>;
  roots: EditorTransactionRootsApi<V>;
  selection: EditorTransactionSelectionApi;
  setField: <TValue>(
    field: EditorStateField<TValue>,
    value: StateFieldValueInput<TValue>
  ) => void;
  statePatches: EditorTransactionStatePatchesApi;
  text: EditorTransactionTextApi;
  value: EditorTransactionValueApi<V>;
  withoutNormalizing: (fn: () => void) => void;
};

export type EditorUpdateTransaction<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = EditorCoreUpdateTransaction<V> & EditorInstalledTxGroups<V, TExtensions>;

export type EditorUpdateContext<TEditor extends BaseEditor<any, any> = Editor> =
  {
    afterCommit: (handler: EditorCommitHandler<TEditor>) => void;
  };

export interface BaseEditor<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> {
  api: Readonly<EditorInstalledApiGroups<TExtensions>>;
  getApi: <
    TExtension extends EditorResolvedInstalledExtensions<TExtensions>[number],
  >(
    extension: TExtension
  ) => EditorApiValueFromExtension<TExtension>;
  read: <T>(fn: (state: EditorStateView<V, TExtensions>) => T) => T;
  subscribe: (listener: SnapshotListener<any>) => () => void;
  subscribeCommit: (
    listener: (commit: EditorCommit<any>) => void
  ) => () => void;
  update: BivariantMethod<
    [
      fn: (
        transaction: EditorUpdateTransaction<V, TExtensions>,
        context: EditorUpdateContext<BaseEditor<V, TExtensions>>
      ) => void,
      options?: EditorUpdateOptions,
    ],
    void
  >;
  extend: (extension: EditorExtensionInput<any>) => () => void;
}

export type EditorRuntime<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Pick<
  BaseEditor<V, TExtensions>,
  | 'api'
  | 'extend'
  | 'getApi'
  | 'read'
  | 'subscribe'
  | 'subscribeCommit'
  | 'update'
> & {
  editor: Editor<V, TExtensions>;
};

export type EditorRuntimeOptions<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = CreateEditorOptions<V, TExtensions>;

export type EditorViewOptions = {
  readOnly?: boolean;
  root?: RootKey;
};

export type EditorView<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = BaseEditor<V, TExtensions> & {
  blur: () => void;
  focus: () => void;
  readonly root: RootKey;
  readonly runtime: EditorRuntime<V, TExtensions>;
};

/**
 * Internal runtime transform API. Normal public writes go through
 * `editor.update((tx) => ...)`; these methods remain the runtime-owned
 * implementation layer used by core, tests, and explicit escape hatches.
 */
export interface EditorTransformApi<V extends Value = Value> {
  addMark: (key: string, value: any) => void;
  bookmark: (range: Range, options?: BookmarkOptions) => Bookmark;
  collapse: (options?: SelectionCollapseOptions) => void;
  delete: (options?: TextDeleteOptions) => void;
  deleteBackward: (unit: TextUnit) => void;
  deleteForward: (unit: TextUnit) => void;
  deleteFragment: (options?: EditorFragmentDeletionOptions) => void;
  deselect: () => void;
  insertBreak: () => void;
  insertFragment: (
    fragment: DescendantIn<V>[],
    options?: TextInsertFragmentOptions
  ) => void;
  insertNode: <T extends ElementOrTextIn<V>>(
    node: T,
    options?: NodeInsertNodesOptions<T>
  ) => void;
  insertNodes: <T extends ElementOrTextIn<V>>(
    nodes: T | T[],
    options?: NodeInsertNodesOptions<T>
  ) => void;
  insertSoftBreak: () => void;
  insertText: (text: string, options?: TextInsertTextOptions) => void;
  liftNodes: <T extends NodeIn<V>>(options?: {
    at?: Location;
    match?: NodeMatch<T>;
    mode?: MaximizeMode;
    voids?: boolean;
  }) => void;
  mergeNodes: <T extends NodeIn<V>>(options?: {
    at?: Location;
    match?: NodeMatch<T>;
    mode?: RangeMode;
    hanging?: boolean;
    voids?: boolean;
  }) => void;
  move: (options?: SelectionMoveOptions) => void;
  moveNodes: <T extends NodeIn<V>>(options: {
    at?: Location;
    match?: NodeMatch<T>;
    mode?: MaximizeMode;
    to: Path;
    voids?: boolean;
  }) => void;
  normalize: (options?: EditorNormalizeOptions) => void;
  removeMark: (key: string) => void;
  removeNodes: <T extends NodeIn<V>>(options?: {
    at?: Location;
    match?: NodeMatch<T>;
    mode?: RangeMode;
    hanging?: boolean;
    voids?: boolean;
  }) => void;
  select: (target: Location) => void;
  setNodes: <T extends Node>(
    props: Partial<NodeProps<T>>,
    options?: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: MaximizeMode;
      hanging?: boolean;
      split?: boolean;
      voids?: boolean;
      compare?: PropsCompare;
      merge?: PropsMerge;
    }
  ) => void;
  setNormalizing: (isNormalizing: boolean) => void;
  setPoint: (props: Partial<Point>, options?: SelectionSetPointOptions) => void;
  setSelection: (props: Partial<Range>) => void;
  splitNodes: <T extends NodeIn<V>>(options?: {
    at?: Location;
    match?: NodeMatch<T>;
    mode?: RangeMode;
    always?: boolean;
    height?: number;
    position?: number;
    voids?: boolean;
  }) => void;
  toggleMark: (key: string, value?: any) => void;
  unsetNodes: <T extends NodeIn<V>>(
    props: string | string[],
    options?: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: MaximizeMode;
      hanging?: boolean;
      split?: boolean;
      voids?: boolean;
    }
  ) => void;
  unwrapNodes: <T extends NodeIn<V>>(options?: {
    at?: Location;
    match?: NodeMatch<T>;
    mode?: MaximizeMode;
    split?: boolean;
    voids?: boolean;
  }) => void;
  withoutNormalizing: (fn: () => void) => void;
  wrapNodes: <T extends NodeIn<V>, E extends ElementIn<V>>(
    element: E,
    options?: {
      at?: Location;
      match?: NodeMatch<T>;
      mode?: MaximizeMode;
      split?: boolean;
      voids?: boolean;
    }
  ) => void;
}

export type EditorTransformNext<TArgs extends object> = (
  overrides?: Partial<TArgs>
) => boolean;

export type EditorPublicTransformMiddlewareKey = Exclude<
  keyof EditorTransformApi,
  'bookmark' | 'normalize' | 'setNormalizing' | 'withoutNormalizing'
>;

type EmptyTransformMiddlewareArgs = Record<never, never>;

export type EditorTransformMiddlewareArgs<V extends Value = Value> = {
  addMark: { key: string; value: unknown };
  collapse: { options?: SelectionCollapseOptions };
  delete: { options?: TextDeleteOptions };
  deleteBackward: { unit: TextUnit };
  deleteForward: { unit: TextUnit };
  deleteFragment: { options?: EditorFragmentDeletionOptions };
  deselect: EmptyTransformMiddlewareArgs;
  insertBreak: EmptyTransformMiddlewareArgs;
  insertFragment: {
    fragment: DescendantIn<V>[];
    options?: TextInsertFragmentOptions;
  };
  insertNode: {
    node: ElementOrTextIn<V>;
    options?: NodeInsertNodesOptions<ElementOrTextIn<V>>;
  };
  insertNodes: {
    nodes: ElementOrTextIn<V> | ElementOrTextIn<V>[];
    options?: NodeInsertNodesOptions<ElementOrTextIn<V>>;
  };
  insertSoftBreak: EmptyTransformMiddlewareArgs;
  insertText: { options?: TextInsertTextOptions; text: string };
  liftNodes: {
    options?: {
      at?: Location;
      match?: NodeMatch<NodeIn<V>>;
      mode?: MaximizeMode;
      voids?: boolean;
    };
  };
  mergeNodes: {
    options?: {
      at?: Location;
      match?: NodeMatch<NodeIn<V>>;
      mode?: RangeMode;
      hanging?: boolean;
      voids?: boolean;
    };
  };
  move: { options?: SelectionMoveOptions };
  moveNodes: {
    options: {
      at?: Location;
      match?: NodeMatch<NodeIn<V>>;
      mode?: MaximizeMode;
      to: Path;
      voids?: boolean;
    };
  };
  removeMark: { key: string };
  removeNodes: {
    options?: {
      at?: Location;
      match?: NodeMatch<NodeIn<V>>;
      mode?: RangeMode;
      hanging?: boolean;
      voids?: boolean;
    };
  };
  select: { target: Location };
  setNodes: {
    props: Partial<NodeProps<NodeIn<V>>>;
    options?: {
      at?: Location;
      match?: NodeMatch<NodeIn<V>>;
      mode?: MaximizeMode;
      hanging?: boolean;
      split?: boolean;
      voids?: boolean;
      compare?: PropsCompare;
      merge?: PropsMerge;
    };
  };
  setPoint: { options?: SelectionSetPointOptions; props: Partial<Point> };
  setSelection: { props: Partial<Range> };
  splitNodes: {
    options?: {
      at?: Location;
      match?: NodeMatch<NodeIn<V>>;
      mode?: RangeMode;
      always?: boolean;
      height?: number;
      position?: number;
      voids?: boolean;
    };
  };
  toggleMark: { key: string; value?: unknown };
  unsetNodes: {
    props: string | string[];
    options?: {
      at?: Location;
      match?: NodeMatch<NodeIn<V>>;
      mode?: MaximizeMode;
      hanging?: boolean;
      split?: boolean;
      voids?: boolean;
    };
  };
  unwrapNodes: {
    options?: {
      at?: Location;
      match?: NodeMatch<NodeIn<V>>;
      mode?: MaximizeMode;
      split?: boolean;
      voids?: boolean;
    };
  };
  wrapNodes: {
    element: ElementIn<V>;
    options?: {
      at?: Location;
      match?: NodeMatch<NodeIn<V>>;
      mode?: MaximizeMode;
      split?: boolean;
      voids?: boolean;
    };
  };
};

type MissingEditorTransformMiddlewareArgs = Exclude<
  EditorPublicTransformMiddlewareKey,
  keyof EditorTransformMiddlewareArgs
>;
type ExtraEditorTransformMiddlewareArgs = Exclude<
  keyof EditorTransformMiddlewareArgs,
  EditorPublicTransformMiddlewareKey
>;
type AssertEditorTransformMiddlewareKey<T extends never> = T;
type _NoMissingEditorTransformMiddlewareArgs =
  AssertEditorTransformMiddlewareKey<MissingEditorTransformMiddlewareArgs>;
type _NoExtraEditorTransformMiddlewareArgs =
  AssertEditorTransformMiddlewareKey<ExtraEditorTransformMiddlewareArgs>;

export type EditorTransformMiddlewareContext<
  TEditor extends BaseEditor<any>,
  TArgs extends object,
> = TArgs & {
  editor: TEditor;
  next: EditorTransformNext<TArgs>;
  tx: EditorUpdateTransaction<ValueOf<TEditor>>;
};

export type EditorTransformMiddlewareMap<
  TEditor extends BaseEditor<any> = Editor,
> = {
  [K in EditorPublicTransformMiddlewareKey]?: (
    context: EditorTransformMiddlewareContext<
      TEditor,
      EditorTransformMiddlewareArgs<ValueOf<TEditor>>[K]
    >
  ) => boolean;
};

type EmptyQueryMiddlewareArgs = Record<never, never>;

export type EditorQueryMiddlewareArgs<_V extends Value = Value> = {
  fragment: {
    get: { options?: EditorFragmentReadOptions };
  };
  marks: {
    get: EmptyQueryMiddlewareArgs;
  };
  nodes: {
    above: { options?: EditorAboveOptions<Ancestor> };
    children: { at?: Location };
    elementReadOnly: { options?: EditorElementReadOnlyOptions };
    entries: { options?: EditorNodesOptions<Node> };
    find: { options?: EditorNodesOptions<Node> };
    first: { at: Location };
    get: { at: Location };
    hasBlocks: { element: Element };
    hasInlines: { element: Element };
    hasPath: { path: Path };
    hasTexts: { element: Element };
    isBlock: { element: Element };
    isEmpty: { element: Element };
    last: { at: Location };
    leaf: { at: Location; options?: EditorLeafOptions };
    levels: { options?: EditorLevelsOptions<Node> };
    next: { options?: EditorNextOptions<Descendant> };
    parent: { at: Location; options?: EditorParentOptions };
    path: { at: Location; options?: EditorPathOptions };
    previous: { options?: EditorPreviousOptions<Node> };
    shouldMergeNodesRemovePrevNode: {
      current: NodeEntry;
      previous: NodeEntry;
    };
    some: { options?: EditorNodesOptions<Node> };
    toArray: {
      map?: (entry: NodeEntry<Node>) => unknown;
      options?: EditorNodesOptions<Node>;
    };
    void: { options?: EditorVoidOptions };
  };
  points: {
    after: { at: Location; options?: EditorAfterOptions };
    before: { at: Location; options?: EditorBeforeOptions };
    end: { at: Location };
    get: { at: Location; options?: EditorPointOptions };
    isEdge: { at: Location; point: Point };
    isEnd: { at: Location; point: Point };
    isStart: { at: Location; point: Point };
    positions: { options?: EditorPositionsOptions };
    start: { at: Location };
  };
  ranges: {
    edges: { at: Location };
    get: { at: Location; to?: Location };
    project: { range: Range };
    unhang: { options?: EditorUnhangRangeOptions; range: Range };
  };
  text: {
    string: { at: Location; options?: EditorStringOptions };
  };
};

export type EditorQueryMiddlewareResult<V extends Value = Value> = {
  fragment: {
    get: DescendantIn<V>[];
  };
  marks: {
    get: EditorMarks<V> | null;
  };
  nodes: {
    above: NodeEntry<Ancestor> | undefined;
    children: readonly Node[];
    elementReadOnly: NodeEntry<Element> | undefined;
    entries: Generator<NodeEntry<Node>, void, undefined>;
    find: NodeEntry<Node> | undefined;
    first: NodeEntry;
    get: NodeEntry<Node>;
    hasBlocks: boolean;
    hasInlines: boolean;
    hasPath: boolean;
    hasTexts: boolean;
    isBlock: boolean;
    isEmpty: boolean;
    last: NodeEntry;
    leaf: NodeEntry<Text>;
    levels: Generator<NodeEntry<Node>, void, undefined>;
    next: NodeEntry<Descendant> | undefined;
    parent: NodeEntry<Ancestor>;
    path: Path;
    previous: NodeEntry<Node> | undefined;
    shouldMergeNodesRemovePrevNode: boolean;
    some: boolean;
    toArray: NodeEntry<Node>[] | unknown[];
    void: NodeEntry<Element> | undefined;
  };
  points: {
    after: Point | undefined;
    before: Point | undefined;
    end: Point;
    get: Point;
    isEdge: boolean;
    isEnd: boolean;
    isStart: boolean;
    positions: Generator<Point, void, undefined>;
    start: Point;
  };
  ranges: {
    edges: [Point, Point];
    get: Range;
    project: readonly ProjectedRangeSegment[];
    unhang: Range;
  };
  text: {
    string: string;
  };
};

export type EditorQueryGroup = keyof EditorQueryMiddlewareArgs;

export type EditorQueryMiddlewareContext<
  TEditor extends BaseEditor<any>,
  TArgs extends object,
  TResult,
> = TArgs & {
  editor: TEditor;
  next: (overrides?: Partial<TArgs>) => TResult;
  state: EditorStateView<ValueOf<TEditor>>;
};

type EditorQueryMiddlewareEntry<
  TEditor extends BaseEditor<any>,
  TArgs extends object,
  TResult,
> = (context: EditorQueryMiddlewareContext<TEditor, TArgs, TResult>) => TResult;

export type EditorQueryMiddlewareMap<TEditor extends BaseEditor<any> = Editor> =
  {
    fragment?: {
      get?: EditorQueryMiddlewareEntry<
        TEditor,
        EditorQueryMiddlewareArgs<ValueOf<TEditor>>['fragment']['get'],
        EditorQueryMiddlewareResult<ValueOf<TEditor>>['fragment']['get']
      >;
    };
    marks?: {
      get?: EditorQueryMiddlewareEntry<
        TEditor,
        EditorQueryMiddlewareArgs<ValueOf<TEditor>>['marks']['get'],
        EditorQueryMiddlewareResult<ValueOf<TEditor>>['marks']['get']
      >;
    };
    nodes?: {
      [K in keyof EditorQueryMiddlewareArgs<
        ValueOf<TEditor>
      >['nodes']]?: EditorQueryMiddlewareEntry<
        TEditor,
        EditorQueryMiddlewareArgs<ValueOf<TEditor>>['nodes'][K],
        EditorQueryMiddlewareResult<ValueOf<TEditor>>['nodes'][K]
      >;
    };
    points?: {
      [K in keyof EditorQueryMiddlewareArgs<
        ValueOf<TEditor>
      >['points']]?: EditorQueryMiddlewareEntry<
        TEditor,
        EditorQueryMiddlewareArgs<ValueOf<TEditor>>['points'][K],
        EditorQueryMiddlewareResult<ValueOf<TEditor>>['points'][K]
      >;
    };
    ranges?: {
      [K in keyof EditorQueryMiddlewareArgs<
        ValueOf<TEditor>
      >['ranges']]?: EditorQueryMiddlewareEntry<
        TEditor,
        EditorQueryMiddlewareArgs<ValueOf<TEditor>>['ranges'][K],
        EditorQueryMiddlewareResult<ValueOf<TEditor>>['ranges'][K]
      >;
    };
    text?: {
      string?: EditorQueryMiddlewareEntry<
        TEditor,
        EditorQueryMiddlewareArgs<ValueOf<TEditor>>['text']['string'],
        EditorQueryMiddlewareResult<ValueOf<TEditor>>['text']['string']
      >;
    };
  };

export type EditorTransformRegistry<V extends Value = Value> =
  EditorTransformApi<V>;

export type Editor<
  V extends Value = any,
  TExtensions extends readonly unknown[] = readonly [],
> = BaseEditor<V, TExtensions>;

export type CreateEditorOptions<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = {
  extensions?: TExtensions;
  initialSelection?: Selection;
  initialValue?: InitialValue<V>;
};

type IsAny<T> = 0 extends 1 & T ? true : false;

export type ValueOf<E> =
  E extends BaseEditor<infer V>
    ? IsAny<V> extends true
      ? Value
      : V extends Value
        ? V
        : Value
    : Value;

export type Selection = Range | null;

export type EditorMarks<V extends Value = Value> = Partial<
  Omit<TextIn<V>, 'text'>
>;

export type EditorMarksOf<E extends BaseEditor<any> = Editor> = EditorMarks<
  ValueOf<E>
>;

export type RuntimeId = string;

export type SnapshotIndex = {
  idToPath: Record<RuntimeId, Path>;
  pathToId: Record<string, RuntimeId>;
};

export type ProjectedRangeSegment = {
  path: Path;
  runtimeId: RuntimeId;
  start: number;
  end: number;
};

export type EditorSnapshot<V extends Value = Value> = {
  children: V;
  index: SnapshotIndex;
  marks: EditorMarks<V> | null;
  selection: Selection;
  version: number;
};

export type EditorCommitClass =
  | 'text'
  | 'selection'
  | 'mark'
  | 'state'
  | 'structural'
  | 'replace';

export type SnapshotDirtyScope = 'none' | 'paths' | 'all';

export type SnapshotInput<V extends Value = Value> = {
  children: V;
  selection?: Selection;
  marks?: EditorMarks<V> | null;
};

export type SnapshotListener<V extends Value = Value> = (
  snapshot: EditorSnapshot<V>,
  change?: EditorCommit<V>
) => void;

export type EditorCommitSource =
  | 'commit'
  | 'selection'
  | 'text'
  | 'node'
  | 'decoration'
  | 'annotation'
  | 'root'
  | 'state'
  | 'focus'
  | 'composition'
  | 'external';

export type EditorUpdateOptions = {
  metadata?: EditorUpdateMetadata;
  skipNormalize?: boolean;
  tag?: EditorUpdateTagInput;
};

export type EditorOperationDirtinessOptions<V extends Value = Value> = {
  command?: EditorCommitCommand | null;
  marksBefore?: EditorMarks<V> | null;
  previousIndex?: SnapshotIndex;
  previousVersion?: number;
  reason?: 'replace' | null;
  selectionBefore?: Selection;
};

export type EditorTransaction<V extends Value = Value> = {
  apply: (operation: Operation<V>) => void;
  readonly children: V;
  getModelSelection: () => Selection;
  readonly marks: EditorMarks<V> | null;
  readonly operations: readonly Operation<V>[];
  resolveTarget: (options?: { at?: Location }) => Location | null;
  readonly selection: Selection;
  setMarks: (marks: EditorMarks<V> | null) => void;
  setSelection: (selection: Selection) => void;
};

export type TargetFreshnessRequest = {
  fallback: Selection;
  reason: 'implicit-target';
};

export type EditorTargetRuntime = {
  resolveImplicitTarget: (
    editor: Editor,
    request: TargetFreshnessRequest
  ) => Selection;
};

export type EditorCommand = {
  type: string;
};

export type EditorCommandDefinition<
  TCommand extends EditorCommand = EditorCommand,
> = Readonly<{
  type: TCommand['type'];
}>;

export type EditorCommandReference<
  TCommand extends EditorCommand = EditorCommand,
> = EditorCommandDefinition<TCommand> | TCommand['type'];

export type EditorCommitCommand = {
  origin: 'command';
  type: string;
};

export type EditorCommandContext<
  TCommand extends EditorCommand,
  TEditor extends Editor = Editor,
> = {
  command: TCommand;
  editor: TEditor;
};

export type EditorCommandNext<TCommand extends EditorCommand> = (
  command?: TCommand
) => boolean;

export type EditorCommandHandler<
  TCommand extends EditorCommand,
  TEditor extends Editor = Editor,
> = (
  context: EditorCommandContext<TCommand, TEditor>,
  next: EditorCommandNext<TCommand>
) => boolean;

export type EditorOperationContext<TEditor extends BaseEditor<any> = Editor> = {
  editor: TEditor;
  operation: Operation<ValueOf<TEditor>>;
};

export type EditorOperationNext<TEditor extends BaseEditor<any> = Editor> = (
  operation?: Operation<ValueOf<TEditor>>
) => void;

export type EditorOperationApplyContext<
  TEditor extends BaseEditor<any> = Editor,
> = EditorOperationContext<TEditor> & {
  next: EditorOperationNext<TEditor>;
};

export type EditorOperationApplyHandler<
  TEditor extends BaseEditor<any> = Editor,
> = (context: EditorOperationApplyContext<TEditor>) => void;

export type EditorExtensionOperations<
  TEditor extends BaseEditor<any> = Editor,
> = {
  apply?: EditorOperationApplyHandler<TEditor>;
};

export type EditorOperationMiddleware<
  TEditor extends BaseEditor<any> = Editor,
> = (
  context: EditorOperationContext<TEditor>,
  next: EditorOperationNext<TEditor>
) => void;

export type EditorNormalizeNodeOptions<_V extends Value = Value> = {
  explicit?: boolean;
  fallbackElement?: Element | (() => Element);
  force?: boolean;
  operation?: Operation;
};

export type EditorNodeNormalizerArgs<V extends Value = Value> =
  EditorNormalizeNodeOptions<V> & {
    entry: NodeEntry;
  };

export type EditorRootNormalizerArgs<V extends Value = Value> =
  EditorNormalizeNodeOptions<V>;

export type EditorNormalizerNext<TArgs extends object> = (
  overrides?: Partial<TArgs>
) => void;

export type EditorNormalizerTransaction<V extends Value = Value> = Pick<
  EditorCoreUpdateTransaction<V>,
  'break' | 'fragment' | 'marks' | 'nodes' | 'selection' | 'text'
> & {
  value: Pick<EditorCoreUpdateTransaction<V>['value'], 'get'>;
};

export type EditorNodeNormalizerContext<
  TEditor extends BaseEditor<any> = Editor,
> = EditorNodeNormalizerArgs<ValueOf<TEditor>> & {
  editor: TEditor;
  next: EditorNormalizerNext<EditorNodeNormalizerArgs<ValueOf<TEditor>>>;
  tx: EditorNormalizerTransaction<ValueOf<TEditor>>;
};

export type EditorRootNormalizerContext<
  TEditor extends BaseEditor<any> = Editor,
> = EditorRootNormalizerArgs<ValueOf<TEditor>> & {
  editor: TEditor;
  next: EditorNormalizerNext<EditorRootNormalizerArgs<ValueOf<TEditor>>>;
  tx: EditorNormalizerTransaction<ValueOf<TEditor>>;
};

export type EditorRootNormalizer<TEditor extends BaseEditor<any> = Editor> = (
  context: EditorRootNormalizerContext<TEditor>
) => void;

export type EditorNodeNormalizer<TEditor extends BaseEditor<any> = Editor> = (
  context: EditorNodeNormalizerContext<TEditor>
) => void;

export type EditorNormalizerMiddlewareMap<
  TEditor extends BaseEditor<any> = Editor,
> = {
  editor?: EditorRootNormalizer<TEditor>;
  node?: EditorNodeNormalizer<TEditor>;
};

export type EditorCommandOptions = {
  priority?: number;
};

export type EditorExtensionStateGroup<
  TEditor extends BaseEditor<any> = Editor,
  TResult = unknown,
> = (state: EditorStateView<ValueOf<TEditor>>, editor: TEditor) => TResult;

export type EditorExtensionTxGroup<
  TEditor extends BaseEditor<any> = Editor,
  TResult = unknown,
> = (
  transaction: EditorUpdateTransaction<ValueOf<TEditor>>,
  editor: TEditor,
  context: EditorUpdateContext<TEditor>
) => TResult;

export type EditorExtensionStateGroups<
  TEditor extends BaseEditor<any> = Editor,
> = {
  [K in keyof EditorStateExtensionGroups<
    ValueOf<TEditor>
  >]?: EditorExtensionStateGroup<
    TEditor,
    EditorStateExtensionGroups<ValueOf<TEditor>>[K]
  >;
} & Record<string, EditorExtensionStateGroup<TEditor> | undefined>;

export type EditorExtensionTxGroups<TEditor extends BaseEditor<any> = Editor> =
  {
    [K in keyof EditorTxExtensionGroups<
      ValueOf<TEditor>
    >]?: EditorExtensionTxGroup<
      TEditor,
      EditorTxExtensionGroups<ValueOf<TEditor>>[K]
    >;
  } & Record<string, EditorExtensionTxGroup<TEditor> | undefined>;

export type EditorExtensionApiMap = Record<
  string,
  unknown | readonly unknown[]
>;

export type EditorClipboardInsertDataContext<
  TEditor extends BaseEditor<any> = Editor,
> = {
  editor: TEditor;
  next: () => boolean;
  state: EditorStateView<ValueOf<TEditor>>;
};

export type EditorClipboardMiddlewareMap<
  TEditor extends BaseEditor<any> = Editor,
> = {
  insertData?: (
    data: DataTransfer,
    context: EditorClipboardInsertDataContext<TEditor>
  ) => boolean;
};

export type EditorExtensionRuntimeState<TValue> = {
  get: () => TValue;
  set: (value: TValue | ((previous: TValue) => TValue)) => void;
};

export type EditorExtensionSetupContext<
  TEditor extends BaseEditor<any> = Editor,
  TOptions = unknown,
> = {
  editor: TEditor;
  name: string;
  options: TOptions;
  runtimeState: <TValue>(
    initialValue: TValue | (() => TValue)
  ) => EditorExtensionRuntimeState<TValue>;
  signal: AbortSignal;
};

export type EditorCommitContext<TEditor extends BaseEditor<any, any> = Editor> =
  {
    commit: EditorCommit<ValueOf<TEditor>>;
    editor: TEditor;
    snapshot: EditorSnapshot<ValueOf<TEditor>>;
  };

export type EditorCommitHandler<TEditor extends BaseEditor<any, any> = Editor> =
  (context: EditorCommitContext<TEditor>) => void;

export type EditorExtensionSetupOutput<
  TEditor extends BaseEditor<any> = Editor,
> = {
  api?: EditorExtensionApiMap;
  clipboard?: EditorClipboardMiddlewareMap<TEditor>;
  cleanup?: () => void;
  elements?: readonly EditorElementSpec[];
  normalizers?: EditorNormalizerMiddlewareMap<TEditor>;
  onCommit?: EditorCommitHandler<TEditor>;
  operations?: EditorExtensionOperations<TEditor>;
  queries?: EditorQueryMiddlewareMap<TEditor>;
  state?: EditorExtensionStateGroups<TEditor>;
  transforms?: EditorTransformMiddlewareMap<TEditor>;
  tx?: EditorExtensionTxGroups<TEditor>;
};

export type EditorExtension<
  TEditor extends BaseEditor<any> = Editor,
  TOptions = unknown,
> = {
  api?: EditorExtensionApiMap;
  clipboard?: EditorClipboardMiddlewareMap<TEditor>;
  conflicts?: readonly string[];
  dependencies?: readonly string[];
  enabled?: boolean;
  elements?: readonly EditorElementSpec[];
  name: string;
  normalizers?: EditorNormalizerMiddlewareMap<TEditor>;
  onCommit?: EditorCommitHandler<TEditor>;
  operations?: EditorExtensionOperations<TEditor>;
  options?: TOptions;
  peerDependencies?: readonly string[];
  queries?: EditorQueryMiddlewareMap<TEditor>;
  setup?: (
    context: EditorExtensionSetupContext<TEditor, TOptions>
  ) => EditorExtensionSetupOutput<TEditor> | void;
  state?: EditorExtensionStateGroups<TEditor>;
  transforms?: EditorTransformMiddlewareMap<TEditor>;
  tx?: EditorExtensionTxGroups<TEditor>;
};

export type EditorExtensionInput<TEditor extends BaseEditor<any> = Editor> =
  | EditorExtension<TEditor, any>
  | readonly EditorExtension<TEditor, any>[];

type UnionToIntersection<T> = (
  T extends unknown
    ? (value: T) => void
    : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never;

type EditorSetupOutputFromExtension<TExtension> = TExtension extends {
  setup?: (...args: any[]) => infer TResult;
}
  ? Extract<NonNullable<TResult>, object>
  : unknown;

type EditorExtensionName<TExtension> = TExtension extends {
  name: infer TName extends PropertyKey;
}
  ? TName
  : never;

type EditorExtensionEnabled<TExtension> = TExtension extends { enabled: false }
  ? never
  : TExtension;

export type EditorResolvedInstalledExtensions<
  TExtensions extends readonly unknown[],
  TSeenNames extends PropertyKey = never,
> = TExtensions extends readonly []
  ? readonly []
  : TExtensions extends readonly [
        ...infer TRest extends readonly unknown[],
        infer TLast,
      ]
    ? EditorExtensionName<TLast> extends infer TName extends PropertyKey
      ? TName extends TSeenNames
        ? EditorResolvedInstalledExtensions<TRest, TSeenNames>
        : TLast extends { enabled: false }
          ? EditorResolvedInstalledExtensions<TRest, TSeenNames | TName>
          : [
              ...EditorResolvedInstalledExtensions<TRest, TSeenNames | TName>,
              TLast,
            ]
      : EditorResolvedInstalledExtensions<TRest, TSeenNames>
    : number extends TExtensions['length']
      ? readonly EditorExtensionEnabled<TExtensions[number]>[]
      : readonly [];

type EditorStateSlotsFromExtension<TExtension> = (TExtension extends {
  state?: infer TState;
}
  ? NonNullable<TState>
  : unknown) &
  (EditorSetupOutputFromExtension<TExtension> extends {
    state?: infer TState;
  }
    ? NonNullable<TState>
    : unknown);

type EditorTxSlotsFromExtension<TExtension> = (TExtension extends {
  tx?: infer TTx;
}
  ? NonNullable<TTx>
  : unknown) &
  (EditorSetupOutputFromExtension<TExtension> extends {
    tx?: infer TTx;
  }
    ? NonNullable<TTx>
    : unknown);

type EditorApiSlotsFromExtension<TExtension> = (TExtension extends {
  api?: infer TApi;
}
  ? NonNullable<TApi>
  : unknown) &
  (EditorSetupOutputFromExtension<TExtension> extends {
    api?: infer TApi;
  }
    ? NonNullable<TApi>
    : unknown);

type EditorStateGroupResult<
  V extends Value,
  K,
  TFactory,
> = K extends keyof EditorStateExtensionGroups<V>
  ? EditorStateExtensionGroups<V>[K]
  : TFactory extends (...args: any[]) => infer TResult
    ? TResult
    : never;

type EditorTxGroupResult<
  V extends Value,
  K,
  TFactory,
> = K extends keyof EditorTxExtensionGroups<V>
  ? EditorTxExtensionGroups<V>[K]
  : TFactory extends (...args: any[]) => infer TResult
    ? TResult
    : never;

type EditorStateGroupsFromExtension<
  V extends Value,
  TExtension,
> = TExtension extends unknown
  ? EditorStateSlotsFromExtension<TExtension> extends infer TState
    ? keyof TState extends never
      ? never
      : {
          [K in keyof TState]: EditorStateGroupResult<V, K, TState[K]>;
        }
    : never
  : never;

type EditorTxGroupsFromExtension<
  V extends Value,
  TExtension,
> = TExtension extends unknown
  ? EditorTxSlotsFromExtension<TExtension> extends infer TTx
    ? keyof TTx extends never
      ? never
      : {
          [K in keyof TTx]: EditorTxGroupResult<V, K, TTx[K]>;
        }
    : never
  : never;

type EditorApiValue<TValue> = TValue extends readonly (infer TItem)[]
  ? TItem
  : TValue;

type EditorApiGroupsFromExtension<TExtension> = TExtension extends unknown
  ? EditorApiSlotsFromExtension<TExtension> extends infer TApi
    ? keyof TApi extends never
      ? never
      : {
          [K in keyof TApi]: EditorApiValue<TApi[K]>;
        }
    : never
  : never;

export type EditorInstalledStateGroups<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = UnionToIntersection<
  EditorStateGroupsFromExtension<
    V,
    EditorResolvedInstalledExtensions<TExtensions>[number]
  >
>;

export type EditorInstalledTxGroups<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = UnionToIntersection<
  EditorTxGroupsFromExtension<
    V,
    EditorResolvedInstalledExtensions<TExtensions>[number]
  >
>;

export type EditorInstalledApiGroups<
  TExtensions extends readonly unknown[] = readonly [],
> = UnionToIntersection<
  EditorApiGroupsFromExtension<
    EditorResolvedInstalledExtensions<TExtensions>[number]
  >
>;

export type EditorApiValueFromExtension<TExtension> =
  EditorApiGroupsFromExtension<TExtension> extends infer TApi
    ? TExtension extends { name: infer TName }
      ? TName extends keyof TApi
        ? TApi[TName]
        : TApi[keyof TApi]
      : TApi[keyof TApi]
    : never;

export type RegisteredEditorExtension = {
  conflicts: readonly string[];
  dependencies: readonly string[];
  name: string;
  order: number;
  peerDependencies: readonly string[];
};

export type EditorExtensionRegistry = {
  capabilities: Map<string, unknown[]>;
  commands: Map<string, unknown[]>;
  commitListeners: Set<EditorCommitListener>;
  extensions: Map<string, RegisteredEditorExtension>;
  normalizers: Map<string, EditorNodeNormalizer>;
  operationMiddlewares: Set<EditorOperationMiddleware>;
  queryMiddlewares: Map<string, unknown[]>;
};

export type EditorCommitListener<V extends Value = Value> = (
  commit: EditorCommit<V>,
  snapshot: EditorSnapshot<V>
) => void;

export type DirtyRegion = {
  paths: readonly Path[];
  runtimeIds: readonly RuntimeId[];
  topLevelRange: readonly [number, number] | null;
  wholeDocument: boolean;
};

export type TopLevelRuntimeRange = readonly [number, number];

export type EditorCommit<V extends Value = Value> = {
  affectedNodeRuntimeIds: readonly RuntimeId[] | null;
  affectedProjectionRuntimeIds: readonly RuntimeId[] | null;
  affectedSelectionRuntimeIds: readonly RuntimeId[] | null;
  affectedTextRuntimeIds: readonly RuntimeId[] | null;
  childrenChanged: boolean;
  classes: readonly EditorCommitClass[];
  command: EditorCommitCommand | null;
  decorationImpactRuntimeIds: readonly RuntimeId[] | null;
  dirty: DirtyRegion;
  dirtyElementRuntimeIds: readonly RuntimeId[] | null;
  dirtyPaths: readonly Path[];
  dirtyScope: SnapshotDirtyScope;
  dirtyStateKeys: readonly string[];
  dirtyTextRuntimeIds: readonly RuntimeId[] | null;
  dirtyTopLevelRanges: readonly TopLevelRuntimeRange[] | null;
  dirtyTopLevelRuntimeIds: readonly RuntimeId[] | null;
  fullDocumentChanged: boolean;
  markDirtyRuntimeIds: readonly RuntimeId[] | null;
  marksAfter: EditorMarks<V> | null;
  marksBefore: EditorMarks<V> | null;
  marksChanged: boolean;
  metadata: Readonly<EditorUpdateMetadata>;
  nodeImpactRuntimeIds: readonly RuntimeId[] | null;
  operations: readonly Operation<V>[];
  previousVersion: number;
  replaceEpoch: number;
  selectionAfter: Selection;
  selectionBefore: Selection;
  selectionChanged: boolean;
  selectionImpactRuntimeIds: readonly RuntimeId[] | null;
  snapshotChanged: boolean;
  statePatches: readonly EditorStatePatch[];
  structureChanged: boolean;
  structuralDirtyRuntimeIds: readonly RuntimeId[] | null;
  textChanged: boolean;
  textDirtyRuntimeIds: readonly RuntimeId[] | null;
  rootRuntimeIdsChanged: boolean;
  topLevelOrderChanged: boolean;
  touchedRuntimeIds: readonly RuntimeId[] | null;
  tags: readonly EditorUpdateTag[];
  version: number;
};

export interface EditorAboveOptions<T extends Ancestor> {
  at?: Location;
  match?: NodeMatch<T>;
  mode?: MaximizeMode;
  voids?: boolean;
}

export interface EditorAfterOptions {
  distance?: number;
  unit?: TextUnitAdjustment;
  voids?: boolean;
}

export interface EditorBeforeOptions {
  distance?: number;
  unit?: TextUnitAdjustment;
  voids?: boolean;
}

export interface EditorDirectedDeletionOptions {
  unit?: TextUnit;
}

export interface EditorElementReadOnlyOptions {
  at?: Location;
  mode?: MaximizeMode;
  voids?: boolean;
}

export interface EditorFragmentDeletionOptions {
  at?: Location;
  direction?: TextDirection;
}

export interface EditorIsEditorOptions {
  deep?: boolean;
}

export interface EditorLeafOptions {
  depth?: number;
  edge?: LeafEdge;
}

export interface EditorLevelsOptions<T extends Node> {
  at?: Location;
  match?: NodeMatch<T>;
  reverse?: boolean;
  voids?: boolean;
}

export interface EditorNextOptions<T extends Descendant> {
  at?: Location;
  match?: NodeMatch<T>;
  mode?: SelectionMode;
  voids?: boolean;
}

export interface EditorNodeOptions {
  depth?: number;
  edge?: LeafEdge;
}

export interface EditorNodesOptions<T extends Node> {
  at?: Location | Span;
  match?: NodeMatch<T>;
  mode?: SelectionMode;
  universal?: boolean;
  reverse?: boolean;
  voids?: boolean;
  pass?: (entry: NodeEntry) => boolean;
}

export interface EditorNormalizeOptions {
  explicit?: boolean;
  force?: boolean;
  operation?: Operation;
}

export interface EditorParentOptions {
  depth?: number;
  edge?: LeafEdge;
}

export interface EditorPathOptions {
  depth?: number;
  edge?: LeafEdge;
}

export interface EditorPathRefOptions {
  affinity?: TextDirection | null;
  root?: RootKey;
}

export interface EditorPointOptions {
  edge?: LeafEdge;
}

export interface EditorPointRefOptions {
  affinity?: TextDirection | null;
}

export interface EditorPositionsOptions {
  at?: Location;
  unit?: TextUnitAdjustment;
  reverse?: boolean;
  voids?: boolean;
}

export interface EditorPreviousOptions<T extends Node> {
  at?: Location;
  match?: NodeMatch<T>;
  mode?: SelectionMode;
  voids?: boolean;
}

export interface EditorRangeRefOptions {
  affinity?: RangeDirection | null;
}

export interface EditorStringOptions {
  voids?: boolean;
}

export interface EditorUnhangRangeOptions {
  voids?: boolean;
}

export interface EditorVoidOptions {
  at?: Location;
  mode?: MaximizeMode;
  voids?: boolean;
}

export interface EditorStaticApi {
  /**
   * Get the ancestor above a location in the document.
   */
  above: <T extends Ancestor>(
    editor: Editor,
    options?: EditorAboveOptions<T>
  ) => NodeEntry<T> | undefined;

  /**
   * Add a custom property to the leaf text nodes in the current selection.
   *
   * If the selection is currently collapsed, the marks are stored by the
   * editor runtime and applied when text is inserted next.
   */
  addMark: (editor: Editor, key: string, value: any) => void;

  /**
   * Create a hidden, op-rebased bookmark for a range.
   */
  bookmark: (
    editor: Editor,
    range: Range,
    options?: BookmarkOptions
  ) => Bookmark;

  /**
   * Get the point after a location.
   */
  after: (
    editor: Editor,
    at: Location,
    options?: EditorAfterOptions
  ) => Point | undefined;

  /**
   * Get the point before a location.
   */
  before: (
    editor: Editor,
    at: Location,
    options?: EditorBeforeOptions
  ) => Point | undefined;

  /**
   * Delete content in the editor backward from the current selection.
   */
  deleteBackward: (
    editor: Editor,
    options?: EditorDirectedDeletionOptions
  ) => void;

  /**
   * Delete content in the editor forward from the current selection.
   */
  deleteForward: (
    editor: Editor,
    options?: EditorDirectedDeletionOptions
  ) => void;

  /**
   * Delete the content in the current selection.
   */
  deleteFragment: (
    editor: Editor,
    options?: EditorFragmentDeletionOptions
  ) => void;

  delete: TextMutationMethods['delete'];

  collapse: SelectionMutationMethods['collapse'];

  deselect: SelectionMutationMethods['deselect'];

  /**
   * Get the start and end points of a location.
   */
  edges: (editor: Editor, at: Location) => [Point, Point];

  /**
   * Get the current operation queue through the explicit read boundary.
   */
  getOperations: <V extends Value>(
    editor: Editor<V>,
    startIndex?: number
  ) => readonly Operation<V>[];

  /**
   * Derive operation dirtiness metadata without rebuilding a snapshot.
   */
  getOperationDirtiness: <V extends Value>(
    editor: Editor<V>,
    operations: readonly Operation<V>[],
    options?: EditorOperationDirtinessOptions<V>
  ) => EditorCommit<V>;

  /**
   * Get the latest committed transaction metadata.
   */
  getLastCommit: <V extends Value>(editor: Editor<V>) => EditorCommit<V> | null;

  /**
   * Return document state patches that are marked for collaboration.
   */
  getCollabStatePatches: <V extends Value>(
    editor: Editor<V>,
    commit: EditorCommit<V>
  ) => readonly EditorStatePatch[];

  /**
   * Get the extension registry for an editor.
   */
  getExtensionRegistry: (editor: Editor) => EditorExtensionRegistry;

  /**
   * Resolve the current live path for a runtime id without rebuilding a snapshot.
   */
  getPathByRuntimeId: (editor: Editor, runtimeId: RuntimeId) => Path | null;

  /**
   * Get the runtime id for a live node path without rebuilding a snapshot.
   */
  getRuntimeId: (editor: Editor, path: Path) => RuntimeId | null;

  /**
   * Run a coherent synchronous read against the current editor/runtime state.
   */
  read: <V extends Value, T>(
    editor: Editor<V>,
    fn: (state: EditorStateView<V>) => T
  ) => T;

  /**
   * Match a read-only element in the current branch of the editor.
   */
  elementReadOnly: (
    editor: Editor,
    options?: EditorElementReadOnlyOptions
  ) => NodeEntry<Element> | undefined;

  /**
   * Get the first node at a location.
   */
  first: (editor: Editor, at: Location) => NodeEntry;

  /**
   * Get the current children through the public accessor boundary.
   */
  getChildren: <V extends Value>(editor: Editor<V>) => V;

  /**
   * Get the current selection through the selection freshness runtime.
   */
  getSelection: (editor: Editor) => Selection;

  /**
   * Get the fragment at a location.
   */
  fragment: <V extends Value>(
    editor: Editor<V>,
    at: Location
  ) => DescendantIn<V>[];

  /**
   * Get the current dirty-path derivation for an operation.
   */
  getDirtyPaths: <V extends Value>(
    editor: Editor<V>,
    operation: Operation<V>
  ) => Path[];

  /**
   * Get the fragment at the current selection.
   */
  getFragment: <V extends Value>(editor: Editor<V>) => DescendantIn<V>[];

  /**
   * Get the current immutable snapshot of editor state.
   */
  getSnapshot: <V extends Value>(editor: Editor<V>) => EditorSnapshot<V>;

  /**
   * Check if a node has block children.
   */
  hasBlocks: (editor: Editor, element: Element) => boolean;

  /**
   * Check if a node has inline and text children.
   */
  hasInlines: (editor: Editor, element: Element) => boolean;

  hasPath: (editor: Editor, path: Path) => boolean;

  /**
   * Check if a node has text children.
   */
  hasTexts: (editor: Editor, element: Element) => boolean;

  /**
   * Insert a block break at the current selection.
   *
   * If the selection is currently expanded, it will be deleted first.
   */
  insertBreak: (editor: Editor) => void;

  /**
   * Inserts a fragment
   * at the specified location or (if not defined) the current selection or (if not defined) the end of the document.
   */
  insertFragment: <V extends Value>(
    editor: Editor<V>,
    fragment: DescendantIn<V>[],
    options?: TextInsertFragmentOptions
  ) => void;

  /**
   * Atomically inserts `nodes`
   * at the specified location or (if not defined) the current selection or (if not defined) the end of the document.
   */
  insertNode: <V extends Value, T extends ElementOrTextIn<V>>(
    editor: Editor<V>,
    node: T,
    options?: NodeInsertNodesOptions<T>
  ) => void;

  insertNodes: NodeMutationMethods['insertNodes'];

  /**
   * Insert a soft break at the current selection.
   *
   * If the selection is currently expanded, it will be deleted first.
   */
  insertSoftBreak: (editor: Editor) => void;

  /**
   * Insert a string of text
   * at the specified location or (if not defined) the current selection or (if not defined) the end of the document.
   */
  insertText: (
    editor: Editor,
    text: string,
    options?: TextInsertTextOptions
  ) => void;

  mergeNodes: NodeMutationMethods['mergeNodes'];

  move: SelectionMutationMethods['move'];

  moveNodes: NodeMutationMethods['moveNodes'];

  /**
   * Check if a value is a block `Element` object.
   */
  isBlock: (editor: Editor, value: Element) => boolean;

  /**
   * Check if a point is an edge of a location.
   */
  isEdge: (editor: Editor, point: Point, at: Location) => boolean;

  /**
   * Check if a value is an `Editor` object.
   */
  isEditor: (
    value: unknown,
    options?: EditorIsEditorOptions
  ) => value is Editor;

  /**
   * Check if a value is a read-only `Element` object.
   */
  isElementReadOnly: (editor: Editor, element: Element) => boolean;

  /**
   * Check if an element is empty, accounting for void nodes.
   */
  isEmpty: (editor: Editor, element: Element) => boolean;

  /**
   * Check if a point is the end point of a location.
   */
  isEnd: (editor: Editor, point: Point, at: Location) => boolean;

  /**
   * Check if a value is an inline `Element` object.
   */
  isInline: (editor: Editor, value: Element) => boolean;

  /**
   * Check if the editor is currently normalizing after each operation.
   */
  isNormalizing: (editor: Editor) => boolean;

  /**
   * Check if a value is a selectable `Element` object.
   */
  isSelectable: (editor: Editor, element: Element) => boolean;

  /**
   * Check if a point is the start point of a location.
   */
  isStart: (editor: Editor, point: Point, at: Location) => boolean;

  /**
   * Check if a value is a void `Element` object.
   */
  isVoid: (editor: Editor, value: Element) => boolean;

  /**
   * Get the last node at a location.
   */
  last: (editor: Editor, at: Location) => NodeEntry;

  /**
   * Get the leaf text node at a location.
   */
  leaf: (
    editor: Editor,
    at: Location,
    options?: EditorLeafOptions
  ) => NodeEntry<Text>;

  /**
   * Iterate through all of the levels at a location.
   */
  levels: <T extends Node>(
    editor: Editor,
    options?: EditorLevelsOptions<T>
  ) => Generator<NodeEntry<T>, void, undefined>;

  liftNodes: NodeMutationMethods['liftNodes'];

  /**
   * Get the matching node in the branch of the document after a location.
   */
  next: <T extends Descendant>(
    editor: Editor,
    options?: EditorNextOptions<T>
  ) => NodeEntry<T> | undefined;

  /**
   * Normalize any dirty objects in the editor.
   */
  normalize: (editor: Editor, options?: EditorNormalizeOptions) => void;

  /**
   * Get the parent node of a location.
   */
  parent: (
    editor: Editor,
    at: Location,
    options?: EditorParentOptions
  ) => NodeEntry<Ancestor>;

  /**
   * Get the path of a location.
   */
  path: (editor: Editor, at: Location, options?: EditorPathOptions) => Path;

  /**
   * Create a mutable ref for a `Path` object, which will stay in sync as new
   * operations are applied to the editor.
   */
  pathRef: (
    editor: Editor,
    path: Path,
    options?: EditorPathRefOptions
  ) => PathRef;

  /**
   * Get the set of currently tracked path refs of the editor.
   */
  pathRefs: (editor: Editor) => Set<PathRef>;

  /**
   * Get the start or end point of a location.
   */
  point: (editor: Editor, at: Location, options?: EditorPointOptions) => Point;

  /**
   * Create a mutable ref for a `Point` object, which will stay in sync as new
   * operations are applied to the editor.
   */
  pointRef: (
    editor: Editor,
    point: Point,
    options?: EditorPointRefOptions
  ) => PointRef;

  /**
   * Get the set of currently tracked point refs of the editor.
   */
  pointRefs: (editor: Editor) => Set<PointRef>;

  projectRange: (
    editor: Editor,
    range: Range
  ) => readonly ProjectedRangeSegment[];

  /**
   * Return all the positions in `at` range where a `Point` can be placed.
   *
   * By default, moves forward by individual offsets at a time, but
   * the `unit` option can be used to to move by character, word, line, or block.
   *
   * The `reverse` option can be used to change iteration direction.
   *
   * Note: By default void nodes are treated as a single point and iteration
   * will not happen inside their content unless you pass in true for the
   * `voids` option, then iteration will occur.
   */
  positions: (
    editor: Editor,
    options?: EditorPositionsOptions
  ) => Generator<Point, void, undefined>;

  /**
   * Get the matching node in the branch of the document before a location.
   */
  previous: <T extends Node>(
    editor: Editor,
    options?: EditorPreviousOptions<T>
  ) => NodeEntry<T> | undefined;

  /**
   * Get a range of a location.
   */
  range: (editor: Editor, at: Location, to?: Location) => Range;

  /**
   * Create a mutable ref for a `Range` object, which will stay in sync as new
   * operations are applied to the editor.
   */
  rangeRef: (
    editor: Editor,
    range: Range,
    options?: EditorRangeRefOptions
  ) => RangeRef;

  /**
   * Get the set of currently tracked range refs of the editor.
   */
  rangeRefs: (editor: Editor) => Set<RangeRef>;

  /**
   * Register an extension capability value.
   */
  registerCapability: (
    editor: Editor,
    name: string,
    capability: unknown
  ) => () => void;

  /**
   * Register an extension normalizer placeholder.
   */
  registerNormalizer: (
    editor: Editor,
    id: string,
    normalizer: EditorNodeNormalizer
  ) => () => void;

  /**
   * Register an extension commit listener placeholder.
   */
  registerCommitListener: <V extends Value>(
    editor: Editor<V>,
    listener: EditorCommitListener<V>
  ) => () => void;

  /**
   * Define a typed command token.
   */
  defineCommand: <TCommand extends EditorCommand>(
    type: TCommand['type']
  ) => EditorCommandDefinition<TCommand>;

  /**
   * Register a command middleware handler for the editor.
   */
  registerCommand: <TCommand extends EditorCommand>(
    editor: Editor,
    command: EditorCommandReference<TCommand>,
    handler: EditorCommandHandler<TCommand>,
    options?: EditorCommandOptions
  ) => () => void;

  extend: <TEditor extends Editor>(
    editor: TEditor,
    extension: EditorExtensionInput<TEditor>
  ) => () => void;

  defineEditorExtension: <TEditor extends BaseEditor<any> = Editor>(
    extension: EditorExtension<TEditor>
  ) => EditorExtension<TEditor>;

  replace: <V extends Value>(
    editor: Editor<V>,
    input: SnapshotInput<V>
  ) => void;

  reset: <V extends Value>(editor: Editor<V>, input: SnapshotInput<V>) => void;

  /**
   * Remove a custom property from all of the leaf text nodes in the current
   * selection.
   *
   * If the selection is currently collapsed, the removal is stored by the
   * editor runtime and applied to the text inserted next.
   */
  removeMark: (editor: Editor, key: string) => void;

  removeNodes: NodeMutationMethods['removeNodes'];

  select: SelectionMutationMethods['select'];

  setPoint: SelectionMutationMethods['setPoint'];

  setNodes: NodeMutationMethods['setNodes'];

  setSelection: SelectionMutationMethods['setSelection'];

  splitNodes: NodeMutationMethods['splitNodes'];

  /**
   * Toggle a custom property on the leaf text nodes in the current selection.
   *
   * If the selection is collapsed, the mark is stored for the next inserted
   * text.
   */
  toggleMark: (editor: Editor, key: string, value?: any) => void;

  unsetNodes: NodeMutationMethods['unsetNodes'];

  unwrapNodes: NodeMutationMethods['unwrapNodes'];

  wrapNodes: NodeMutationMethods['wrapNodes'];

  /**
   * Manually set if the editor should currently be normalizing.
   *
   * Note: Using this incorrectly can leave the editor in an invalid state.
   *
   */
  setNormalizing: (editor: Editor, isNormalizing: boolean) => void;

  /**
   * Get the text string content of a location.
   *
   * Note: by default the text of void nodes is considered to be an empty
   * string, regardless of content, unless you pass in true for the voids option
   */
  string: (
    editor: Editor,
    at: Location,
    options?: EditorStringOptions
  ) => string;

  subscribe: <V extends Value>(
    editor: Editor<V>,
    listener: SnapshotListener<V>
  ) => () => void;

  subscribeCommit: <V extends Value>(
    editor: Editor<V>,
    listener: (commit: EditorCommit<V>) => void
  ) => () => void;

  subscribeSource: <V extends Value>(
    editor: Editor<V>,
    source: EditorCommitSource,
    listener: SnapshotListener<V>
  ) => () => void;

  update: <V extends Value>(
    editor: Editor<V>,
    fn: (
      transaction: EditorUpdateTransaction<V>,
      context: EditorUpdateContext<Editor<V>>
    ) => void,
    options?: EditorUpdateOptions
  ) => void;

  /**
   * Convert a range into a non-hanging one.
   */
  unhangRange: (
    editor: Editor,
    range: Range,
    options?: EditorUnhangRangeOptions
  ) => Range;

  /**
   * Match a void node in the current branch of the editor.
   */
  void: (
    editor: Editor,
    options?: EditorVoidOptions
  ) => NodeEntry<Element> | undefined;

  /**
   * Call a function, deferring normalization until after it completes.
   */
  withoutNormalizing: (editor: Editor, fn: () => void) => void;

  /**
   *  Call a function, Determine whether or not remove the previous node when merge.
   */
  shouldMergeNodesRemovePrevNode: (
    editor: Editor,
    prevNodeEntry: NodeEntry,
    curNodeEntry: NodeEntry
  ) => boolean;
}

export interface InternalEditorStaticApi extends EditorStaticApi {}

const getImplicitSelectionRoot = (editor: Editor) =>
  getCurrentSelection(editor) ? getCurrentSelectionRoot(editor) : undefined;

const getWriteRoot = (editor: Editor, at: Location | undefined) =>
  at === undefined ? getImplicitSelectionRoot(editor) : getLocationRoot(at);

const isPathLocation = (value: Location | undefined): value is Path =>
  Array.isArray(value) && value.every((segment) => Number.isInteger(segment));

const runRootedInternalWrite = <T>(
  editor: Editor,
  fn: () => T,
  root?: string
): T =>
  root
    ? withEditorOperationRoot(editor, root, () =>
        withEditorOperationRootChildren(editor, root, fn)
      )
    : fn();

const runInternalEditorWrite = <T>(
  editor: Editor,
  fn: () => T,
  root?: string
): T => {
  const runRooted = <TReturn>(callback: () => TReturn) =>
    runRootedInternalWrite(editor, callback, root);

  if (isInTransaction(editor)) {
    return runRooted(fn);
  }

  let result!: T;

  const runUpdate = () => {
    editor.update(() => {
      result = fn();
    });
  };

  runRooted(runUpdate);

  return result;
};

const runInternalEditorWriteSkipNormalize = <T>(
  editor: Editor,
  fn: () => T,
  root?: string
): T => {
  if (isInTransaction(editor)) {
    return runRootedInternalWrite(editor, fn, root);
  }

  let result!: T;

  runRootedInternalWrite(
    editor,
    () => {
      editor.update(
        () => {
          result = fn();
        },
        { skipNormalize: true }
      );
    },
    root
  );

  return result;
};

const isEditorView = (editor: Editor): editor is EditorView =>
  (editor as { runtime?: EditorRuntime }).runtime?.editor !== undefined;

const replaceEditorSnapshot = (editor: Editor, input: SnapshotInput) => {
  if (isEditorView(editor)) {
    getEditorRuntime(editor).update((tx) => {
      tx.value.replace(input);
    });
    return;
  }

  replaceSnapshot(editor, input);
};

const InternalEditor: InternalEditorStaticApi = {
  above(editor, options) {
    return getEditorRuntime(editor).above(options);
  },

  addMark(editor, key, value) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).addMark(key, value),
      getImplicitSelectionRoot(editor)
    );
  },

  bookmark(editor, range, options) {
    return getEditorTransformRegistry(editor).bookmark(range, options);
  },

  after(editor, at, options) {
    return getEditorRuntime(editor).after(at, options);
  },

  before(editor, at, options) {
    return getEditorRuntime(editor).before(at, options);
  },

  deleteBackward(editor, options = {}) {
    const { unit = 'character' } = options;
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).deleteBackward(unit),
      getImplicitSelectionRoot(editor)
    );
  },

  deleteForward(editor, options = {}) {
    const { unit = 'character' } = options;
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).deleteForward(unit),
      getImplicitSelectionRoot(editor)
    );
  },

  deleteFragment(editor, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).deleteFragment(options),
      getImplicitSelectionRoot(editor)
    );
  },

  delete(editor, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).delete(options),
      getWriteRoot(editor, options?.at)
    );
  },

  collapse(editor, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).collapse(options),
      getImplicitSelectionRoot(editor)
    );
  },

  deselect(editor) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).deselect(),
      getImplicitSelectionRoot(editor)
    );
  },

  edges(editor, at) {
    return getEditorRuntime(editor).edges(at);
  },

  elementReadOnly(editor: Editor, options: EditorElementReadOnlyOptions = {}) {
    return getEditorRuntime(editor).elementReadOnly(options);
  },

  first(editor, at) {
    return getEditorRuntime(editor).first(at);
  },

  fragment<V extends Value>(editor: Editor<V>, at: Location) {
    return getEditorRuntime(editor).fragment(at) as DescendantIn<V>[];
  },

  getFragment(editor) {
    return editor.read((state) => state.fragment.get());
  },

  getChildren(editor) {
    return getEditorRuntime(editor).getChildren();
  },

  getLastCommit(editor) {
    return getEditorRuntime(editor).getLastCommit();
  },

  getCollabStatePatches(editor, commit) {
    return getEditorCollabStatePatches(editor, commit);
  },

  getOperationDirtiness(editor, operations, options) {
    return getEditorRuntime(editor).getOperationDirtiness(operations, options);
  },

  getDirtyPaths(editor, operation) {
    return getEditorRuntime(editor).getDirtyPaths(operation);
  },

  getExtensionRegistry(editor) {
    return getEditorExtensionRegistry(editor);
  },

  getSnapshot(editor) {
    return getEditorRuntime(editor).getSnapshot();
  },

  getOperations<V extends Value>(editor: Editor<V>, startIndex?: number) {
    return getEditorRuntime(editor).getOperations(
      startIndex
    ) as readonly Operation<V>[];
  },

  getPathByRuntimeId(editor, runtimeId) {
    return getEditorRuntime(editor).getPathByRuntimeId(runtimeId);
  },

  getRuntimeId(editor, path) {
    return getEditorRuntime(editor).getRuntimeId(path);
  },

  read(editor, fn) {
    return editor.read(fn);
  },

  getSelection(editor) {
    return getEditorRuntime(editor).getSelection();
  },

  hasBlocks(editor, element) {
    return getEditorRuntime(editor).hasBlocks(element);
  },

  hasInlines(editor, element) {
    return getEditorRuntime(editor).hasInlines(element);
  },

  hasPath(editor, path) {
    return getEditorRuntime(editor).hasPath(path);
  },

  hasTexts(editor, element) {
    return getEditorRuntime(editor).hasTexts(element);
  },

  insertBreak(editor) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).insertBreak(),
      getImplicitSelectionRoot(editor)
    );
  },

  insertFragment(editor, fragment, options) {
    runInternalEditorWrite(
      editor,
      () =>
        getEditorTransformRegistry(editor).insertFragment(fragment, options),
      getWriteRoot(editor, options?.at)
    );
  },

  insertNode(editor, node, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).insertNode(node, options),
      getWriteRoot(editor, options?.at)
    );
  },

  insertNodes(editor, nodes, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).insertNodes(nodes, options),
      getWriteRoot(editor, options?.at)
    );
  },

  insertSoftBreak(editor) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).insertSoftBreak(),
      getImplicitSelectionRoot(editor)
    );
  },

  insertText(editor, text, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).insertText(text, options),
      getWriteRoot(editor, options?.at)
    );
  },

  isBlock(editor, value) {
    return getEditorRuntime(editor).isBlock(value);
  },

  isEdge(editor, point, at) {
    return getEditorRuntime(editor).isEdge(point, at);
  },

  isEditor(value, options) {
    return isEditorValue(value, options);
  },

  isElementReadOnly(editor, element) {
    return getEditorSchema(editor).isReadOnly(element);
  },

  isEmpty(editor, element) {
    return getEditorRuntime(editor).isEmpty(element);
  },

  isEnd(editor, point, at) {
    return getEditorRuntime(editor).isEnd(point, at);
  },

  isInline(editor, value) {
    return getEditorSchema(editor).isInline(value);
  },

  isNormalizing(editor) {
    return getEditorRuntime(editor).isNormalizing();
  },

  isSelectable(editor: Editor, value: Element) {
    return getEditorSchema(editor).isSelectable(value);
  },

  isStart(editor, point, at) {
    return getEditorRuntime(editor).isStart(point, at);
  },

  isVoid(editor, value) {
    return getEditorSchema(editor).isVoid(value);
  },

  last(editor, at) {
    return getEditorRuntime(editor).last(at);
  },

  leaf(editor, at, options) {
    return getEditorRuntime(editor).leaf(at, options);
  },

  liftNodes(editor, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).liftNodes(options),
      getWriteRoot(editor, options?.at)
    );
  },

  levels(editor, options) {
    return getEditorRuntime(editor).levels(options);
  },

  next<T extends Descendant>(
    editor: Editor,
    options?: EditorNextOptions<T>
  ): NodeEntry<T> | undefined {
    return getEditorRuntime(editor).next(options);
  },

  normalize(editor, options) {
    runInternalEditorWrite(editor, () =>
      getEditorTransformRegistry(editor).normalize(options)
    );
  },

  mergeNodes(editor, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).mergeNodes(options),
      getWriteRoot(editor, options?.at)
    );
  },

  move(editor, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).move(options),
      getImplicitSelectionRoot(editor)
    );
  },

  moveNodes(editor, options) {
    if (isPathLocation(options.at) && options.at.length === 1) {
      return runInternalEditorWriteSkipNormalize(
        editor,
        () => getEditorTransformRegistry(editor).moveNodes(options),
        getWriteRoot(editor, options.at)
      );
    }

    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).moveNodes(options),
      getWriteRoot(editor, options.at)
    );
  },

  parent(editor, at, options) {
    return getEditorRuntime(editor).parent(at, options);
  },

  path(editor, at, options) {
    return getEditorRuntime(editor).path(at, options);
  },

  pathRef(editor, path, options) {
    return getEditorRuntime(editor).pathRef(path, options);
  },

  pathRefs(editor) {
    return getEditorRuntime(editor).pathRefs();
  },

  point(editor, at, options) {
    return getEditorRuntime(editor).point(at, options);
  },

  pointRef(editor, point, options) {
    return getEditorRuntime(editor).pointRef(point, options);
  },

  pointRefs(editor) {
    return getEditorRuntime(editor).pointRefs();
  },

  projectRange(editor, range) {
    return getEditorRuntime(editor).projectRange(range);
  },

  positions(editor, options) {
    return getEditorRuntime(editor).positions(options);
  },

  previous(editor, options) {
    return getEditorRuntime(editor).previous(options);
  },

  range(editor, at, to) {
    return getEditorRuntime(editor).range(at, to);
  },

  rangeRef(editor, range, options) {
    return getEditorRuntime(editor).rangeRef(range, options);
  },

  rangeRefs(editor) {
    return getEditorRuntime(editor).rangeRefs();
  },

  defineCommand(type) {
    return defineEditorCommand(type);
  },

  registerCommand(editor, type, handler, options) {
    return registerEditorCommand(editor, type, handler, options);
  },

  registerCapability(editor, name, capability) {
    return registerEditorCapability(editor, name, capability);
  },

  registerNormalizer(editor, id, normalizer) {
    return registerEditorNormalizer(editor, id, normalizer);
  },

  registerCommitListener(editor, listener) {
    return registerEditorCommitListener(
      editor,
      listener as EditorCommitListener<ValueOf<typeof editor>>
    );
  },

  extend(editor, extension) {
    return extendEditorCore(editor, extension);
  },

  defineEditorExtension(extension) {
    return defineEditorExtensionCore(
      extension as EditorExtension<any, any>
    ) as never;
  },

  replace(editor, input) {
    replaceEditorSnapshot(editor, input);
  },

  reset(editor, input) {
    replaceEditorSnapshot(editor, input);
  },

  removeMark(editor, key) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).removeMark(key),
      getImplicitSelectionRoot(editor)
    );
  },

  removeNodes(editor, options) {
    if (
      isPathLocation(options?.at) &&
      options.at.length === 1 &&
      getEditorRuntime(editor).getChildren().length > 1
    ) {
      return runInternalEditorWriteSkipNormalize(
        editor,
        () => getEditorTransformRegistry(editor).removeNodes(options),
        getWriteRoot(editor, options.at)
      );
    }

    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).removeNodes(options),
      getWriteRoot(editor, options?.at)
    );
  },

  select(editor, target) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).select(target),
      getLocationRoot(target) ?? getImplicitSelectionRoot(editor)
    );
  },

  setPoint(editor, props, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).setPoint(props, options),
      getImplicitSelectionRoot(editor)
    );
  },

  setNodes(editor, props, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).setNodes(props, options),
      getWriteRoot(editor, options?.at)
    );
  },

  setSelection(editor, props) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).setSelection(props),
      getImplicitSelectionRoot(editor)
    );
  },

  splitNodes(editor, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).splitNodes(options),
      getWriteRoot(editor, options?.at)
    );
  },

  toggleMark(editor, key, value = true) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).toggleMark(key, value),
      getImplicitSelectionRoot(editor)
    );
  },

  unsetNodes(editor, props, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).unsetNodes(props, options),
      getWriteRoot(editor, options?.at)
    );
  },

  unwrapNodes(editor, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).unwrapNodes(options),
      getWriteRoot(editor, options?.at)
    );
  },

  wrapNodes(editor, element, options) {
    runInternalEditorWrite(
      editor,
      () => getEditorTransformRegistry(editor).wrapNodes(element, options),
      getWriteRoot(editor, options?.at)
    );
  },

  setNormalizing(editor, isNormalizing) {
    runInternalEditorWrite(editor, () =>
      getEditorTransformRegistry(editor).setNormalizing(isNormalizing)
    );
  },

  string(editor, at, options) {
    return getEditorRuntime(editor).string(at, options);
  },

  subscribe(editor, listener) {
    return editor.subscribe(listener);
  },

  subscribeCommit(editor, listener) {
    return editor.subscribeCommit(listener);
  },

  subscribeSource(editor, source, listener) {
    return getEditorRuntime(editor).subscribeSource(source, listener);
  },

  update(editor, fn, options) {
    editor.update(fn, options);
  },

  unhangRange(editor, range, options) {
    return getEditorRuntime(editor).unhangRange(range, options);
  },

  void(editor, options) {
    return getEditorRuntime(editor).void(options);
  },

  withoutNormalizing(editor, fn: () => void) {
    runInternalEditorWrite(editor, () =>
      getEditorTransformRegistry(editor).withoutNormalizing(fn)
    );
  },
  shouldMergeNodesRemovePrevNode: (editor, prevNode, curNode) =>
    getEditorRuntime(editor).shouldMergeNodesRemovePrevNode(prevNode, curNode),
};

const Editor: EditorStaticApi = InternalEditor;

export { Editor, InternalEditor };

/**
 * A helper type for narrowing matched nodes with a predicate.
 */

export type NodeMatch<T extends Node> =
  | ((node: Node, path: Path) => node is T)
  | ((node: Node, path: Path) => boolean);

export type PropsCompare = (prop: unknown, node: unknown) => boolean;
export type PropsMerge = (prop: unknown, node: unknown) => object;
