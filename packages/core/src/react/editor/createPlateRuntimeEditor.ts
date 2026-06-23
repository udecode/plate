import type { KeyboardEventLike } from 'is-hotkey';
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';
import {
  createElement,
  type CSSProperties,
  type ElementType,
  Fragment,
  type ReactElement,
  type Ref,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useRef,
} from 'react';
import {
  defineEditorExtension,
  type Ancestor,
  type Descendant,
  ElementApi,
  type Element as SlateElement,
  type ElementOrTextIn,
  type EditorMarks,
  type EditorElementSpec,
  type EditorExtensionInput,
  type EditorUpdateContext,
  type EditorUpdateOptions,
  type EditorUpdateTransaction,
  type Location,
  LocationApi,
  type NodeEntry,
  NodeApi,
  type NodeIn,
  type NodeOperation,
  type NodeProps,
  type Operation,
  OperationApi,
  type Path,
  PathApi,
  type PathRef,
  type Point,
  PointApi,
  type PointRef,
  type Range,
  RangeApi,
  type Selection,
  type SelectionMoveOptions,
  type Text,
  TextApi,
  type TextInsertTextOptions,
  type TextUnit,
  type TextOperation,
  type Value,
} from '@platejs/slate';
import type { DOMRange } from '@platejs/slate-dom';
import {
  createReactEditor,
  type CreateReactEditorOptions,
  Editable,
  type EditableProps,
  type ReactEditor,
  type SlateChange,
  Slate,
  type SlateProps,
  useElementPath,
} from '@platejs/slate-react';
import type { UnionToIntersection } from '@udecode/utils';
import clsx from 'clsx';
import { nanoid } from 'nanoid';
import cloneDeep from 'lodash/cloneDeep.js';

import {
  getStoredCurrentRuntimeTransforms,
  setStoredCurrentRuntimeTransforms,
} from '../../internal/currentRuntimeTransformStore';
import { mergePlugins } from '../../internal/utils/mergePlugins';
import type {
  AnyPluginConfig,
  InferApi,
  InferTx,
  SlatePlugin,
} from '../../lib/plugin';
import { isCurrentEditorRoot } from '../../lib/plugins/chunking/ChunkingPlugin';
import { withChunking } from '../../lib/plugins/chunking/withChunking';
import {
  AUTO_SCROLL,
  type DomConfig,
  DOMPlugin,
  type ScrollIntoViewOptions,
} from '../../lib/plugins/dom/DOMPlugin';
import { createInputRuleBuilder } from '../../lib/plugins/input-rules/internal/createInputRuleBuilder';
import type {
  AnyInputRule,
  ResolvedInputRule,
  ResolvedInputRulesMeta,
} from '../../lib/plugins/input-rules/types';
import {
  type NodeIdOptions,
  NodeIdPlugin,
} from '../../lib/plugins/node-id/NodeIdPlugin';
import { withNodeId } from '../../lib/plugins/node-id/internal/withNodeId';
import { withBreakRules } from '../../lib/plugins/override/internal/withBreakRules';
import { withDeleteRules } from '../../lib/plugins/override/internal/withDeleteRules';
import { withMergeRules } from '../../lib/plugins/override/internal/withMergeRules';
import { withNormalizeRules } from '../../lib/plugins/override/internal/withNormalizeRules';
import { withOverrides } from '../../lib/plugins/override/OverridePlugin';
import { BaseParagraphPlugin } from '../../lib/plugins/paragraph/BaseParagraphPlugin';
import {
  type QueryNodeEntry,
  type QueryNodeOptions,
  queryNode,
} from '../../lib/utils/queryNode';
import type { PlatePlugin } from '../plugin/PlatePlugin';
import { EditorHotkeysEffect } from '../components/EditorHotkeysEffect';
import { createZustandStore } from '../libs/zustand';
import { PlateStoreProvider, withElementContext } from '../stores';

type PlateRuntimeBreakRuleAction =
  | 'default'
  | 'deleteExit'
  | 'exit'
  | 'lift'
  | 'lineBreak'
  | 'none'
  | 'reset';

type PlateRuntimeBreakRules = {
  default?: Exclude<PlateRuntimeBreakRuleAction, 'lift' | 'reset'>;
  empty?: PlateRuntimeBreakRuleAction;
  emptyLineEnd?: PlateRuntimeBreakRuleAction;
  splitReset?: boolean;
};

type PlateRuntimeDeleteRuleAction = 'default' | 'lift' | 'reset';

type PlateRuntimeDeleteRules = {
  empty?: Exclude<PlateRuntimeDeleteRuleAction, 'lift'>;
  start?: PlateRuntimeDeleteRuleAction;
};

type PlateRuntimeMergeRules = {
  removeEmpty?: boolean;
};

type PlateRuntimeNormalizeRules = {
  removeEmpty?: boolean;
};

type PlateRuntimeParserOptions = {
  data: string;
  dataTransfer: DataTransfer;
  mimeType: string;
};

type PlateRuntimeParser = {
  format?: string[] | string;
  mimeTypes?: string[];
  deserialize?: (
    ctx: RuntimePluginContext & PlateRuntimeParserOptions
  ) => Descendant[] | undefined;
  preInsert?: (
    ctx: RuntimePluginContext &
      PlateRuntimeParserOptions & { fragment: Descendant[] }
  ) => unknown;
  query?: (ctx: RuntimePluginContext & PlateRuntimeParserOptions) => boolean;
  transformData?: (
    ctx: RuntimePluginContext & PlateRuntimeParserOptions
  ) => string;
  transformFragment?: (
    ctx: RuntimePluginContext &
      PlateRuntimeParserOptions & { fragment: Descendant[] }
  ) => Descendant[];
};

type RuntimeNodeIdRecord = Record<string, unknown> & {
  _id?: unknown;
  children?: readonly Descendant[];
  type?: unknown;
};

type RuntimeNodeIdEntry = QueryNodeEntry<RuntimeNodeIdRecord>;

type RuntimeNodeIdNormalizeUpdate<V extends Value = Value> = {
  at: number[];
  props: Partial<NodeProps<NodeIn<V>>>;
};

type PlateRuntimeRuleMatch = (
  ctx: RuntimePluginContext & {
    node: unknown;
    path: number[];
    rule: string;
  }
) => boolean;

type PlateRuntimePlugin = {
  key: string;
  __apiExtensions?: unknown[];
  __configuration?:
    | ((ctx: RuntimePluginContext) => Partial<PlateRuntimePlugin>)
    | null;
  __configuredInputRules?: unknown[];
  __extensions?: ((ctx: RuntimePluginContext) => Partial<PlateRuntimePlugin>)[];
  __selectorExtensions?: ((
    ctx: RuntimePluginContext
  ) => Record<string, (...args: any[]) => unknown>)[];
  __txExtensions?: ((
    ctx: Omit<RuntimePluginContext, 'tf'>
  ) => NonNullable<PlateRuntimePlugin['tx']>)[];
  api?: Record<string, unknown>;
  dependencies?: string[];
  decorate?: unknown;
  editOnly?:
    | boolean
    | {
        handlers?: boolean;
        inject?: boolean;
        render?: boolean;
        transformInitialValue?: boolean;
      };
  enabled?: boolean;
  extendEditor?: unknown;
  handlers?: {
    onChange?: unknown;
    onKeyDown?: unknown;
    onNodeChange?: unknown;
    onTextChange?: unknown;
  };
  inject?: {
    nodeProps?: unknown;
    plugins?: Record<string, Partial<PlateRuntimePlugin>>;
    targetPlugins?: string[];
  };
  inputRules?: unknown[] | ((...args: never[]) => unknown[]);
  node?: {
    component?: unknown;
    isContainer?: boolean;
    isDecoration?: boolean;
    isElement?: boolean;
    isInline?: boolean;
    isLeaf?: boolean;
    isMarkableVoid?: boolean;
    isMetadataProp?: ((ctx: Record<string, unknown>) => boolean) | boolean;
    isSelectable?: boolean;
    isStrictSiblings?: boolean;
    isText?: boolean;
    isVoid?: boolean;
    leafProps?: unknown;
    textProps?: unknown;
    type?: string;
  };
  options?: Record<string, unknown>;
  optionsStore?: unknown;
  override?: {
    components?: Record<string, unknown>;
    enabled?: Record<string, boolean>;
    plugins?: Record<string, Partial<PlateRuntimePlugin>>;
  };
  parser?: PlateRuntimeParser;
  plugins?: PlateRuntimePlugin[];
  priority?: number;
  render?: {
    aboveEditable?: unknown;
    aboveNodes?: unknown;
    aboveSlate?: unknown;
    afterContainer?: unknown;
    afterEditable?: unknown;
    beforeContainer?: unknown;
    beforeEditable?: unknown;
    belowNodes?: unknown;
    belowRootNodes?: unknown;
    leaf?: unknown;
    node?: unknown;
    as?: unknown;
  };
  rules?: {
    break?: PlateRuntimeBreakRules;
    delete?: PlateRuntimeDeleteRules;
    match?: unknown;
    merge?: PlateRuntimeMergeRules;
    normalize?: PlateRuntimeNormalizeRules;
    selection?: {
      affinity?: 'directional' | 'hard' | 'outward';
    };
  };
  slateExtensions?: unknown[] | ((ctx: RuntimePluginContext) => unknown);
  runtimeDomExtension?: unknown;
  runtimeDomExtensionCleanup?: () => void;
  runtimeAffinity?: boolean;
  runtimeBlockquote?: boolean;
  runtimeBlockquoteCleanup?: () => void;
  runtimeBlockquoteExtension?: unknown;
  runtimeCaption?: boolean;
  runtimeComment?: boolean;
  runtimeCommentCleanup?: () => void;
  runtimeCommentExtension?: unknown;
  runtimeChunking?: boolean;
  runtimeCodeBlock?: boolean;
  runtimeCodeBlockCleanup?: () => void;
  runtimeCodeBlockExtension?: unknown;
  runtimeClassicTodoList?: boolean;
  runtimeDomOperations?: boolean;
  runtimeFootnote?: boolean;
  runtimeInputRules?: boolean;
  runtimeIndent?: boolean;
  runtimeIndentCleanup?: () => void;
  runtimeIndentExtension?: unknown;
  runtimeLayoutColumn?: boolean;
  runtimeLayoutColumnCleanup?: () => void;
  runtimeLayoutColumnExtension?: unknown;
  runtimeList?: boolean;
  runtimeListCleanup?: () => void;
  runtimeListExtension?: unknown;
  runtimeLength?: boolean;
  runtimeLengthCleanup?: () => void;
  runtimeLengthExtension?: unknown;
  runtimeLink?: boolean;
  runtimeLinkCleanup?: () => void;
  runtimeLinkExtension?: unknown;
  runtimeMultiSelect?: boolean;
  runtimeMultiSelectCleanup?: () => void;
  runtimeMultiSelectExtension?: unknown;
  runtimeNormalizeTypes?: boolean;
  runtimeNormalizeTypesCleanup?: () => void;
  runtimeNormalizeTypesExtension?: unknown;
  runtimeOverrideMergeRules?: boolean;
  runtimeOverrideMergeRulesCleanup?: () => void;
  runtimeOverrideMergeRulesExtension?: unknown;
  runtimeOverrideNormalizeRules?: boolean;
  runtimeOverrideNormalizeRulesCleanup?: () => void;
  runtimeOverrideNormalizeRulesExtension?: unknown;
  runtimeNavigationFeedback?: boolean;
  runtimeNodeId?: boolean;
  runtimeNodeIdCleanup?: () => void;
  runtimeNodeIdExtension?: unknown;
  runtimeParser?: boolean;
  runtimeSlateExtensionPipeline?: boolean;
  runtimeSlateExtensionPipelineCleanup?: () => void;
  runtimeSlateExtensionPipelineExtension?: unknown;
  runtimeSlateReactOverride?: boolean;
  runtimeSlateReactOverrideCleanup?: () => void;
  runtimeSlateReactOverrideExtension?: unknown;
  runtimeSingleBlock?: boolean;
  runtimeSingleBlockCleanup?: () => void;
  runtimeSingleBlockExtension?: unknown;
  runtimeSingleLine?: boolean;
  runtimeSingleLineCleanup?: () => void;
  runtimeSingleLineExtension?: unknown;
  runtimeTrailingBlock?: boolean;
  runtimeTrailingBlockCleanup?: () => void;
  runtimeTrailingBlockExtension?: unknown;
  runtimeToggle?: boolean;
  runtimeTriggerCombobox?: boolean;
  runtimeSlateExtensionsCleanup?: Array<() => void>;
  runtimeSlateExtensions?: unknown[];
  shortcuts?: Record<string, unknown>;
  transformInitialValue?: (
    ctx: RuntimePluginContext & { value: Value }
  ) => Value | undefined;
  runtimeTransforms?: PlateRuntimeTransforms;
  tx?: Record<
    string,
    (
      transaction: EditorUpdateTransaction,
      editor: PlateRuntimeEditor,
      context: EditorUpdateContext<PlateRuntimeEditor>
    ) => Record<string, unknown>
  >;
  useHooks?: (ctx: RuntimePluginContext) => void;
  [key: string]: unknown;
};

type PlateRuntimeFocusOptions = {
  /** Target location to select before focusing. */
  at?: Location;
  /** Focus at a location edge or at the primary editor edge. */
  edge?: 'end' | 'endEditor' | 'start' | 'startEditor';
  /** Number of times to retry DOM focus. */
  retries?: number;
};

type PlateRuntimeFocusTransform = (options?: PlateRuntimeFocusOptions) => void;

type PlateRuntimeResetOptions = {
  /** When true, only reset the document children. */
  children?: boolean;
  /** When true, select the start of the reset document. */
  select?: boolean;
};

type PlateRuntimeResetTransform = (options?: PlateRuntimeResetOptions) => void;

type PlateRuntimeResetBlockOptions = {
  at?: Location;
};

type PlateRuntimeResetBlockTransform = (
  options?: PlateRuntimeResetBlockOptions
) => boolean | void;

type PlateRuntimeNodeMatch =
  | ((node: unknown, path: number[]) => boolean)
  | Record<string, readonly unknown[] | unknown>;

type PlateRuntimeLiftBlockOptions = {
  at?: Location;
  match?: PlateRuntimeNodeMatch;
};

type PlateRuntimeLiftBlockTransform = (
  options?: PlateRuntimeLiftBlockOptions
) => boolean | void;

type PlateRuntimeInsertExitBreakOptions = {
  at?: Location;
  match?: PlateRuntimeNodeMatch;
  reverse?: boolean;
};

type PlateRuntimeInsertExitBreakTransform = (
  options?: PlateRuntimeInsertExitBreakOptions
) => boolean | void;

type PlateRuntimeInitOptions<
  V extends Value,
  TExtensions extends readonly unknown[],
> = {
  autoSelect?: boolean | 'end' | 'start';
  selection?: Selection;
  shouldNormalizeEditor?: boolean;
  value?: unknown;
  onReady?: (ctx: {
    editor: PlateRuntimeEditor<V, TExtensions>;
    isAsync: boolean;
    value: V;
  }) => void;
};

type PlateRuntimeInitTransform<
  V extends Value,
  TExtensions extends readonly unknown[],
> = (options?: PlateRuntimeInitOptions<V, TExtensions>) => boolean | void;

type PlateRuntimeSetValueTransform<V extends Value> = (
  value?: V | string
) => void;

type RuntimeInsertTextOptions = TextInsertTextOptions & {
  at?: unknown;
  marks?: boolean;
};

type RuntimeTriggerComboboxOptions = {
  createComboboxInput?: (trigger: string) => SlateElement;
  trigger?: RegExp | readonly string[] | string;
  triggerPreviousCharPattern?: RegExp;
  triggerQuery?: (editor: unknown) => boolean;
};

type RuntimeNormalizeTypesRule = {
  path: number[];
  strictType?: string;
  type?: string;
};

type RuntimeNormalizeTypesOptions = {
  onError?: (error: unknown) => void;
  rules?: RuntimeNormalizeTypesRule[];
};

type RuntimeTrailingBlockInsertOptions = {
  at: number[];
  insert: () => void;
  type: string;
};

type RuntimeTrailingBlockOptions = QueryNodeOptions & {
  insert?: (
    editor: unknown,
    options: RuntimeTrailingBlockInsertOptions
  ) => void;
  level?: number;
  type?: string;
};

type RuntimeBlockquoteChildrenTransaction<V extends Value> = {
  nodes: {
    insert: (
      nodes: ElementOrTextIn<V> | ElementOrTextIn<V>[],
      options?: { at?: Location }
    ) => void;
    remove: (options?: { at?: Location }) => void;
  };
};

type PlateRuntimeCoreTransforms<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = {
  deleteBackward: (unit?: TextUnit) => boolean | void;
  deleteForward: (unit?: TextUnit) => boolean | void;
  deleteFragment: (
    options?: Parameters<EditorUpdateTransaction['fragment']['delete']>[0]
  ) => boolean | void;
  escape: () => boolean;
  focus: PlateRuntimeFocusTransform;
  init: PlateRuntimeInitTransform<V, TExtensions>;
  insertBreak: () => boolean | void;
  insertData: (dataTransfer: DataTransfer) => boolean | void;
  insertExitBreak: PlateRuntimeInsertExitBreakTransform;
  insertFragment: (
    fragment: Parameters<
      EditorUpdateTransaction<V, TExtensions>['fragment']['insert']
    >[0],
    options?: Parameters<
      EditorUpdateTransaction<V, TExtensions>['fragment']['insert']
    >[1]
  ) => boolean | void;
  insertSoftBreak: () => boolean | void;
  insertText: (
    text: string,
    options?: RuntimeInsertTextOptions
  ) => boolean | void;
  liftBlock: PlateRuntimeLiftBlockTransform;
  move: (options?: SelectionMoveOptions) => boolean | void;
  moveLine: (options: { reverse: boolean }) => boolean;
  reset: PlateRuntimeResetTransform;
  resetBlock: PlateRuntimeResetBlockTransform;
  select: (target: Location, options?: { edge?: 'end' | 'start' }) => boolean;
  selectAll: () => boolean;
  setValue: PlateRuntimeSetValueTransform<V>;
  tab: (options: { reverse: boolean }) => boolean;
};

type PlateRuntimeTransforms<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = PlateRuntimeCoreTransforms<V, TExtensions> & Record<string, unknown>;

type PlateRuntimeApiExtension = {
  extension: (ctx: RuntimePluginContext) => Record<string, unknown>;
  source?: unknown;
  isOverride?: boolean;
  isPluginSpecific?: boolean;
  isTransform?: boolean;
};

type PlateRuntimeScrollTarget = DOMRange | Point;

type PlateRuntimeScrollApi = {
  scrollIntoView: (
    target: PlateRuntimeScrollTarget,
    options?: ScrollIntoViewOptions
  ) => void;
};

type DomConfigOptions = DomConfig['options'];

type PlateRuntimePluginInput = PlateRuntimePlugin | AnyPluginConfig;

type InferRuntimePluginTxProperty<TTx> = string extends keyof NonNullable<TTx>
  ? {}
  : NonNullable<TTx> extends Record<
        PropertyKey,
        (...args: infer _TArgs) => unknown
      >
    ? {
        [K in keyof NonNullable<TTx>]: NonNullable<TTx>[K] extends (
          ...args: infer _TGroupArgs
        ) => infer TGroup
          ? TGroup
          : never;
      }
    : NonNullable<TTx>;

type InferPlateRuntimePluginTx<P> =
  P extends PlatePlugin<infer C>
    ? InferTx<C>
    : P extends SlatePlugin<infer C>
      ? InferTx<C>
      : P extends AnyPluginConfig
        ? InferTx<P>
        : P extends { tx?: infer TTx }
          ? InferRuntimePluginTxProperty<TTx>
          : {};

type InferRuntimePluginApiProperty<TApi> =
  string extends keyof NonNullable<TApi> ? {} : NonNullable<TApi>;

type InferPlateRuntimePluginApi<P> =
  P extends PlatePlugin<infer C>
    ? InferApi<C>
    : P extends SlatePlugin<infer C>
      ? InferApi<C>
      : P extends AnyPluginConfig
        ? InferApi<P>
        : P extends { api?: infer TApi }
          ? InferRuntimePluginApiProperty<TApi>
          : {};

type PlateRuntimePluginStoreFactory = typeof createZustandStore;

type PlateRuntimePluginCache = {
  decorate: string[];
  handlers: {
    onChange: string[];
    onKeyDown: string[];
    onNodeChange: string[];
    onTextChange: string[];
  };
  inject: {
    nodeProps: string[];
  };
  node: {
    isContainer: string[];
    isLeaf: string[];
    isMetadataProp: string[];
    isText: string[];
    leafProps: string[];
    textProps: string[];
    types: Record<string, string>;
  };
  render: {
    aboveEditable: string[];
    aboveNodes: string[];
    aboveSlate: string[];
    afterContainer: string[];
    afterEditable: string[];
    beforeContainer: string[];
    beforeEditable: string[];
    belowNodes: string[];
    belowRootNodes: string[];
  };
  rules: { match: string[] };
  transformInitialValue: string[];
  useHooks: string[];
};

const plateRuntimeEditors = new WeakSet<object>();
const runtimeNavigationFeedbackTimeout = new WeakMap<
  object,
  ReturnType<typeof setTimeout>
>();
const runtimeNavigationFeedbackPulse = new WeakMap<object, number>();
const runtimeNavigationFeedbackAttributes = [
  'data-nav-cycle',
  'data-nav-highlight',
  'data-nav-pulse',
  'data-nav-target',
] as const;

const getPlateRuntimeTransforms = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
): PlateRuntimeTransforms<V, TExtensions> => {
  const transforms =
    getStoredCurrentRuntimeTransforms<PlateRuntimeTransforms<V, TExtensions>>(
      editor
    );

  if (!transforms) {
    throw new Error('[Plate] Runtime transforms are not installed.');
  }

  return transforms as PlateRuntimeTransforms<V, TExtensions>;
};

const setPlateRuntimeTransforms = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  transforms: PlateRuntimeTransforms<V, TExtensions>
) => {
  setStoredCurrentRuntimeTransforms(editor, transforms);
};

type RuntimeNavigationTarget = {
  path: number[];
  type: 'node';
};

type RuntimeNavigationActiveTarget = RuntimeNavigationTarget & {
  cycle: 0 | 1;
  duration: number;
  pulse: number;
  variant: string;
};

type RuntimeNavigationStoredTarget = Omit<
  RuntimeNavigationActiveTarget,
  'path'
> & {
  pathRef: PathRef;
};

type RuntimePluginContext = {
  api: unknown;
  editor: unknown;
  plugin: PlateRuntimePlugin;
  type: string;
  getOption: (key: string, ...args: unknown[]) => unknown;
  getOptions: () => Record<string, unknown>;
  setOption: (
    keyOrOptions: string | Record<string, unknown>,
    value?: unknown
  ) => void;
  setOptions: (
    options:
      | ((state: Record<string, unknown>) => void)
      | Record<string, unknown>
  ) => void;
};

export type PlateRuntimeDomState = {
  composing: boolean;
  currentKeyboardEvent: KeyboardEventLike | null;
  focused: boolean;
  prevSelection: Selection;
  readOnly: boolean;
};

export type PlateRuntimeMeta = {
  components: Record<string, unknown>;
  inputRules: ResolvedInputRulesMeta;
  isFallback: boolean;
  key: string;
  pluginCache: PlateRuntimePluginCache;
  pluginList: PlateRuntimePlugin[];
  shortcuts: Record<string, unknown>;
  uid?: string;
  userId?: string | null;
};

export type PlateRuntimeEditor<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
  P extends PlateRuntimePluginInput = PlateRuntimePluginInput,
> = Omit<ReactEditor<V, TExtensions>, 'api' | 'getApi' | 'update'> & {
  api: ReactEditor<V, TExtensions>['api'] &
    UnionToIntersection<InferPlateRuntimePluginApi<P>>;
  children: V;
  dom: PlateRuntimeDomState;
  getApi: ReactEditor<V, TExtensions>['getApi'];
  id: string;
  meta: PlateRuntimeMeta;
  plugins: Record<string, PlateRuntimePlugin>;
  selection: Selection;
  getPluginApi: (plugin: { key: string }) => Record<string, unknown>;
  getTransforms: (plugin: { key: string }) => PlateRuntimeTransforms<V, TExtensions>;
  getChunkSize?: (ancestor: Ancestor) => number | null;
  getInjectProps: (plugin: { key: string }) => PlateRuntimeInjectNodeProps;
  getOption: <T = unknown>(
    plugin: { key: string },
    key: string,
    ...args: unknown[]
  ) => T;
  update: {
    (
      fn: (
        transaction: EditorUpdateTransaction<V, TExtensions> &
          UnionToIntersection<InferPlateRuntimePluginTx<P>>,
        context: EditorUpdateContext<ReactEditor<V, TExtensions>>
      ) => void,
      options?: EditorUpdateOptions
    ): void;
    <TTx extends object>(
      fn: (
        transaction: EditorUpdateTransaction<V, TExtensions> &
          UnionToIntersection<InferPlateRuntimePluginTx<P>> &
          TTx,
        context: EditorUpdateContext<ReactEditor<V, TExtensions>>
      ) => void,
      options?: EditorUpdateOptions
    ): void;
  };
  getOptions: <T = Record<string, unknown>>(plugin: { key: string }) => T;
  getOptionsStore: (plugin: { key: string }) => unknown;
  getPlugin: <T extends PlateRuntimePlugin = PlateRuntimePlugin>(plugin: {
    key: string;
  }) => T;
  getType: (pluginKey: string) => string;
  setOption: (plugin: { key: string }, key: string, value: unknown) => void;
  setOptions: (
    plugin: { key: string },
    options:
      | ((state: Record<string, unknown>) => void)
      | Record<string, unknown>
  ) => void;
};

export const isPlateRuntimeEditor = (
  editor: unknown
): editor is PlateRuntimeEditor =>
  typeof editor === 'object' &&
  editor !== null &&
  plateRuntimeEditors.has(editor);

export type CreatePlateRuntimeEditorOptions<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
  P extends PlateRuntimePluginInput = PlateRuntimePluginInput,
> = CreateReactEditorOptions<V, TExtensions> & {
  id?: string;
  optionsStoreFactory?: PlateRuntimePluginStoreFactory;
  plugins?: P[];
  readOnly?: boolean;
  uid?: string;
  userId?: string | null;
};

export type PlateRuntimeSlateProps<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Omit<SlateProps<V, TExtensions>, 'children' | 'editor' | 'readOnly'> & {
  children?: ReactNode;
  editor: PlateRuntimeEditor<V, TExtensions>;
  readOnly?: boolean;
};

export type PlateRuntimeEditableProps<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
  T = unknown,
  TElement extends SlateElement = SlateElement,
> = EditableProps<T, TElement> & {
  editor: PlateRuntimeEditor<V, TExtensions>;
  renderEditable?: (editable: ReactElement) => ReactNode;
};

export type PlateRuntimeContentProps<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
  T = unknown,
  TElement extends SlateElement = SlateElement,
> = Omit<PlateRuntimeSlateProps<V, TExtensions>, 'children'> & {
  editableProps?: Omit<
    PlateRuntimeEditableProps<V, TExtensions, T, TElement>,
    'editor' | 'readOnly'
  >;
};

type PlateRuntimeEditableSiblingProps<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
  T = unknown,
  TElement extends SlateElement = SlateElement,
> = EditableProps<T, TElement> & {
  editor: PlateRuntimeEditor<V, TExtensions>;
};

type PlateRuntimeRenderElementProps<
  TElement extends SlateElement = SlateElement,
> = Parameters<
  NonNullable<EditableProps<unknown, TElement>['renderElement']>
>[0];

type PlateRuntimeDecorate<T = unknown> = NonNullable<
  EditableProps<T>['decorate']
>;

type PlateRuntimeDecoration<T = unknown> = ReturnType<
  PlateRuntimeDecorate<T>
>[number];

type PlateRuntimeElementComponentProps<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
  TElement extends SlateElement = SlateElement,
> = PlateRuntimeRenderElementProps<TElement> &
  RuntimePluginContext & {
    editor: PlateRuntimeEditor<V, TExtensions>;
    path: Path;
    plugin: PlateRuntimePlugin;
  };

type PlateRuntimeElementAttributes<
  TElement extends SlateElement = SlateElement,
> = PlateRuntimeRenderElementProps<TElement>['attributes'] & {
  className?: string;
  style?: CSSProperties;
};

type PlateRuntimeInjectNodeProps = {
  classNames?: Record<string, string>;
  defaultNodeValue?: unknown;
  nodeKey?: string;
  query?: (ctx: PlateRuntimeInjectTransformContext) => boolean;
  styleKey?: string;
  transformClassName?: (ctx: PlateRuntimeInjectTransformContext) => string;
  transformNodeValue?: (ctx: PlateRuntimeInjectTransformContext) => unknown;
  transformProps?: (
    ctx: PlateRuntimeInjectTransformContext & {
      props: Record<string, unknown>;
    }
  ) => Record<string, unknown> | undefined;
  transformStyle?: (
    ctx: PlateRuntimeInjectTransformContext
  ) => CSSProperties | undefined;
  validNodeValues?: readonly unknown[];
};

type PlateRuntimeInjectNodeContext = {
  attributes?: PlateRuntimeElementAttributes;
  className?: string;
  element?: SlateElement;
  path?: Path;
  style?: CSSProperties;
};

type PlateRuntimeInjectTransformContext = RuntimePluginContext &
  PlateRuntimeInjectNodeProps &
  PlateRuntimeInjectNodeContext & {
    nodeProps: PlateRuntimeInjectNodeContext;
    nodeValue: unknown;
    value?: unknown;
  };

const parseRuntimeElementPath = <TElement extends SlateElement>(
  props: PlateRuntimeRenderElementProps<TElement>
): Path => {
  const path = props.attributes['data-slate-path'];

  if (!path) return [];

  return path.split(',').map((segment) => Number(segment));
};

const PlateRuntimeDefaultElement = <TElement extends SlateElement>({
  as = 'div',
  attributes,
  children,
}: PlateRuntimeRenderElementProps<TElement> & {
  as?: keyof HTMLElementTagNameMap;
}) => createElement(as, attributes, children);

const PlateRuntimePluginHooks = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>({
  editor,
  plugin,
}: {
  editor: PlateRuntimeEditor<V, TExtensions>;
  plugin: PlateRuntimePlugin;
}): null => {
  plugin.useHooks?.(createRuntimePluginContext(editor, plugin));

  return null;
};

const isRuntimeReactComponent = <TProps extends object>(
  component: unknown
): component is ElementType<TProps> =>
  typeof component === 'function' ||
  typeof component === 'string' ||
  (typeof component === 'object' &&
    component !== null &&
    '$$typeof' in component);

const getRuntimeReactComponent = <TProps extends object>(
  pluginKey: string,
  slot: string,
  component: unknown
): ElementType<TProps> => {
  if (isRuntimeReactComponent<TProps>(component)) {
    return component;
  }

  throw new Error(
    `[Plate] Plugin "${pluginKey}" ${slot} must be a React component.`
  );
};

type PlateRuntimeNodeWrapperProps<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
  TElement extends SlateElement = SlateElement,
> = PlateRuntimeElementComponentProps<V, TExtensions, TElement> & {
  key: string;
};

type PlateRuntimeNodeWrapper<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
  TElement extends SlateElement = SlateElement,
> = (props: PlateRuntimeNodeWrapperProps<V, TExtensions, TElement>) =>
  | ((
      props: PlateRuntimeNodeWrapperProps<V, TExtensions, TElement> & {
        children?: ReactNode;
      }
    ) => ReactNode)
  | null
  | undefined;

const getRuntimeNodeWrapper = <
  V extends Value,
  const TExtensions extends readonly unknown[],
  TElement extends SlateElement,
>(
  pluginKey: string,
  slot: string,
  wrapper: unknown
): PlateRuntimeNodeWrapper<V, TExtensions, TElement> => {
  if (typeof wrapper === 'function') {
    return wrapper as PlateRuntimeNodeWrapper<V, TExtensions, TElement>;
  }

  throw new Error(`[Plate] Plugin "${pluginKey}" ${slot} must be a function.`);
};

const isRuntimeRenderEditOnly = (
  readOnly: boolean,
  plugin: PlateRuntimePlugin
) => {
  if (!readOnly) return false;
  if (plugin.editOnly === true) return true;
  if (typeof plugin.editOnly !== 'object' || plugin.editOnly === null) {
    return false;
  }

  return (plugin.editOnly as { render?: boolean }).render ?? true;
};

const isRuntimeInjectEditOnly = (
  readOnly: boolean,
  plugin: PlateRuntimePlugin
) => {
  if (!readOnly) return false;
  if (plugin.editOnly === true) return true;
  if (typeof plugin.editOnly !== 'object' || plugin.editOnly === null) {
    return false;
  }

  return (plugin.editOnly as { inject?: boolean }).inject ?? true;
};

const asRuntimeInjectNodeProps = (
  nodeProps: unknown
): PlateRuntimeInjectNodeProps | null => {
  if (typeof nodeProps !== 'object' || nodeProps === null) return null;

  return nodeProps as PlateRuntimeInjectNodeProps;
};

const hasDefinedRuntimeValue = (value: unknown) =>
  value !== undefined && value !== null;

const includesRuntimeValue = (
  values: readonly unknown[] | undefined,
  value: unknown
) => values?.some((candidate) => Object.is(candidate, value)) ?? true;

const matchesRuntimeInjectTarget = (
  injectingPlugin: PlateRuntimePlugin,
  renderedPlugin: PlateRuntimePlugin,
  element: SlateElement
) => {
  const targetPlugins = injectingPlugin.inject?.targetPlugins;

  if (!targetPlugins || targetPlugins.length === 0) return true;

  const type = typeof element.type === 'string' ? element.type : undefined;

  return (
    targetPlugins.includes(renderedPlugin.key) ||
    (type ? targetPlugins.includes(type) : false)
  );
};

const getRuntimeInjectedElementAttributes = <
  V extends Value,
  const TExtensions extends readonly unknown[],
  TElement extends SlateElement,
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  renderedPlugin: PlateRuntimePlugin,
  renderProps: PlateRuntimeRenderElementProps<TElement>
): PlateRuntimeElementAttributes<TElement> => {
  let attributes =
    renderProps.attributes as PlateRuntimeElementAttributes<TElement>;

  editor.meta.pluginCache.inject.nodeProps.forEach((key) => {
    const injectingPlugin = editor.getPlugin({ key });
    const injectNodeProps = asRuntimeInjectNodeProps(
      injectingPlugin.inject?.nodeProps
    );

    if (!injectNodeProps) return;

    const nodeKey =
      injectNodeProps.nodeKey ?? editor.getType(injectingPlugin.key);
    const styleKey =
      injectNodeProps.styleKey === undefined
        ? nodeKey
        : injectNodeProps.styleKey;
    const nodeValue = (renderProps.element as Record<string, unknown>)[nodeKey];
    const path = parseRuntimeElementPath(renderProps);
    const nodeProps: PlateRuntimeInjectNodeContext = {
      attributes,
      className: attributes.className,
      element: renderProps.element,
      path,
      style: attributes.style,
    };
    const pluginContext = createRuntimePluginContext(editor, injectingPlugin);
    const transformContext: PlateRuntimeInjectTransformContext = {
      ...injectNodeProps,
      ...pluginContext,
      ...nodeProps,
      nodeProps,
      nodeValue,
    };
    const callTransformPropsForHookStability = () => {
      injectNodeProps.transformProps?.({
        ...transformContext,
        props: {},
      });
    };

    if (isRuntimeInjectEditOnly(editor.dom.readOnly, injectingPlugin)) {
      callTransformPropsForHookStability();

      return;
    }
    if (
      !matchesRuntimeInjectTarget(
        injectingPlugin,
        renderedPlugin,
        renderProps.element
      )
    ) {
      callTransformPropsForHookStability();

      return;
    }

    if (injectNodeProps.query?.(transformContext) === false) {
      callTransformPropsForHookStability();

      return;
    }

    const shouldInject =
      injectNodeProps.transformProps ||
      (hasDefinedRuntimeValue(nodeValue) &&
        includesRuntimeValue(injectNodeProps.validNodeValues, nodeValue) &&
        !Object.is(nodeValue, injectNodeProps.defaultNodeValue));

    if (!shouldInject) return;

    const value =
      injectNodeProps.transformNodeValue?.(transformContext) ?? nodeValue;
    const valueKey = String(value);
    const nextContext: PlateRuntimeInjectTransformContext = {
      ...transformContext,
      value,
    };
    const nextProps: Record<string, unknown> = {};

    if (nodeKey && hasDefinedRuntimeValue(nodeValue)) {
      nextProps.className = `slate-${nodeKey}-${String(nodeValue)}`;
    }
    if (
      injectNodeProps.transformClassName ||
      injectNodeProps.classNames?.[valueKey]
    ) {
      nextProps.className =
        injectNodeProps.transformClassName?.(nextContext) ??
        injectNodeProps.classNames?.[valueKey];
    }
    if (styleKey) {
      nextProps.style =
        injectNodeProps.transformStyle?.(nextContext) ??
        ({
          [styleKey]: value,
        } as CSSProperties);
    }
    if (injectNodeProps.transformProps) {
      Object.assign(
        nextProps,
        injectNodeProps.transformProps({
          ...nextContext,
          props: nextProps,
        }) ?? nextProps
      );
    }

    const nextClassName =
      typeof nextProps.className === 'string' ? nextProps.className : undefined;
    const nextStyle =
      typeof nextProps.style === 'object' && nextProps.style !== null
        ? (nextProps.style as CSSProperties)
        : undefined;

    attributes = {
      ...attributes,
      ...nextProps,
      className: clsx(attributes.className, nextClassName) || undefined,
      style:
        attributes.style || nextStyle
          ? {
              ...attributes.style,
              ...nextStyle,
            }
          : undefined,
    };
  });

  return attributes;
};

const PlateRuntimeElementContent = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
  TElement extends SlateElement = SlateElement,
>({
  editor,
  plugin,
  renderProps,
}: {
  editor: PlateRuntimeEditor<V, TExtensions>;
  plugin: PlateRuntimePlugin;
  renderProps: PlateRuntimeRenderElementProps<TElement>;
}) => {
  const livePath = useElementPath();
  const path = livePath ?? parseRuntimeElementPath(renderProps);
  const component = plugin.render?.node ?? plugin.node?.component;
  const injectedAttributes = withElementContext(
    {
      element: renderProps.element,
      entry: [renderProps.element, path],
      path,
      scope: editor.id,
    },
    () => getRuntimeInjectedElementAttributes(editor, plugin, renderProps)
  );
  const injectedRenderProps = {
    ...renderProps,
    attributes: injectedAttributes,
  };
  const pluginContext = createRuntimePluginContext(editor, plugin);
  const baseProps: PlateRuntimeElementComponentProps<V, TExtensions, TElement> =
    {
      ...injectedRenderProps,
      ...pluginContext,
      editor,
      path,
      plugin,
    };

  let children = injectedRenderProps.children;

  editor.meta.pluginCache.render.belowNodes.forEach((key) => {
    const wrapperPlugin = editor.getPlugin({ key });

    if (isRuntimeRenderEditOnly(editor.dom.readOnly, wrapperPlugin)) return;

    const wrapper = getRuntimeNodeWrapper<V, TExtensions, TElement>(
      key,
      'render.belowNodes',
      wrapperPlugin.render?.belowNodes
    );
    const hoc = wrapper({ ...baseProps, children, key });

    if (hoc) {
      children = hoc({ ...baseProps, children, key });
    }
  });

  const belowRootNodes = editor.meta.pluginCache.render.belowRootNodes
    .map((key) => {
      const belowRootPlugin = editor.getPlugin({ key });

      if (isRuntimeRenderEditOnly(editor.dom.readOnly, belowRootPlugin)) {
        return null;
      }

      const Component = getRuntimeReactComponent<
        PlateRuntimeElementComponentProps<V, TExtensions, TElement>
      >(key, 'render.belowRootNodes', belowRootPlugin.render?.belowRootNodes);

      return createElement(Component, { ...baseProps, key });
    })
    .filter(Boolean);

  if (belowRootNodes.length > 0) {
    children = createElement(Fragment, null, children, ...belowRootNodes);
  }

  let renderedElement: ReactNode;

  if (!component) {
    renderedElement = createElement(PlateRuntimeDefaultElement<TElement>, {
      ...injectedRenderProps,
      as: plugin.render?.as as keyof HTMLElementTagNameMap,
      children,
    });
  } else {
    const Component = getRuntimeReactComponent<
      PlateRuntimeElementComponentProps<V, TExtensions, TElement>
    >(plugin.key, 'render.node', component);

    renderedElement = createElement(Component, { ...baseProps, children });
  }

  editor.meta.pluginCache.render.aboveNodes.forEach((key) => {
    const wrapperPlugin = editor.getPlugin({ key });

    if (isRuntimeRenderEditOnly(editor.dom.readOnly, wrapperPlugin)) return;

    const wrapper = getRuntimeNodeWrapper<V, TExtensions, TElement>(
      key,
      'render.aboveNodes',
      wrapperPlugin.render?.aboveNodes
    );
    const hoc = wrapper({ ...baseProps, children: renderedElement, key });

    if (hoc) {
      renderedElement = hoc({
        ...baseProps,
        children: renderedElement,
        key,
      });
    }
  });

  return renderedElement;
};

type PlateRuntimeKeyboardHandler<
  V extends Value,
  TExtensions extends readonly unknown[],
> = (
  ctx: RuntimePluginContext & {
    editor: PlateRuntimeEditor<V, TExtensions>;
    event: ReactKeyboardEvent;
  }
) => boolean | void;

const getRuntimeKeyboardHandler = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  handler: unknown
): PlateRuntimeKeyboardHandler<V, TExtensions> | null =>
  typeof handler === 'function'
    ? (handler as PlateRuntimeKeyboardHandler<V, TExtensions>)
    : null;

type PlateRuntimeChangeHandler<
  V extends Value,
  TExtensions extends readonly unknown[],
> = (
  ctx: RuntimePluginContext & {
    editor: PlateRuntimeEditor<V, TExtensions>;
    value: V;
  }
) => boolean | void;

const getRuntimeChangeHandler = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  handler: unknown
): PlateRuntimeChangeHandler<V, TExtensions> | null =>
  typeof handler === 'function'
    ? (handler as PlateRuntimeChangeHandler<V, TExtensions>)
    : null;

const pipeRuntimeChangeHandler = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  propsHandler?: (value: V, change: SlateChange<V>) => void
) => {
  if (editor.meta.pluginCache.handlers.onChange.length === 0 && !propsHandler) {
    return;
  }

  return (value: V, change: SlateChange<V>) => {
    const eventIsHandled = editor.meta.pluginCache.handlers.onChange.some(
      (key) => {
        const plugin = editor.getPlugin({ key });
        const handler = getRuntimeChangeHandler<V, TExtensions>(
          plugin.handlers?.onChange
        );

        if (!handler || editor.dom.readOnly) return false;

        const result = handler({
          ...createRuntimePluginContext(editor, plugin),
          editor,
          value,
        });

        return result ?? false;
      }
    );

    if (eventIsHandled) return;

    propsHandler?.(value, change);
  };
};

const pipeRuntimeKeyDownHandler = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  propsHandler?: (event: ReactKeyboardEvent) => boolean | void
) => {
  if (
    editor.meta.pluginCache.handlers.onKeyDown.length === 0 &&
    !propsHandler
  ) {
    return;
  }

  return (event: ReactKeyboardEvent) => {
    const eventIsHandled = editor.meta.pluginCache.handlers.onKeyDown.some(
      (key) => {
        const plugin = editor.getPlugin({ key });
        const handler = getRuntimeKeyboardHandler<V, TExtensions>(
          plugin.handlers?.onKeyDown
        );

        if (!handler) return false;

        const result = handler({
          ...createRuntimePluginContext(editor, plugin),
          editor,
          event,
        });

        return result ?? event.isPropagationStopped();
      }
    );

    if (eventIsHandled) return true;

    return propsHandler?.(event);
  };
};

type PlateRuntimeDecorateHandler<
  V extends Value,
  TExtensions extends readonly unknown[],
> = (
  ctx: RuntimePluginContext & {
    editor: PlateRuntimeEditor<V, TExtensions>;
    entry: Parameters<PlateRuntimeDecorate>[0];
    plugin: PlateRuntimePlugin;
  }
) => readonly unknown[] | undefined;

const getRuntimeDecorateHandler = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  decorate: unknown
): PlateRuntimeDecorateHandler<V, TExtensions> | null =>
  typeof decorate === 'function'
    ? (decorate as PlateRuntimeDecorateHandler<V, TExtensions>)
    : null;

const toRuntimeDecoration = <T>(
  decoration: unknown,
  fallbackKey: string
): PlateRuntimeDecoration<T> => {
  if (
    typeof decoration === 'object' &&
    decoration !== null &&
    'range' in decoration
  ) {
    return decoration as PlateRuntimeDecoration<T>;
  }

  if (RangeApi.isRange(decoration)) {
    const {
      anchor,
      focus,
      key,
      merge: _merge,
      ...data
    } = decoration as Range &
      Record<string, unknown> & {
        key?: unknown;
        merge?: unknown;
      };
    const decorationKey = typeof key === 'string' ? key : fallbackKey;
    const nextDecoration: {
      data?: T;
      key: string;
      range: Range;
    } = {
      key: decorationKey,
      range: { anchor, focus },
    };

    if (Object.keys(data).length > 0) {
      nextDecoration.data = data as T;
    }

    return nextDecoration as PlateRuntimeDecoration<T>;
  }

  return decoration as PlateRuntimeDecoration<T>;
};

const pipeRuntimeDecorate = <
  V extends Value,
  const TExtensions extends readonly unknown[],
  T,
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  propsDecorate?: PlateRuntimeDecorate<T>
): PlateRuntimeDecorate<T> | undefined => {
  if (editor.meta.pluginCache.decorate.length === 0 && !propsDecorate) {
    return;
  }

  return (entry, slateEditor) => {
    const decorations: PlateRuntimeDecoration<T>[] = [];

    editor.meta.pluginCache.decorate.forEach((key) => {
      const plugin = editor.getPlugin({ key });
      const decorate = getRuntimeDecorateHandler<V, TExtensions>(
        plugin.decorate
      );

      if (!decorate) return;

      const pluginDecorations = decorate({
        ...createRuntimePluginContext(editor, plugin),
        editor,
        entry,
        plugin,
      });

      decorations.push(
        ...(pluginDecorations ?? []).map((decoration, index) =>
          toRuntimeDecoration<T>(decoration, `${key}:${index}`)
        )
      );
    });

    if (propsDecorate) {
      decorations.push(
        ...propsDecorate(entry, slateEditor).map((decoration, index) =>
          toRuntimeDecoration<T>(decoration, `props:${index}`)
        )
      );
    }

    return decorations;
  };
};

const getRuntimePluginForElement = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  element: SlateElement
) => {
  const type = typeof element.type === 'string' ? element.type : undefined;
  const pluginKey = type
    ? (editor.meta.pluginCache.node.types[type] ?? type)
    : undefined;

  return pluginKey ? (editor.plugins[pluginKey] ?? null) : null;
};

const shouldRenderRuntimeElementPlugin = (plugin: PlateRuntimePlugin) =>
  Boolean(plugin.render?.node || plugin.node?.component || plugin.render?.as);

const hasRuntimeNodeRenderWrappers = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
) =>
  editor.meta.pluginCache.render.aboveNodes.length > 0 ||
  editor.meta.pluginCache.render.belowNodes.length > 0 ||
  editor.meta.pluginCache.render.belowRootNodes.length > 0;

const hasRuntimeNodePropsInjectors = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
) => editor.meta.pluginCache.inject.nodeProps.length > 0;

const pipeRuntimeRenderElement = <
  V extends Value,
  const TExtensions extends readonly unknown[],
  TElement extends SlateElement,
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  propsRenderElement?: (
    props: PlateRuntimeRenderElementProps<TElement>
  ) => ReactNode
) => {
  const hasNodeWrappers = hasRuntimeNodeRenderWrappers(editor);
  const hasNodePropsInjectors = hasRuntimeNodePropsInjectors(editor);

  if (
    Object.keys(editor.meta.pluginCache.node.types).length === 0 &&
    !hasNodeWrappers &&
    !hasNodePropsInjectors &&
    !propsRenderElement
  ) {
    return;
  }

  return (props: PlateRuntimeRenderElementProps<TElement>) => {
    const plugin = getRuntimePluginForElement(editor, props.element);

    if (
      plugin &&
      (shouldRenderRuntimeElementPlugin(plugin) ||
        hasNodeWrappers ||
        hasNodePropsInjectors)
    ) {
      return createElement(
        PlateRuntimeElementContent<V, TExtensions, TElement>,
        {
          ...createRuntimePluginContext(editor, plugin),
          editor,
          plugin,
          renderProps: props,
        }
      );
    }

    return propsRenderElement?.(props);
  };
};

type RuntimeNodeChangeHandler<
  V extends Value,
  TExtensions extends readonly unknown[],
> = (
  ctx: RuntimePluginContext & {
    editor: PlateRuntimeEditor<V, TExtensions>;
    node: Descendant;
    operation: NodeOperation;
    plugin: PlateRuntimePlugin;
    prevNode: Descendant;
  }
) => boolean | void;

type RuntimeTextChangeHandler<
  V extends Value,
  TExtensions extends readonly unknown[],
> = (
  ctx: RuntimePluginContext & {
    editor: PlateRuntimeEditor<V, TExtensions>;
    node: Descendant;
    operation: TextOperation;
    plugin: PlateRuntimePlugin;
    prevText: string;
    text: string;
  }
) => boolean | void;

type RuntimeSlateExtensionNodeOption<
  V extends Value,
  TExtensions extends readonly unknown[],
> = (ctx: {
  editor: PlateRuntimeEditor<V, TExtensions>;
  node: Descendant;
  operation: NodeOperation;
  prevNode: Descendant;
}) => void;

type RuntimeSlateExtensionTextOption<
  V extends Value,
  TExtensions extends readonly unknown[],
> = (ctx: {
  editor: PlateRuntimeEditor<V, TExtensions>;
  node: Descendant;
  operation: TextOperation;
  prevText: string;
  text: string;
}) => void;

const getRuntimeNodeChangeHandler = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  handler: unknown
): RuntimeNodeChangeHandler<V, TExtensions> | null =>
  typeof handler === 'function'
    ? (handler as RuntimeNodeChangeHandler<V, TExtensions>)
    : null;

const getRuntimeTextChangeHandler = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  handler: unknown
): RuntimeTextChangeHandler<V, TExtensions> | null =>
  typeof handler === 'function'
    ? (handler as RuntimeTextChangeHandler<V, TExtensions>)
    : null;

const getRuntimeSlateExtensionNodeOption = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  plugin: PlateRuntimePlugin
): RuntimeSlateExtensionNodeOption<V, TExtensions> | null => {
  const handler = plugin.options?.onNodeChange;

  return typeof handler === 'function'
    ? (handler as RuntimeSlateExtensionNodeOption<V, TExtensions>)
    : null;
};

const getRuntimeSlateExtensionTextOption = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  plugin: PlateRuntimePlugin
): RuntimeSlateExtensionTextOption<V, TExtensions> | null => {
  const handler = plugin.options?.onTextChange;

  return typeof handler === 'function'
    ? (handler as RuntimeSlateExtensionTextOption<V, TExtensions>)
    : null;
};

const pipeRuntimeNodeChangeHandlers = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  node: Descendant,
  prevNode: Descendant,
  operation: NodeOperation
) =>
  editor.meta.pluginCache.handlers.onNodeChange.some((key) => {
    const plugin = editor.getPlugin({ key });
    const handler = getRuntimeNodeChangeHandler<V, TExtensions>(
      plugin.handlers?.onNodeChange
    );

    if (!handler || editor.dom.readOnly) return false;

    return (
      handler({
        ...createRuntimePluginContext(editor, plugin),
        editor,
        node,
        operation,
        plugin,
        prevNode,
      }) ?? false
    );
  });

const pipeRuntimeTextChangeHandlers = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  node: Descendant,
  text: string,
  prevText: string,
  operation: TextOperation
) =>
  editor.meta.pluginCache.handlers.onTextChange.some((key) => {
    const plugin = editor.getPlugin({ key });
    const handler = getRuntimeTextChangeHandler<V, TExtensions>(
      plugin.handlers?.onTextChange
    );

    if (!handler || editor.dom.readOnly) return false;

    return (
      handler({
        ...createRuntimePluginContext(editor, plugin),
        editor,
        node,
        operation,
        plugin,
        prevText,
        text,
      }) ?? false
    );
  });

const createPlateRuntimePluginCache = (): PlateRuntimePluginCache => ({
  decorate: [],
  handlers: {
    onChange: [],
    onKeyDown: [],
    onNodeChange: [],
    onTextChange: [],
  },
  inject: {
    nodeProps: [],
  },
  node: {
    isContainer: [],
    isLeaf: [],
    isMetadataProp: [],
    isText: [],
    leafProps: [],
    textProps: [],
    types: {},
  },
  render: {
    aboveEditable: [],
    aboveNodes: [],
    aboveSlate: [],
    afterContainer: [],
    afterEditable: [],
    beforeContainer: [],
    beforeEditable: [],
    belowNodes: [],
    belowRootNodes: [],
  },
  rules: { match: [] },
  transformInitialValue: [],
  useHooks: [],
});

const createPlateRuntimeMeta = ({
  uid,
  userId,
}: Pick<
  CreatePlateRuntimeEditorOptions,
  'uid' | 'userId'
>): PlateRuntimeMeta => ({
  components: {},
  inputRules: {
    insertBreak: [],
    insertData: [],
    insertText: { all: [], byTrigger: {} },
    plugins: {},
  },
  isFallback: false,
  key: nanoid(),
  pluginCache: createPlateRuntimePluginCache(),
  pluginList: [],
  shortcuts: {},
  uid,
  userId,
});

const resolveRuntimeFocusTarget = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  { at, edge }: PlateRuntimeFocusOptions
): Location | null => {
  if (!at && !edge) return null;

  if (edge === 'startEditor' || edge === 'endEditor') {
    return getRuntimeEdgePoint(
      editor,
      [],
      edge === 'startEditor' ? 'start' : 'end'
    );
  }

  const target = at ?? editor.read((state) => state.selection.get());

  if (!target) return null;

  return edge === 'start' || edge === 'end'
    ? getRuntimeEdgePoint(editor, target, edge)
    : target;
};

const getRuntimeChildren = (node: unknown): readonly unknown[] | null => {
  if (Array.isArray(node)) return node;

  if (
    typeof node === 'object' &&
    node !== null &&
    'children' in node &&
    Array.isArray(node.children)
  ) {
    return node.children;
  }

  return null;
};

const isRuntimeTextNode = (node: unknown): node is { text: string } =>
  typeof node === 'object' &&
  node !== null &&
  'text' in node &&
  typeof node.text === 'string';

const isRuntimeElementNode = (node: unknown): node is SlateElement =>
  typeof node === 'object' &&
  node !== null &&
  !isRuntimeTextNode(node) &&
  'children' in node &&
  Array.isArray(node.children);

const getRuntimeNodeText = (node: unknown): string => {
  if (isRuntimeTextNode(node)) return node.text;

  const children = getRuntimeChildren(node);

  if (!children) return '';

  return children.map(getRuntimeNodeText).join('');
};

const toRuntimeMatchArray = (value: readonly unknown[] | unknown) =>
  Array.isArray(value) ? value : [value];

const matchesRuntimeNode = (
  node: unknown,
  path: number[],
  match?: PlateRuntimeNodeMatch
) => {
  if (!match) return true;

  if (typeof match === 'function') {
    return match(node, path);
  }

  if (node === null || typeof node !== 'object') return false;

  const record = node as Record<string, unknown>;

  return Object.entries(match).every(([key, value]) =>
    toRuntimeMatchArray(value).includes(record[key])
  );
};

const getRuntimeNodeAtPath = (
  root: Readonly<Value>,
  path: number[]
): unknown => {
  let node: unknown = root;

  for (const index of path) {
    const children = getRuntimeChildren(node);

    if (!children || !children[index]) {
      throw new Error(`Cannot find a node at path [${path}].`);
    }

    node = children[index];
  }

  return node;
};

const getRuntimeReadRoot = (root?: string) =>
  root === 'main' ? undefined : root;

const getRuntimeDescendant = <
  V extends Value,
  const TExtensions extends readonly unknown[],
  TNode extends Descendant = Descendant,
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  path: number[],
  root?: string
): TNode | undefined => {
  try {
    const rootValue = editor.read((state) =>
      state.value.root(getRuntimeReadRoot(root))
    );

    return getRuntimeNodeAtPath(rootValue, path) as TNode;
  } catch {
    return;
  }
};

type RuntimeNodeEntry = [node: unknown, path: number[]];

function* getRuntimeNodeEntries(
  node: unknown,
  path: number[] = []
): Generator<RuntimeNodeEntry> {
  if (path.length > 0) {
    yield [node, path];
  }

  const children = getRuntimeChildren(node);

  if (!children) return;

  for (let index = 0; index < children.length; index++) {
    yield* getRuntimeNodeEntries(children[index], [...path, index]);
  }
}

const getRuntimeRootNodeEntries = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
) =>
  Array.from(getRuntimeNodeEntries(editor.read((state) => state.value.root())));

const createRuntimePathRef = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  path: number[]
): PathRef => {
  let current: number[] | null = [...path];
  const unsubscribe = editor.subscribeCommit(({ operations }) => {
    if (!current) return;

    for (const operation of operations as readonly Operation[]) {
      current = PathApi.transform(current, operation) ?? null;

      if (!current) return;
    }
  });

  return {
    affinity: 'forward',
    get current() {
      return current;
    },
    unref() {
      const path = current;
      current = null;
      unsubscribe();

      return path;
    },
  };
};

const createRuntimePointRef = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  point: Point,
  options: { affinity?: PointRef['affinity'] } = {}
): PointRef => {
  let current: Point | null = { ...point, path: [...point.path] };
  const affinity = options.affinity ?? 'forward';
  const unsubscribe = editor.subscribeCommit(({ operations }) => {
    if (!current) return;

    for (const operation of operations as readonly Operation[]) {
      current = PointApi.transform(current, operation, { affinity }) ?? null;

      if (!current) return;
    }
  });

  return {
    affinity,
    get current() {
      return current;
    },
    unref() {
      const point = current;
      current = null;
      unsubscribe();

      return point;
    },
  };
};

const resolveRuntimeNavigationTarget = (
  target?: RuntimeNavigationStoredTarget | null
): RuntimeNavigationActiveTarget | null => {
  const path = target?.pathRef.current;

  if (!target || !path) return null;

  const { pathRef: _pathRef, ...rest } = target;

  return { ...rest, path };
};

const nextRuntimeNavigationPulse = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
) => {
  const pulse = (runtimeNavigationFeedbackPulse.get(editor) ?? 0) + 1;

  runtimeNavigationFeedbackPulse.set(editor, pulse);

  return pulse;
};

const clearRuntimeNavigationTimeout = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
) => {
  const timeoutId = runtimeNavigationFeedbackTimeout.get(editor);

  if (timeoutId) {
    clearTimeout(timeoutId);
    runtimeNavigationFeedbackTimeout.delete(editor);
  }
};

const getRuntimeNavigationElement = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  target: RuntimeNavigationActiveTarget | { path: number[] }
) => {
  const node = getRuntimeDescendant(editor, target.path);

  if (!node) return;

  try {
    return editor.api.dom.resolveDOMNode(node);
  } catch {
    return;
  }
};

const clearRuntimeNavigationElement = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  target?: RuntimeNavigationActiveTarget | null
) => {
  if (!target) return;

  const element = getRuntimeNavigationElement(editor, target);

  if (!element) return;

  for (const attribute of runtimeNavigationFeedbackAttributes) {
    element.removeAttribute(attribute);
  }

  element.style.removeProperty('--plate-nav-feedback-duration');
};

const setRuntimeNavigationElement = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  target: RuntimeNavigationActiveTarget
) => {
  const element = getRuntimeNavigationElement(editor, target);

  if (!element) return;

  element.setAttribute('data-nav-cycle', String(target.cycle));
  element.setAttribute('data-nav-highlight', target.variant);
  element.setAttribute('data-nav-pulse', String(target.pulse));
  element.setAttribute('data-nav-target', 'true');
  element.style.setProperty(
    '--plate-nav-feedback-duration',
    `${target.duration}ms`
  );
};

const clearRuntimeNavigationFeedbackTarget = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin,
  pulse?: number
) => {
  const storedTarget = editor.getOption<RuntimeNavigationStoredTarget | null>(
    plugin,
    'activeTarget'
  );

  if (!storedTarget) return false;
  if (pulse !== undefined && storedTarget.pulse !== pulse) return false;

  clearRuntimeNavigationTimeout(editor);
  clearRuntimeNavigationElement(
    editor,
    resolveRuntimeNavigationTarget(storedTarget)
  );
  storedTarget.pathRef.unref();
  editor.setOption(plugin, 'activeTarget', null);

  return true;
};

const flashRuntimeNavigationTarget = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin,
  {
    duration,
    target,
    variant = 'navigated',
  }: {
    duration?: number;
    target: RuntimeNavigationTarget;
    variant?: string;
  }
) => {
  if (!getRuntimeDescendant(editor, target.path)) return false;

  const pulse = nextRuntimeNavigationPulse(editor);
  const timeoutMs =
    duration ?? editor.getOption<number>(plugin, 'duration') ?? 800;
  const previousTarget = editor.getOption<RuntimeNavigationStoredTarget | null>(
    plugin,
    'activeTarget'
  );

  clearRuntimeNavigationTimeout(editor);
  clearRuntimeNavigationElement(
    editor,
    resolveRuntimeNavigationTarget(previousTarget)
  );
  previousTarget?.pathRef.unref();

  const activeTarget: RuntimeNavigationStoredTarget = {
    cycle: (pulse % 2) as 0 | 1,
    duration: timeoutMs,
    pathRef: createRuntimePathRef(editor, target.path),
    pulse,
    type: target.type,
    variant,
  };

  editor.setOption(plugin, 'activeTarget', activeTarget);
  setRuntimeNavigationElement(
    editor,
    resolveRuntimeNavigationTarget(activeTarget) ?? {
      cycle: activeTarget.cycle,
      duration: activeTarget.duration,
      path: target.path,
      pulse: activeTarget.pulse,
      type: activeTarget.type,
      variant: activeTarget.variant,
    }
  );

  const timeoutId = setTimeout(() => {
    clearRuntimeNavigationFeedbackTarget(editor, plugin, pulse);
  }, timeoutMs);

  runtimeNavigationFeedbackTimeout.set(editor, timeoutId);

  return true;
};

const getRuntimeNavigationScrollPoint = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  {
    scrollTarget,
    select,
    target,
  }: {
    scrollTarget?: Point;
    select?: Point | Range;
    target: RuntimeNavigationTarget;
  }
): Point | undefined => {
  if (scrollTarget) return scrollTarget;
  if (select && 'focus' in select) return select.focus;
  if (select && 'path' in select) return select;

  return editor.read((state) => state.points.start(target.path));
};

const getRuntimeBlockPath = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  at?: Location
): number[] | null => {
  const target =
    at ?? editor.read((state) => state.selection.get())?.anchor ?? null;

  if (!target) return null;

  const path = LocationApi.isRange(target)
    ? target.anchor.path
    : PointApi.isPoint(target)
      ? target.path
      : target;

  for (let index = path.length; index > 0; index--) {
    const candidatePath = path.slice(0, index);
    const node = getRuntimeDescendant(editor, candidatePath);

    if (isRuntimeElementNode(node)) {
      return candidatePath;
    }
  }

  return null;
};

const findRuntimeAncestorPath = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  blockPath: number[],
  match?: PlateRuntimeNodeMatch
) => {
  for (let index = blockPath.length - 1; index > 0; index--) {
    const ancestorPath = blockPath.slice(0, index);
    const node = getRuntimeDescendant(editor, ancestorPath);

    if (matchesRuntimeNode(node, ancestorPath, match)) {
      return ancestorPath;
    }
  }

  return null;
};

const getRuntimePluginByType = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  type: string
) => {
  const pluginKey = editor.meta.pluginCache.node.types[type];

  return pluginKey ? editor.plugins[pluginKey] : undefined;
};

type RuntimeAffinity = 'backward' | 'forward';

type RuntimeAffinityKind = 'directional' | 'hard' | 'outward';

type RuntimeAffinityEdgeNodes = [
  NodeEntry<SlateElement | Text> | null,
  NodeEntry<SlateElement | Text> | null,
];

const getRuntimeNodeProps = (node: SlateElement | Text) =>
  NodeApi.extractProps(node) as Record<string, unknown>;

const areRuntimeMarksEqual = (
  left: Record<string, unknown>,
  right: Record<string, unknown>
) => {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every((key) => Object.is(left[key], right[key]))
  );
};

const getRuntimeNodeAffinity = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  node: SlateElement | Text,
  affinity: RuntimeAffinityKind
) => {
  const keys = ElementApi.isElement(node)
    ? [node.type]
    : Object.keys(getRuntimeNodeProps(node));

  return keys.some(
    (type) =>
      typeof type === 'string' &&
      getRuntimePluginByType(editor, type)?.rules?.selection?.affinity ===
        affinity
  );
};

const hasRuntimeAffinityNodes = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  edgeNodes: RuntimeAffinityEdgeNodes,
  affinity: RuntimeAffinityKind
) => {
  const [backwardEntry, forwardEntry] = edgeNodes;

  return (
    (backwardEntry &&
      getRuntimeNodeAffinity(editor, backwardEntry[0], affinity)) ||
    (forwardEntry && getRuntimeNodeAffinity(editor, forwardEntry[0], affinity))
  );
};

const hasRuntimeAffinityElement = (edgeNodes: RuntimeAffinityEdgeNodes) => {
  const [before, after] = edgeNodes;

  return (
    (before && ElementApi.isElement(before[0])) ||
    (after && ElementApi.isElement(after[0]))
  );
};

const getRuntimeAffinityEdgeNodes = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
): RuntimeAffinityEdgeNodes | null => {
  const selection = editor.read((state) => state.selection.get());

  if (!selection || !RangeApi.isCollapsed(selection)) return null;

  const cursor = selection.anchor;

  try {
    const textRange = editor.read((state) => state.ranges.get(cursor.path));
    const edge = editor.read((state) =>
      state.points.isStart(cursor, textRange)
        ? 'start'
        : state.points.isEnd(cursor, textRange)
          ? 'end'
          : null
    );

    if (!edge) return null;

    const parentEntry = editor.read((state) =>
      state.nodes.parent(cursor.path)
    ) as NodeEntry<SlateElement> | undefined;
    const parent = parentEntry?.[0] ?? null;
    const parentAffinity =
      parent && ElementApi.isElement(parent) && typeof parent.type === 'string'
        ? getRuntimePluginByType(editor, parent.type)?.rules?.selection
            ?.affinity
        : undefined;
    const isAffinityInlineElement =
      parentAffinity === 'hard' || parentAffinity === 'directional';
    const nodeEntry = isAffinityInlineElement
      ? parentEntry
      : (editor.read((state) => state.nodes.get(cursor.path)) as
          | NodeEntry<Text>
          | undefined);

    if (!nodeEntry) return null;

    if (
      edge === 'start' &&
      cursor.path.at(-1) === 0 &&
      !isAffinityInlineElement
    ) {
      return [null, nodeEntry];
    }

    const siblingPath =
      edge === 'end'
        ? PathApi.next(nodeEntry[1])
        : PathApi.hasPrevious(nodeEntry[1])
          ? PathApi.previous(nodeEntry[1])
          : undefined;

    if (!siblingPath) {
      return edge === 'end' ? [nodeEntry, null] : [null, nodeEntry];
    }

    const siblingNode = getRuntimeDescendant<V, TExtensions, Text>(
      editor,
      siblingPath
    );
    const siblingEntry =
      siblingNode && TextApi.isText(siblingNode)
        ? ([siblingNode, siblingPath] as NodeEntry<Text>)
        : null;

    return edge === 'end'
      ? [nodeEntry, siblingEntry]
      : [siblingEntry, nodeEntry];
  } catch {
    return null;
  }
};

const getRuntimeMarkBoundaryAffinity = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  markBoundary: RuntimeAffinityEdgeNodes
): RuntimeAffinity | undefined => {
  const selection = editor.read((state) => state.selection.get());
  const marks = editor.read((state) => state.marks.get()) as Record<
    string,
    unknown
  > | null;

  if (!selection) return;

  const marksMatchLeaf = (leaf: SlateElement | Text) =>
    !!marks &&
    areRuntimeMarksEqual(getRuntimeNodeProps(leaf), marks) &&
    Object.keys(marks).length > 1;

  const [backwardEntry, forwardEntry] = markBoundary;

  if (!backwardEntry || !forwardEntry) {
    const leafEntry = backwardEntry || forwardEntry;
    if (!leafEntry) return;

    const affinityIsTowardsLeaf = !marks || marksMatchLeaf(leafEntry[0]);

    if (affinityIsTowardsLeaf) {
      return leafEntry === backwardEntry ? 'backward' : 'forward';
    }
    return;
  }

  const marksDirection: RuntimeAffinity | null = (() => {
    if (!marks) return null;
    if (marksMatchLeaf(backwardEntry[0])) return 'backward';
    if (marksMatchLeaf(forwardEntry[0])) return 'forward';
    return null;
  })();
  const selectionDirection =
    selection.anchor.offset === 0 ? 'forward' : 'backward';

  if (selectionDirection === 'backward' && marksDirection === 'forward') {
    return 'forward';
  }

  return 'backward';
};

const setRuntimeAffinityMarks = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  marks: EditorMarks<V> | null
) => {
  editor.update((tx) => {
    tx.marks.set(marks);
  });
};

const selectRuntimeAffinityPoint = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  point: Point
) => {
  editor.update((tx) => {
    tx.selection.set({ anchor: point, focus: point });
  });
};

const setRuntimeAffinitySelection = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  edgeNodes: RuntimeAffinityEdgeNodes,
  affinity: RuntimeAffinity
) => {
  const [before, after] = edgeNodes;

  if (affinity === 'backward') {
    if (before === null) {
      setRuntimeAffinityMarks(editor, {} as EditorMarks<V>);
      return;
    }

    const beforeEnd = editor.read((state) => state.points.end(before[1]));
    selectRuntimeAffinityPoint(editor, beforeEnd);

    if (!ElementApi.isElement(before[0])) {
      setRuntimeAffinityMarks(editor, null);
    }
    return;
  }

  if (before === null) {
    setRuntimeAffinityMarks(editor, null);
    return;
  }

  if (after === null) {
    setRuntimeAffinityMarks(editor, {} as EditorMarks<V>);
    return;
  }

  const beforeEnd = editor.read((state) => state.points.end(before[1]));
  selectRuntimeAffinityPoint(editor, beforeEnd);

  if (!ElementApi.isElement(after[0])) {
    setRuntimeAffinityMarks(
      editor,
      getRuntimeNodeProps(after[0]) as EditorMarks<V>
    );
  }
};

const findRuntimeExitBreakAncestorPath = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  blockPath: number[],
  match?: PlateRuntimeNodeMatch
) => {
  for (let index = blockPath.length - 1; index > 0; index--) {
    const ancestorPath = blockPath.slice(0, index);
    const node = getRuntimeDescendant(editor, ancestorPath);

    if (!matchesRuntimeNode(node, ancestorPath, match)) continue;

    if (ancestorPath.length === 1) {
      return ancestorPath;
    }

    if (!isRuntimeElementNode(node) || typeof node.type !== 'string') continue;

    if (!getRuntimePluginByType(editor, node.type)?.node?.isStrictSiblings) {
      return ancestorPath;
    }
  }

  return blockPath;
};

const getRuntimeEdgePoint = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  at: Location,
  edge: 'end' | 'start'
): Point => {
  if (LocationApi.isPath(at)) {
    const root = editor.read((state) => state.value.root());
    const path = [...at];
    let node = getRuntimeNodeAtPath(root, path);

    while (!isRuntimeTextNode(node)) {
      const children = getRuntimeChildren(node);

      if (!children || children.length === 0) {
        throw new Error(
          `Cannot get the ${edge} point in the node at path [${at}] because it has no ${edge} text node.`
        );
      }

      const index = edge === 'end' ? children.length - 1 : 0;
      path.push(index);
      node = children[index];
    }

    return { offset: edge === 'end' ? node.text.length : 0, path };
  }

  if (LocationApi.isRange(at)) {
    const [start, end] = RangeApi.edges(at);

    return edge === 'start' ? start : end;
  }

  return at;
};

const isRuntimeSelectionAtBlockEdge = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  selection: Range,
  blockPath: number[],
  edge: 'end' | 'start'
) => {
  try {
    const point =
      edge === 'start' ? RangeApi.start(selection) : RangeApi.end(selection);

    return PointApi.equals(point, getRuntimeEdgePoint(editor, blockPath, edge));
  } catch {
    return false;
  }
};

const getPreviousRuntimeKeyboardSelectableBlockVoidPoint = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  selection: Range,
  blockPath: number[]
): Point | null => {
  if (
    blockPath.length !== 1 ||
    !PathApi.hasPrevious(blockPath) ||
    !isRuntimeSelectionAtBlockEdge(editor, selection, blockPath, 'start')
  ) {
    return null;
  }

  const previousPath = PathApi.previous(blockPath);
  const previousNode = getRuntimeDescendant(editor, previousPath);

  if (!isRuntimeElementNode(previousNode)) {
    return null;
  }

  return editor.read((state) =>
    state.schema.isVoid(previousNode) &&
    state.schema.isKeyboardSelectable(previousNode) &&
    !state.schema.isReadOnly(previousNode)
      ? state.points.start(previousPath)
      : null
  );
};

const isRuntimeSelectionWholeRoot = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  selection: Range
) => {
  try {
    const value = editor.read((state) => state.value.root());
    const startPoint = getRuntimeValueEdgePoint(value, 'start');
    const endPoint = getRuntimeValueEdgePoint(value, 'end');
    const [selectionStart, selectionEnd] = RangeApi.edges(selection);

    if (!startPoint || !endPoint) return false;

    return (
      PointApi.equals(selectionStart, startPoint) &&
      PointApi.equals(selectionEnd, endPoint)
    );
  } catch {
    return false;
  }
};

const getRuntimeBreakOverridePlugin = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  rule: string,
  blockNode: SlateElement,
  blockPath: number[]
) => {
  for (const key of editor.meta.pluginCache.rules.match) {
    const plugin = editor.plugins[key];
    const match = plugin?.rules?.match;

    if (
      plugin?.rules?.break &&
      typeof match === 'function' &&
      (match as PlateRuntimeRuleMatch)({
        ...createRuntimePluginContext(editor, plugin),
        node: blockNode,
        path: blockPath,
        rule,
      })
    ) {
      return plugin;
    }
  }

  return null;
};

const getRuntimeDeleteOverridePlugin = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  rule: string,
  blockNode: SlateElement,
  blockPath: number[]
) => {
  for (const key of editor.meta.pluginCache.rules.match) {
    const plugin = editor.plugins[key];
    const match = plugin?.rules?.match;

    if (
      plugin?.rules?.delete &&
      typeof match === 'function' &&
      (match as PlateRuntimeRuleMatch)({
        ...createRuntimePluginContext(editor, plugin),
        node: blockNode,
        path: blockPath,
        rule,
      })
    ) {
      return plugin;
    }
  }

  return null;
};

const getRuntimeMergeOverrideRules = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  rule: string,
  blockNode: SlateElement,
  blockPath: number[]
) => {
  for (const key of editor.meta.pluginCache.rules.match) {
    const plugin = editor.plugins[key];
    const match = plugin?.rules?.match;

    if (
      plugin?.rules?.merge &&
      typeof match === 'function' &&
      (match as PlateRuntimeRuleMatch)({
        ...createRuntimePluginContext(editor, plugin),
        node: blockNode,
        path: blockPath,
        rule,
      })
    ) {
      return plugin.rules.merge;
    }
  }

  return null;
};

const getRuntimeNormalizeOverrideRules = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  rule: string,
  blockNode: SlateElement,
  blockPath: number[]
) => {
  for (const key of editor.meta.pluginCache.rules.match) {
    const plugin = editor.plugins[key];
    const match = plugin?.rules?.match;

    if (
      plugin?.rules?.normalize &&
      typeof match === 'function' &&
      (match as PlateRuntimeRuleMatch)({
        ...createRuntimePluginContext(editor, plugin),
        node: blockNode,
        path: blockPath,
        rule,
      })
    ) {
      return plugin.rules.normalize;
    }
  }

  return null;
};

const shouldRuntimeRemoveEmptyMergeTarget = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  node: SlateElement,
  path: number[]
) => {
  const type = typeof node.type === 'string' ? node.type : undefined;
  const plugin = type ? getRuntimePluginByType(editor, type) : undefined;

  if (!plugin) return true;

  if (!plugin.rules?.merge?.removeEmpty) return false;

  const overrideRules = getRuntimeMergeOverrideRules(
    editor,
    'merge.removeEmpty',
    node,
    path
  );

  return overrideRules?.removeEmpty !== false;
};

const shouldRuntimePreserveRemovedMergeTarget = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  node: SlateElement,
  path: number[]
) =>
  getRuntimeNodeText(node).length === 0 &&
  !shouldRuntimeRemoveEmptyMergeTarget(editor, node, path);

const getRuntimeMergeNodeProperties = (node: SlateElement) => {
  const { children: _children, ...properties } = node;

  return properties;
};

const shouldRuntimeRemoveEmptyNormalizeTarget = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  node: SlateElement,
  path: number[]
) => {
  const overrideRules = getRuntimeNormalizeOverrideRules(
    editor,
    'normalize.removeEmpty',
    node,
    path
  );

  if (overrideRules) {
    return overrideRules.removeEmpty === true;
  }

  const type = typeof node.type === 'string' ? node.type : undefined;
  const plugin = type ? getRuntimePluginByType(editor, type) : undefined;

  return plugin?.rules?.normalize?.removeEmpty === true;
};

const executeRuntimeBreakAction = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  action: PlateRuntimeBreakRuleAction | undefined,
  blockPath: number[],
  type: string | undefined
): boolean => {
  if (!action || action === 'default') return false;

  if (action === 'none') return true;

  if (action === 'reset') {
    getPlateRuntimeTransforms(editor).resetBlock({ at: blockPath });
    return true;
  }

  if (action === 'exit') {
    return !!getPlateRuntimeTransforms(editor).insertExitBreak();
  }

  if (action === 'deleteExit') {
    editor.update((tx) => {
      tx.text.deleteBackward({ unit: 'character' });
    });

    return !!getPlateRuntimeTransforms(editor).insertExitBreak();
  }

  if (action === 'lineBreak') {
    return !!getPlateRuntimeTransforms(editor).insertSoftBreak();
  }

  if (action === 'lift' && type) {
    return !!getPlateRuntimeTransforms(editor).liftBlock({
      at: blockPath,
      match: { type },
    });
  }

  return false;
};

const executeRuntimeDeleteAction = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  action: PlateRuntimeDeleteRuleAction | undefined,
  blockPath: number[],
  type: string | undefined
): boolean => {
  if (!action || action === 'default') return false;

  if (action === 'reset') {
    getPlateRuntimeTransforms(editor).resetBlock({ at: blockPath });
    return true;
  }

  if (action === 'lift' && type) {
    return !!getPlateRuntimeTransforms(editor).liftBlock({
      at: blockPath,
      match: { type },
    });
  }

  return false;
};

const getPlateRuntimeDomApi = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
): { focus: (options?: { retries: number }) => void } => {
  const api = editor.api as unknown as {
    dom?: { focus?: (options?: { retries: number }) => void };
  };

  if (!api.dom?.focus) {
    throw new Error('[Plate] Runtime editor DOM focus api is not installed.');
  }

  return { focus: api.dom.focus };
};

const getPlateRuntimeReactApi = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
): { isFocused: () => boolean } => {
  const api = editor.api as unknown as {
    react?: { isFocused?: () => boolean };
  };

  if (!api.react?.isFocused) {
    throw new Error('[Plate] Runtime editor React api is not installed.');
  }

  return { isFocused: api.react.isFocused };
};

const getPlateRuntimeHtmlApi = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
): { deserialize: (input: { element: string }) => V } => {
  const api = editor.api as unknown as {
    html?: { deserialize?: (input: { element: string }) => V };
  };

  if (!api.html?.deserialize) {
    throw new Error(
      '[Plate] Runtime editor HTML deserialize api is not installed.'
    );
  }

  return { deserialize: api.html.deserialize };
};

const createRuntimeDefaultValue = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
): V => {
  const paragraphType = editor.plugins[BaseParagraphPlugin.key]
    ? editor.getType(BaseParagraphPlugin.key)
    : BaseParagraphPlugin.key;

  return [
    {
      children: [{ text: '' }],
      type: paragraphType,
    },
  ] as V;
};

const createRuntimeDefaultBlock = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
): ElementOrTextIn<V> =>
  createRuntimeDefaultValue(editor)[0] as ElementOrTextIn<V>;

const getRuntimeParagraphType = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
) =>
  editor.plugins[BaseParagraphPlugin.key]
    ? editor.getType(BaseParagraphPlugin.key)
    : BaseParagraphPlugin.key;

const isRuntimeBlockElement = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  node: unknown
): node is SlateElement =>
  isRuntimeElementNode(node) &&
  editor.read((state) => state.schema.isBlock(node));

const normalizeRuntimeBlockquoteChildren = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  children: readonly Descendant[]
): Descendant[] => {
  const elements: Descendant[] = [];
  let inlineNodes: Descendant[] = [];
  const paragraphType = getRuntimeParagraphType(editor);

  const flushInlineNodes = () => {
    if (inlineNodes.length === 0) return;

    elements.push({ children: inlineNodes, type: paragraphType });
    inlineNodes = [];
  };

  children.forEach((child) => {
    if (isRuntimeBlockElement(editor, child)) {
      flushInlineNodes();
      elements.push(child);
      return;
    }

    inlineNodes.push(child);
  });

  flushInlineNodes();

  return elements.length > 0 ? elements : createRuntimeDefaultValue(editor);
};

const shouldReplaceRuntimeBlockquoteChildren = (
  currentChildren: readonly Descendant[],
  nextChildren: readonly Descendant[]
) =>
  currentChildren.length !== nextChildren.length ||
  nextChildren.some((child, index) => child !== currentChildren[index]);

const replaceRuntimeBlockquoteChildren = <V extends Value>(
  tx: RuntimeBlockquoteChildrenTransaction<V>,
  path: number[],
  currentChildren: readonly Descendant[],
  nextChildren: readonly Descendant[]
) => {
  for (let index = currentChildren.length - 1; index >= 0; index--) {
    tx.nodes.remove({ at: [...path, index] });
  }

  tx.nodes.insert(nextChildren as ElementOrTextIn<V>[], { at: [...path, 0] });
};

const createRuntimeElementSpec = (
  plugin: PlateRuntimePlugin
): EditorElementSpec | null => {
  const { node } = plugin;
  const type = node?.type;

  if (!type) return null;

  const hasSchemaBehavior =
    node.isInline !== undefined ||
    node.isMarkableVoid !== undefined ||
    node.isSelectable !== undefined ||
    node.isVoid !== undefined;

  if (!hasSchemaBehavior) return null;

  const spec: EditorElementSpec = { type };

  if (node.isInline === true) {
    spec.inline = true;
  }
  if (node.isSelectable === false) {
    spec.selectable = false;
  }
  if (node.isMarkableVoid === true) {
    spec.markableVoid = true;
  }
  if (node.isVoid === true) {
    spec.void =
      node.isInline === true
        ? node.isMarkableVoid === true
          ? 'markable-inline'
          : 'inline'
        : 'block';
  }

  return spec;
};

const isRuntimePromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  (typeof value === 'object' || typeof value === 'function') &&
  value !== null &&
  'then' in value &&
  typeof value.then === 'function';

const normalizeRuntimeInitValue = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  value: unknown
): V => {
  if (Array.isArray(value) && value.length > 0) {
    return value as V;
  }

  const currentValue = editor.read((state) => state.value.root()) as V;

  return currentValue.length > 0
    ? currentValue
    : createRuntimeDefaultValue(editor);
};

const resolveRuntimeInitValue = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  value: unknown
): V => {
  if (typeof value === 'string') {
    return normalizeRuntimeInitValue(
      editor,
      getPlateRuntimeHtmlApi(editor).deserialize({ element: value })
    );
  }

  return normalizeRuntimeInitValue(editor, value);
};

const getRuntimeValueEdgePoint = (
  value: Readonly<Value>,
  edge: 'end' | 'start'
): Point | null => {
  if (value.length === 0) return null;

  const path = [edge === 'start' ? 0 : value.length - 1];
  let node = getRuntimeNodeAtPath(value, path);

  while (!isRuntimeTextNode(node)) {
    const children = getRuntimeChildren(node);

    if (!children || children.length === 0) return null;

    const nextIndex = edge === 'start' ? 0 : children.length - 1;
    path.push(nextIndex);
    node = children[nextIndex];
  }

  return {
    offset: edge === 'start' ? 0 : node.text.length,
    path,
  };
};

const getRuntimeNodeIdKey = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
) =>
  editor.plugins[NodeIdPlugin.key]
    ? (editor.getOptions<{ idKey?: string }>(NodeIdPlugin).idKey ?? 'id')
    : 'id';

const getRuntimeNodeIdRecord = (node: unknown): RuntimeNodeIdRecord =>
  node as RuntimeNodeIdRecord;

const toRuntimeNodeIdEntry = (
  node: unknown,
  path: number[]
): RuntimeNodeIdEntry => [getRuntimeNodeIdRecord(node), path];

function* runtimeNodeIdEntries(
  children: readonly Descendant[],
  parentPath: number[] = []
): Generator<RuntimeNodeIdEntry> {
  for (const [index, child] of children.entries()) {
    const path = [...parentPath, index];
    const node = getRuntimeNodeIdRecord(child);

    yield [node, path];

    if (Array.isArray(node.children)) {
      yield* runtimeNodeIdEntries(node.children, path);
    }
  }
}

const getRuntimeNodeIdQuery = ({
  allow,
  exclude,
  filter = () => true,
  filterText,
}: NodeIdOptions): QueryNodeOptions => ({
  allow,
  exclude,
  filter: (entry) => {
    const props = getRuntimeNodeIdRecord(entry[0]);

    return filter(entry) && (!filterText || props.type !== undefined);
  },
});

const collectRuntimeDuplicateCandidateIds = ({
  disableInsertOverrides,
  idKey,
  nodeEntry,
  query,
}: {
  disableInsertOverrides: boolean | undefined;
  idKey: string;
  nodeEntry: RuntimeNodeIdEntry;
  query: QueryNodeOptions;
}) => {
  const duplicateCandidateIds = new Set<unknown>();

  const collectNodeIds = (entry: RuntimeNodeIdEntry) => {
    const [entryNode, path] = entry;

    if (queryNode(entry, query)) {
      if (entryNode[idKey] !== undefined) {
        duplicateCandidateIds.add(entryNode[idKey]);
      }

      if (!disableInsertOverrides && entryNode._id !== undefined) {
        duplicateCandidateIds.add(entryNode._id);
      }
    }

    const children = Array.isArray(entryNode.children)
      ? entryNode.children
      : undefined;

    if (!children) return;

    children.forEach((child, index) => {
      collectNodeIds([getRuntimeNodeIdRecord(child), [...path, index]]);
    });
  };

  collectNodeIds(nodeEntry);

  return duplicateCandidateIds;
};

const collectRuntimeExistingNodeIds = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  {
    candidateIds,
    idKey,
    onDuplicateIdScan,
    root,
  }: {
    candidateIds: Set<unknown>;
    idKey: string;
    onDuplicateIdScan?: NodeIdOptions['onDuplicateIdScan'];
    root?: string;
  }
) => {
  if (candidateIds.size === 0) return new Set<unknown>();

  const existingIds = new Set<unknown>();
  const start = performance.now();
  let visitedCount = 0;
  const rootValue = editor.read((state) =>
    state.value.root(getRuntimeReadRoot(root))
  );

  for (const [entryNode] of runtimeNodeIdEntries(rootValue)) {
    visitedCount += 1;

    const id = entryNode[idKey];

    if (id === undefined || !candidateIds.has(id)) continue;

    existingIds.add(id);

    if (existingIds.size === candidateIds.size) {
      break;
    }
  }

  onDuplicateIdScan?.({
    candidateCount: candidateIds.size,
    duration: performance.now() - start,
    existingCount: existingIds.size,
    visitedCount,
  });

  return existingIds;
};

const hasRuntimeNodeId = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  {
    id,
    idKey,
    root,
  }: {
    id: unknown;
    idKey: string;
    root?: string;
  }
) =>
  collectRuntimeExistingNodeIds(editor, {
    candidateIds: new Set([id]),
    idKey,
    root,
  }).has(id);

const normalizeRuntimeNodeIdInsertedNode = (
  nodeEntry: RuntimeNodeIdEntry,
  {
    disableInsertOverrides,
    existingIds,
    idCreator,
    idKey,
    query,
  }: {
    disableInsertOverrides: boolean | undefined;
    existingIds: Set<unknown>;
    idCreator: () => unknown;
    idKey: string;
    query: QueryNodeOptions;
  }
) => {
  const [entryNode, path] = nodeEntry;

  if (queryNode(nodeEntry, query)) {
    if (entryNode[idKey] !== undefined && existingIds.has(entryNode[idKey])) {
      delete entryNode[idKey];
    }

    if (entryNode[idKey] === undefined) {
      entryNode[idKey] = idCreator();
    }

    if (!disableInsertOverrides && entryNode._id !== undefined) {
      const id = entryNode._id;
      entryNode._id = undefined;

      if (!existingIds.has(id)) {
        entryNode[idKey] = id;
      }
    }
  }

  const children = Array.isArray(entryNode.children)
    ? entryNode.children
    : undefined;

  if (!children) return;

  children.forEach((child, index) => {
    normalizeRuntimeNodeIdInsertedNode(
      [getRuntimeNodeIdRecord(child), [...path, index]],
      {
        disableInsertOverrides,
        existingIds,
        idCreator,
        idKey,
        query,
      }
    );
  });
};

const shouldAssignRuntimeNodeId = (
  entry: RuntimeNodeIdEntry,
  options: NodeIdOptions & {
    isBlock: (node: Descendant) => boolean;
  }
) => {
  const {
    allow,
    exclude,
    filter = () => true,
    filterInline = true,
    filterText = true,
    idKey = 'id',
    isBlock,
  } = options;
  const [node] = entry;

  return (
    !node[idKey] &&
    queryNode(entry, {
      allow,
      exclude,
      filter: (nextEntry) => {
        const [entryNode] = nextEntry;

        if (filterText && !ElementApi.isElement(entryNode)) {
          return false;
        }
        if (
          filterInline &&
          ElementApi.isElement(entryNode) &&
          !isBlock(entryNode)
        ) {
          return false;
        }

        return filter(nextEntry);
      },
    })
  );
};

const createRuntimeNodeIdProps = <V extends Value>(
  idKey: string,
  id: unknown
): Partial<NodeProps<NodeIn<V>>> =>
  ({ [idKey]: id }) as Partial<NodeProps<NodeIn<V>>>;

const collectRuntimeNodeIdNormalizeUpdates = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  options: NodeIdOptions
): RuntimeNodeIdNormalizeUpdate<V>[] => {
  const { idCreator = () => nanoid(10), idKey = 'id' } = options;
  const updates: RuntimeNodeIdNormalizeUpdate<V>[] = [];
  const rootValue = editor.read((state) => state.value.root());

  const visit = (node: Descendant, path: number[]) => {
    const entry = toRuntimeNodeIdEntry(node, path);

    if (
      shouldAssignRuntimeNodeId(entry, {
        ...options,
        isBlock: (node) => isRuntimeBlockElement(editor, node),
      })
    ) {
      updates.push({
        at: path,
        props: createRuntimeNodeIdProps(idKey, idCreator()),
      });
    }

    if (!ElementApi.isElement(node)) return;

    node.children.forEach((child, index) => {
      visit(child as Descendant, [...path, index]);
    });
  };

  rootValue.forEach((node, index) => {
    visit(node as Descendant, [index]);
  });

  return updates;
};

const scheduleRuntimeScroll = (fn: () => void) => {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(fn);
    return;
  }

  setTimeout(fn, 0);
};

const scrollPlateRuntimeTargetIntoView = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  target: PlateRuntimeScrollTarget,
  options: ScrollIntoViewOptions = { scrollMode: 'if-needed' }
) => {
  scheduleRuntimeScroll(() => {
    const domApi = editor.api as unknown as {
      dom: {
        resolveDOMRange: (range: Range) => DOMRange | null;
      };
    };
    const domRange = PointApi.isPoint(target)
      ? domApi.dom.resolveDOMRange({
          anchor: target,
          focus: target,
        })
      : target;

    if (!domRange) return;

    const leafElement = domRange.startContainer.parentElement;

    if (!leafElement) return;

    const previousGetBoundingClientRect = leafElement.getBoundingClientRect;
    leafElement.getBoundingClientRect =
      domRange.getBoundingClientRect.bind(domRange);

    scrollIntoViewIfNeeded(leafElement, options);

    setTimeout(() => {
      leafElement.getBoundingClientRect = previousGetBoundingClientRect;
    }, 0);
  });
};

const getRuntimeOperationScrollTarget = (
  operation: Operation
): Point | null => {
  const candidate = operation as Operation & {
    offset?: unknown;
    path?: unknown;
  };

  if (!Array.isArray(candidate.path)) return null;

  return {
    offset: typeof candidate.offset === 'number' ? candidate.offset : 0,
    path: candidate.path,
  };
};

const getPlateRuntimeScrollApi = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
): PlateRuntimeScrollApi => {
  const api = editor.api as unknown as Partial<PlateRuntimeScrollApi>;

  if (!api.scrollIntoView) {
    throw new Error(
      '[Plate] Runtime editor scrollIntoView api is not installed.'
    );
  }

  return { scrollIntoView: api.scrollIntoView };
};

const isRuntimeLocation = (value: unknown): value is Location =>
  Array.isArray(value) || PointApi.isPoint(value) || RangeApi.isRange(value);

const isRuntimePath = (value: unknown): value is Path =>
  Array.isArray(value) && value.every((part) => typeof part === 'number');

const getRuntimeLocationPoint = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  at: Location,
  edge: 'end' | 'start'
): Point =>
  PointApi.isPoint(at)
    ? at
    : RangeApi.isRange(at)
      ? edge === 'start'
        ? RangeApi.start(at)
        : RangeApi.end(at)
      : editor.read((state) =>
          edge === 'start' ? state.points.start(at) : state.points.end(at)
        );

const isRuntimeElementStateEmpty = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  element: SlateElement
) => {
  const props = NodeApi.extractProps(element);

  return Object.entries(props).every(([key, value]) => {
    if (key === 'type') return true;

    return editor.meta.pluginCache.node.isMetadataProp.some((pluginKey) => {
      const plugin = editor.plugins[pluginKey];

      const isMetadataProp = plugin?.node?.isMetadataProp;

      return (
        typeof isMetadataProp === 'function' &&
        isMetadataProp({
          api: editor.api,
          editor,
          getOption: (optionKey: string, ...args: unknown[]) =>
            editor.getOption(plugin, optionKey, ...args),
          getOptions: () => editor.getOptions(plugin),
          key,
          node: element,
          plugin,
          setOption: (optionKey: string, optionValue: unknown) =>
            editor.setOption(plugin, optionKey, optionValue),
          setOptions: (options: Record<string, unknown>) =>
            editor.setOptions(plugin, options),
          type: plugin.node?.type ?? plugin.key,
          value,
        })
      );
    });
  });
};

const installPlateRuntimeCompatibilityBridge = <
  V extends Value,
  const TExtensions extends readonly unknown[],
  P extends PlateRuntimePluginInput,
>(
  editor: PlateRuntimeEditor<V, TExtensions, P>
) => {
  const api = editor.api as Record<string, any>;
  const compatApi: Record<string, any> = {};
  const tf = getPlateRuntimeTransforms(editor) as Record<string, any>;
  const setApi = (key: string, value: (...args: any[]) => unknown) => {
    compatApi[key] = api[key] ?? value;
  };
  const setTf = (key: string, value: (...args: any[]) => unknown) => {
    tf[key] ??= value;
  };
  const getQueryMatch = (options: Record<string, any> = {}) => {
    const predicates: ((node: unknown, path: Path) => boolean)[] = [];

    if (options.text !== undefined) {
      predicates.push((node) => TextApi.isText(node) === options.text);
    }
    if (options.empty !== undefined) {
      predicates.push((node) =>
        TextApi.isText(node)
          ? node.text.length > 0 === !options.empty
          : api.isEmpty(node) === options.empty
      );
    }
    if (options.block !== undefined) {
      predicates.push((node) =>
        ElementApi.isElement(node)
          ? editor.read((state) => state.schema.isBlock(node)) === options.block
          : options.block === false
      );
    }
    if (options.id !== undefined) {
      predicates.push(
        (node) =>
          ElementApi.isElement(node) &&
          ((options.id === true && !!node.id) || node.id === options.id)
      );
    }
    if (
      options.match &&
      typeof options.match === 'object' &&
      typeof options.match !== 'function'
    ) {
      predicates.push(
        (node) =>
          typeof node === 'object' &&
          node !== null &&
          Object.entries(options.match).every(([key, value]) => {
            const values = Array.isArray(value) ? value : [value];

            return values.includes((node as Record<string, unknown>)[key]);
          })
      );
    } else if (typeof options.match === 'function') {
      predicates.push(options.match);
    }

    if (predicates.length === 0) return;

    return (node: unknown, path: Path) =>
      predicates.every((predicate) => predicate(node, path));
  };
  const combineQueryMatch =
    (
      match: ((node: unknown, path: Path) => boolean) | undefined,
      extra: (node: unknown, path: Path) => boolean
    ) =>
    (node: unknown, path: Path) =>
      extra(node, path) && (!match || match(node, path));
  const getSiblingMatch = (at: Path) =>
    editor.read((state) => {
      const parent = state.nodes.parent(at)?.[0];
      const children = ElementApi.isElement(parent) ? parent.children : [];

      return (node: unknown) => children.includes(node as Descendant);
    });
  const runtimeNext = (options: Record<string, any> = {}) => {
    const { from = 'after', mode = from === 'child' ? 'all' : 'lowest' } =
      options;
    const at = (options.at ?? editor.selection) as Location | undefined;

    if (!at || (isRuntimePath(at) && at.length === 0)) return;

    let match = getQueryMatch(options);
    let start: Path | undefined;

    if (from === 'child' && isRuntimePath(at)) {
      const childPath = [...at, 0];
      const childNode = editor.read((state) =>
        state.nodes.hasPath(childPath) ? state.nodes.get(childPath) : undefined
      );

      if (childNode) {
        start = childPath;
        match = combineQueryMatch(
          match,
          (_node, path) =>
            !PathApi.isAncestor(path, at) && !PathApi.equals(path, at)
        );
      }
    }

    if (!start) {
      const point = editor.read((state) =>
        state.points.after(at, { voids: options.voids })
      );

      if (!point) return;
      start = point.path;
    }

    if (!match && isRuntimePath(at)) {
      match = getSiblingMatch(at);
    }

    const to = editor.read((state) => state.nodes.last([])?.[1]);

    if (!to) return;

    return Array.from(
      editor.read((state) =>
        state.nodes.entries({
          ...options,
          at: [start, to],
          match,
          mode,
        })
      )
    )[0];
  };
  const runtimePrevious = (options: Record<string, any> = {}) => {
    if (options.sibling) {
      const at = options.at as Path | undefined;

      if (!isRuntimePath(at)) return;

      const previousPath = PathApi.previous(at);

      return previousPath
        ? editor.read((state) => state.nodes.get(previousPath))
        : undefined;
    }

    if (options.id && options.block) {
      const block = api.node({ at: [], id: options.id });

      if (!block) return;

      return runtimePrevious({ ...options, at: block[1], id: undefined });
    }

    const { from = 'after', mode = 'lowest' } = options;
    const at = (options.at ?? editor.selection) as Location | undefined;

    if (!at || (isRuntimePath(at) && at.length === 0)) return;

    let match = getQueryMatch(options);
    let start: Path | undefined;

    if (from === 'parent' && isRuntimePath(at) && at.length > 1) {
      start = at;
      match = combineQueryMatch(
        match,
        (_node, path) => !PathApi.isAfter(path, at) && !PathApi.equals(path, at)
      );
    }

    if (!start) {
      const point = editor.read((state) =>
        state.points.before(at, { voids: options.voids })
      );

      if (!point) return;
      start = point.path;
    }

    if (!match && isRuntimePath(at)) {
      match = getSiblingMatch(at);
    }

    const to = editor.read((state) => state.nodes.first([])?.[1]);

    if (!to) return;

    return Array.from(
      editor.read((state) =>
        state.nodes.entries({
          ...options,
          at: [start, to],
          match,
          mode,
          reverse: true,
        })
      )
    )[0];
  };

  setApi('above', (options = {}) =>
    editor.read((state) =>
      state.nodes.above({
        ...options,
        match: getQueryMatch(options),
      })
    )
  );
  setApi('after', (at: Location, options = {}) =>
    editor.read((state) => state.points.after(at, options))
  );
  setApi('before', (at: Location, options = {}) =>
    editor.read((state) => state.points.before(at, options))
  );
  setApi('block', (options = {}) =>
    editor.read((state) =>
      state.nodes.above({
        ...options,
        match: (node: unknown, path: Path) =>
          ElementApi.isElement(node) &&
          state.schema.isBlock(node) &&
          (getQueryMatch(options)?.(node, path) ?? true),
      })
    )
  );
  setApi('blocks', (options = {}) =>
    editor.read((state) =>
      Array.from(
        state.nodes.entries({
          at: [],
          ...options,
          match: (node: unknown, path: Path) =>
            ElementApi.isElement(node) &&
            state.schema.isBlock(node) &&
            (getQueryMatch(options)?.(node, path) ?? true),
        })
      )
    )
  );
  setApi('end', (at: Location) => editor.read((state) => state.points.end(at)));
  setApi('edges', (at: Location) =>
    editor.read((state) => state.ranges.edges(at))
  );
  setApi('fragment', (at = editor.selection, options = {}) =>
    editor.read((state) => state.fragment.get({ at, ...options }))
  );
  setApi('mark', (key: string) =>
    editor.read((state) => state.marks.get())?.[key]
  );
  setApi('marks', () => editor.read((state) => state.marks.get()));
  setApi('hasMark', (key: string) => {
    const value = editor.read((state) => state.marks.get())?.[key];

    return value !== undefined && value !== false;
  });
  setApi('isAt', (options: Record<string, unknown> = {}) => {
    const selection = (options.at as Range | undefined) ?? editor.selection;

    if (!selection) return false;

    const anchorBlockPath = getRuntimeBlockPath(editor, selection.anchor);
    const focusBlockPath = getRuntimeBlockPath(editor, selection.focus);
    const sameBlock =
      !!anchorBlockPath &&
      !!focusBlockPath &&
      PathApi.equals(anchorBlockPath, focusBlockPath);

    if (options.block && !sameBlock) return false;
    if (options.blocks && sameBlock) return false;

    const target =
      options.block && anchorBlockPath ? anchorBlockPath : selection;

    if (
      options.start &&
      !editor.read((state) =>
        state.points.isStart(RangeApi.start(selection), target)
      )
    ) {
      return false;
    }

    if (
      options.end &&
      !editor.read((state) =>
        state.points.isEnd(RangeApi.end(selection), target)
      )
    ) {
      return false;
    }

    return true;
  });
  setApi('isBlock', (element: SlateElement) =>
    editor.read((state) => state.schema.isBlock(element))
  );
  setApi('isCollapsed', () => {
    const selection = editor.selection;

    return !!selection && RangeApi.isCollapsed(selection);
  });
  setApi('isElementStateEmpty', (element: SlateElement) =>
    isRuntimeElementStateEmpty(editor, element)
  );
  setApi('isEnd', (point: Point, at: Location) =>
    editor.read((state) => state.points.isEnd(point, at))
  );
  setApi('isEmpty', (at?: Location | SlateElement, options = {}) => {
    if (ElementApi.isElement(at)) {
      return editor.read((state) => state.nodes.isEmpty(at));
    }

    const location = at ?? editor.selection ?? [];

    if ((options as { block?: boolean }).block) {
      const block = api.block({ at: location });

      return !block || editor.read((state) => state.nodes.isEmpty(block[0]));
    }

    return editor.read((state) => state.text.string(location).length === 0);
  });
  setApi('isExpanded', () => {
    const selection = editor.selection;

    return !!selection && RangeApi.isExpanded(selection);
  });
  setApi('isInline', (element: SlateElement) =>
    editor.read((state) => state.schema.isInline(element))
  );
  setApi('isSelectable', (element: SlateElement) =>
    editor.read((state) => state.schema.isSelectable(element))
  );
  setApi('isStart', (point: Point, at: Location) =>
    editor.read((state) => state.points.isStart(point, at))
  );
  setApi('isVoid', (element: SlateElement) =>
    editor.read((state) => state.schema.isVoid(element))
  );
  setApi('node', (atOrOptions: Location | Record<string, any> = []) =>
    isRuntimeLocation(atOrOptions)
      ? editor.read((state) => state.nodes.get(atOrOptions))
      : editor.read((state) =>
          state.nodes.find({
            ...atOrOptions,
            match: getQueryMatch(atOrOptions),
          })
        )
  );
  setApi('nodes', (options = {}) =>
    editor.read((state) =>
      state.nodes.entries({
        ...options,
        match: getQueryMatch(options),
      })
    )
  );
  setApi('next', runtimeNext);
  setApi('nodesRange', (nodes: NodeEntry[]) => {
    if (nodes.length === 0) return;

    return compatApi.range(nodes[0][1], nodes.at(-1)![1]);
  });
  setApi('pathRef', (path: number[]) => createRuntimePathRef(editor, path));
  setApi('pointRef', (point: Point, options = {}) =>
    createRuntimePointRef(editor, point, options)
  );
  setApi('parent', (at: Location) =>
    editor.read((state) => state.nodes.parent(at))
  );
  setApi('previous', runtimePrevious);
  setApi('prop', ({ defaultValue, getProp, key, mode = 'block', nodes }) => {
    if (nodes.length === 0) return defaultValue;

    const getNodeValue =
      getProp ?? ((node: Record<string, unknown>) => node[key]);
    let value: unknown;

    for (const node of nodes) {
      if (mode === 'block' || mode === 'all') {
        const nodeValue = getNodeValue(node);

        if (nodeValue !== undefined) {
          if (value === undefined) value = nodeValue;
          else if (value !== nodeValue) return;
          if (mode === 'block') continue;
        } else if (mode === 'block') {
          return defaultValue;
        }
      }

      if (mode === 'text' || mode === 'all') {
        for (const [text] of NodeApi.texts(node)) {
          const textValue = getNodeValue(text);

          if (textValue !== undefined) {
            if (value === undefined) value = textValue;
            else if (value !== textValue) return;
          } else if (mode === 'text') {
            return defaultValue;
          }
        }
      }
    }

    return value;
  });
  setApi('range', (at: Location, to?: Location) =>
    editor.read((state) => state.ranges.get(at, to))
  );
  setApi('some', (options = {}) =>
    editor.read((state) =>
      state.nodes.some({
        ...options,
        match: getQueryMatch(options),
      })
    )
  );
  setApi('start', (at: Location) =>
    editor.read((state) => state.points.start(at))
  );
  setApi('string', (at: Location = [], options = {}) =>
    editor.read((state) => state.text.string(at, options))
  );
  setApi('unhangRange', (range: Range, options = {}) =>
    editor.read((state) => state.ranges.unhang(range, options))
  );

  editor.extend(
    defineEditorExtension({
      api: compatApi,
      name: 'plate:runtime-compat-api',
    })
  );

  setTf('addMark', (key: string, value: unknown) => {
    editor.update((tx) => {
      tx.marks.add(key, value);
    });
  });
  setTf('delete', (options?: { at?: Location }) => {
    editor.update((tx) => {
      tx.text.delete(options);
    });
  });
  setTf(
    'insertNodes',
    (nodes: ElementOrTextIn<V> | ElementOrTextIn<V>[], options = {}) => {
      editor.update((tx) => {
        tx.nodes.insert(nodes, options);
      });
    }
  );
  setTf('removeMark', (key: string) => {
    editor.update((tx) => {
      tx.marks.remove(key);
    });
  });
  setTf('removeMarks', (keys?: string[] | string) => {
    const markKeys =
      keys === undefined
        ? Object.keys(editor.read((state) => state.marks.get()) ?? {})
        : Array.isArray(keys)
          ? keys
          : [keys];

    editor.update((tx) => {
      for (const key of markKeys) {
        tx.marks.remove(key);
      }
    });
  });
  setTf('removeNodes', (options = {}) => {
    editor.update((tx) => {
      tx.nodes.remove(options);
    });
  });
  setTf('setNodes', (props: Partial<NodeProps<NodeIn<V>>>, options = {}) => {
    editor.update((tx) => {
      tx.nodes.set(props, options);
    });
  });
  setTf('toggleMark', (key: string, valueOrOptions: unknown = true) => {
    const options =
      valueOrOptions &&
      typeof valueOrOptions === 'object' &&
      'remove' in valueOrOptions
        ? (valueOrOptions as { remove?: string[] | string; value?: unknown })
        : undefined;
    const remove = options?.remove;
    const removeKeys = remove
      ? Array.isArray(remove)
        ? remove
        : [remove]
      : [];
    const value = options ? (options.value ?? true) : valueOrOptions;

    editor.update((tx) => {
      for (const removeKey of removeKeys) {
        tx.marks.remove(removeKey);
      }

      tx.marks.toggle(key, value);
    });
  });
  setTf('withoutNormalizing', (fn: () => void) => fn());
};

const installRuntimeDomExtension = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeDomOperations) return;

  let activeScrollOperations: Operation[] = [];
  const extension = defineEditorExtension({
    name: 'plate:dom:runtime',
    setup() {
      return {
        api: {
          scrollIntoView: (
            target: PlateRuntimeScrollTarget,
            options?: ScrollIntoViewOptions
          ) => scrollPlateRuntimeTargetIntoView(editor, target, options),
        },
        onCommit() {
          activeScrollOperations = [];
        },
        operations: {
          apply({ operation, next }) {
            if (operation.type === 'set_selection') {
              editor.dom.prevSelection = operation.properties as Selection;
              next(operation);
              editor.dom.currentKeyboardEvent = null;
              return;
            }

            next(operation);

            if (!AUTO_SCROLL.get(editor)) return;

            const options =
              editor.getOptions<NonNullable<DomConfigOptions>>(DOMPlugin);
            const enabled = options.scrollOperations?.[operation.type];

            if (!enabled) return;

            activeScrollOperations.push(operation);

            const targetOperation =
              options.scrollMode === 'first'
                ? activeScrollOperations[0]
                : activeScrollOperations.at(-1);

            if (!targetOperation) return;

            const target = getRuntimeOperationScrollTarget(targetOperation);

            if (!target) return;

            getPlateRuntimeScrollApi(editor).scrollIntoView(
              target,
              options.scrollOptions
            );
          },
        },
      };
    },
  });

  plugin.runtimeDomExtensionCleanup = editor.extend(extension);
  plugin.runtimeDomExtension = extension;
};

const installRuntimeSlateExtensionPipeline = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeSlateExtensionPipeline) return;

  const extension = defineEditorExtension({
    name: 'plate:slate-extension:runtime',
    setup() {
      return {
        operations: {
          apply({ operation, next }) {
            const onNodeChange = getRuntimeSlateExtensionNodeOption<
              V,
              TExtensions
            >(plugin);
            const onTextChange = getRuntimeSlateExtensionTextOption<
              V,
              TExtensions
            >(plugin);
            const hasNodeHandlers =
              editor.meta.pluginCache.handlers.onNodeChange.length > 0 ||
              onNodeChange !== null;
            const hasTextHandlers =
              editor.meta.pluginCache.handlers.onTextChange.length > 0 ||
              onTextChange !== null;

            let node: Descendant | undefined;
            let parentNode: Descendant | undefined;
            let prevNode: Descendant | undefined;
            let prevText: string | undefined;
            let text: string | undefined;

            if (OperationApi.isNodeOperation(operation) && hasNodeHandlers) {
              switch (operation.type) {
                case 'insert_node': {
                  node = operation.node;
                  prevNode = operation.node;
                  break;
                }
                case 'merge_node':
                case 'move_node':
                case 'set_node':
                case 'split_node': {
                  prevNode = getRuntimeDescendant(
                    editor,
                    operation.path,
                    operation.root
                  );
                  break;
                }
                case 'remove_node': {
                  node = operation.node;
                  prevNode = operation.node;
                  break;
                }
              }
            } else if (
              OperationApi.isTextOperation(operation) &&
              hasTextHandlers
            ) {
              parentNode = getRuntimeDescendant(
                editor,
                PathApi.parent(operation.path),
                operation.root
              );
              const textNode = getRuntimeDescendant(
                editor,
                operation.path,
                operation.root
              ) as Text | undefined;
              prevText = textNode?.text;
            }

            next(operation);

            if (OperationApi.isNodeOperation(operation) && hasNodeHandlers) {
              switch (operation.type) {
                case 'insert_node':
                case 'remove_node': {
                  break;
                }
                case 'merge_node': {
                  const prevPath = PathApi.hasPrevious(operation.path)
                    ? PathApi.previous(operation.path)
                    : undefined;

                  if (prevPath) {
                    node = getRuntimeDescendant(
                      editor,
                      prevPath,
                      operation.root
                    );
                  }
                  break;
                }
                case 'move_node': {
                  node = getRuntimeDescendant(
                    editor,
                    operation.newPath,
                    operation.root
                  );
                  break;
                }
                case 'set_node':
                case 'split_node': {
                  node = getRuntimeDescendant(
                    editor,
                    operation.path,
                    operation.root
                  );
                  break;
                }
              }

              node ??= prevNode;

              if (node && prevNode) {
                const eventIsHandled = pipeRuntimeNodeChangeHandlers(
                  editor,
                  node,
                  prevNode,
                  operation
                );

                if (!eventIsHandled) {
                  onNodeChange?.({ editor, node, operation, prevNode });
                }
              }
            }

            if (OperationApi.isTextOperation(operation) && hasTextHandlers) {
              const textNode = getRuntimeDescendant(
                editor,
                operation.path,
                operation.root
              ) as Text | undefined;
              text = textNode?.text;

              if (parentNode && prevText !== undefined && text !== undefined) {
                const eventIsHandled = pipeRuntimeTextChangeHandlers(
                  editor,
                  parentNode,
                  text,
                  prevText,
                  operation
                );

                if (!eventIsHandled) {
                  onTextChange?.({
                    editor,
                    node: parentNode,
                    operation,
                    prevText,
                    text,
                  });
                }
              }
            }
          },
        },
      };
    },
  });

  plugin.runtimeSlateExtensionPipelineCleanup = editor.extend(extension);
  plugin.runtimeSlateExtensionPipelineExtension = extension;
};

const installRuntimeSlateReactOverride = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeSlateReactOverride) return;

  const extension = defineEditorExtension({
    name: 'plate:slate-react:runtime',
    normalizers: {
      node({ entry, next, tx }) {
        const memoValue = (entry[0] as { _memo?: unknown })._memo;

        if (memoValue != null) {
          tx.nodes.unset('_memo', { at: entry[1] });
          return;
        }

        next();
      },
    },
  });

  plugin.runtimeSlateReactOverrideCleanup = editor.extend(extension);
  plugin.runtimeSlateReactOverrideExtension = extension;
};

const installRuntimeOverrideMergeRules = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeOverrideMergeRules) return;

  const extension = defineEditorExtension({
    name: 'plate:override:merge-rules:runtime',
    setup() {
      return {
        operations: {
          apply({ operation, next }) {
            if (
              OperationApi.isRemoveNodeOperation(operation) &&
              isRuntimeElementNode(operation.node) &&
              operation.node.children.length > 0 &&
              operation.path.length > 0 &&
              shouldRuntimePreserveRemovedMergeTarget(
                editor,
                operation.node,
                operation.path
              )
            ) {
              const nextPath = PathApi.next(operation.path);
              const nextNode = getRuntimeDescendant(
                editor,
                nextPath,
                operation.root
              );

              if (isRuntimeElementNode(nextNode)) {
                for (
                  let index = operation.node.children.length - 1;
                  index >= 0;
                  index--
                ) {
                  next({
                    node: operation.node.children[index] as Descendant,
                    path: [...operation.path, index],
                    root: operation.root,
                    type: 'remove_node',
                  });
                }

                next({
                  path: nextPath,
                  position: 0,
                  properties: getRuntimeMergeNodeProperties(nextNode),
                  root: operation.root,
                  type: 'merge_node',
                });
                return;
              }
            }

            next(operation);
          },
        },
      };
    },
    queries: {
      nodes: {
        shouldMergeNodesRemovePrevNode({ current, next, previous }) {
          const [previousNode, previousPath] = previous;
          const [, currentPath] = current;

          if (
            isRuntimeTextNode(previousNode) &&
            previousNode.text === '' &&
            previousPath.at(-1) !== 0
          ) {
            return true;
          }

          if (
            isRuntimeElementNode(previousNode) &&
            getRuntimeNodeText(previousNode).length === 0 &&
            PathApi.isSibling(previousPath, currentPath)
          ) {
            return shouldRuntimeRemoveEmptyMergeTarget(
              editor,
              previousNode,
              previousPath
            );
          }

          return next({ current, previous });
        },
      },
    },
  });

  plugin.runtimeOverrideMergeRulesCleanup = editor.extend(extension);
  plugin.runtimeOverrideMergeRulesExtension = extension;
};

const installRuntimeOverrideNormalizeRules = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  const normalizeRulesOwner =
    editor.meta.pluginList.find(
      (candidate) => candidate.runtimeOverrideNormalizeRules
    ) ?? editor.meta.pluginList.find((candidate) => candidate.rules?.normalize);

  if (normalizeRulesOwner?.key !== plugin.key) return;

  const extension = defineEditorExtension({
    name: `plate:${plugin.key}:normalize-rules:runtime`,
    normalizers: {
      node({ entry, next, tx }) {
        const [node, path] = entry;

        if (
          isRuntimeElementNode(node) &&
          getRuntimeNodeText(node).length === 0 &&
          shouldRuntimeRemoveEmptyNormalizeTarget(editor, node, path)
        ) {
          tx.nodes.remove({ at: path });
          return;
        }

        next();
      },
    },
  });

  plugin.runtimeOverrideNormalizeRulesCleanup = editor.extend(extension);
  plugin.runtimeOverrideNormalizeRulesExtension = extension;
};

const isRuntimeLiftableBlockquoteChild = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  node: unknown,
  path: number[],
  blockquoteType: string
) => {
  if (!isRuntimeElementNode(node)) return false;

  const paragraphType = getRuntimeParagraphType(editor);

  if (
    node.type !== paragraphType ||
    (node as Record<string, unknown>).listType
  ) {
    return false;
  }

  return !!findRuntimeAncestorPath(editor, path, { type: blockquoteType });
};

const getRuntimeLiftableBlockquoteChildren = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  blockquoteType: string
) => {
  const selection = editor.read((state) => state.selection.get());

  if (!selection) return [];

  return editor.read((state) =>
    Array.from(
      state.nodes.entries<SlateElement>({
        at: selection,
        match: (node, path) =>
          isRuntimeLiftableBlockquoteChild(editor, node, path, blockquoteType),
      })
    )
  );
};

type RuntimeCaptionOptions = {
  focusEndPath?: number[] | null;
  focusStartPath?: number[] | null;
  query?: {
    allow?: readonly string[];
  };
  visibleId?: string | null;
};

const isRuntimeArrowUpEvent = (event: KeyboardEventLike | null) =>
  event?.key === 'ArrowUp' || event?.key === 'Up' || event?.which === 38;

const getRuntimeCaptionAllowedTypes = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  const options = editor.getOptions<RuntimeCaptionOptions>(plugin);

  return new Set(
    (options.query?.allow ?? []).map((key) => editor.getType(key))
  );
};

const getRuntimeCaptionEntry = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin,
  at: Location
) => {
  const allowedTypes = getRuntimeCaptionAllowedTypes(editor, plugin);

  if (allowedTypes.size === 0) return;

  return editor.read((state) =>
    state.nodes.above<SlateElement>({
      at,
      match: (node) =>
        ElementApi.isElement(node) &&
        typeof node.type === 'string' &&
        allowedTypes.has(node.type),
    })
  );
};

const getRuntimeSetSelectionRange = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  operation: Operation
): Range | null => {
  if (operation.type !== 'set_selection') return null;

  const newProperties = (
    operation as Operation & {
      newProperties?: Partial<Range> | null;
    }
  ).newProperties;
  const selection = editor.read((state) => state.selection.get());
  const candidate = {
    ...(selection ?? {}),
    ...(newProperties ?? {}),
  };

  return RangeApi.isRange(candidate) ? candidate : null;
};

const hasRuntimePluginTx = (plugin: PlateRuntimePlugin) =>
  Object.keys(plugin.tx ?? {}).length > 0 ||
  (plugin.__txExtensions?.length ?? 0) > 0;

const RUNTIME_SINGLE_LINE_BREAK_RE = /[\r\n\u2028\u2029]/;

const RUNTIME_SINGLE_LINE_BREAK_GLOBAL_RE = /[\r\n\u2028\u2029]/g;

const RUNTIME_CODE_BLOCK_INDENT_RE = /^[\t ]*/;
const RUNTIME_CODE_BLOCK_LEADING_WHITESPACE_RE = /^\s{1,2}/;
const RUNTIME_CODE_BLOCK_NON_WHITESPACE_RE = /\S/;
const RUNTIME_LIST_CHECKED_KEY = 'checked';
const RUNTIME_LIST_INDENT_KEY = 'indent';
const RUNTIME_LIST_RESTART_KEY = 'listRestart';
const RUNTIME_LIST_RESTART_POLITE_KEY = 'listRestartPolite';
const RUNTIME_LIST_START_KEY = 'listStart';
const RUNTIME_LIST_STYLE_TYPE_KEY = 'listStyleType';
const RUNTIME_LIST_TODO_STYLE_TYPE = 'todo';
const RUNTIME_CLASSIC_TODO_LIST_KEY = 'action_item';
const RUNTIME_UNORDERED_LIST_STYLE_TYPES = new Set([
  'circle',
  'disc',
  'disclosure-closed',
  'disclosure-open',
  'square',
]);

const hasRuntimeInsertTextAt = (options?: RuntimeInsertTextOptions) =>
  options?.at !== undefined;

const matchesRuntimeTrigger = (
  trigger: RuntimeTriggerComboboxOptions['trigger'],
  text: string
) => {
  if (trigger instanceof RegExp) return trigger.test(text);
  if (Array.isArray(trigger)) return trigger.includes(text);

  return text === trigger;
};

const getRuntimePreviousCharacter = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
) => {
  const selection = editor.read((state) => state.selection.get());

  if (!selection || !RangeApi.isCollapsed(selection)) return '';

  const beforePoint = editor.read((state) =>
    state.points.before(selection, { distance: 1, unit: 'character' })
  );

  if (!beforePoint) return '';

  return editor.read((state) =>
    state.text.string({ anchor: beforePoint, focus: selection.anchor })
  );
};

const createRuntimeComboboxInput = (
  plugin: PlateRuntimePlugin,
  options: RuntimeTriggerComboboxOptions,
  trigger: string
): SlateElement & { userId?: string } =>
  (options.createComboboxInput?.(trigger) ?? {
    children: [{ text: '' }],
    type: plugin.node?.type ?? plugin.key,
  }) as SlateElement & { userId?: string };

const installRuntimeTriggerCombobox = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeTriggerCombobox) return;

  const previousInsertText = getPlateRuntimeTransforms(editor).insertText;

  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    insertText: (text: string, options?: RuntimeInsertTextOptions) => {
      const triggerOptions =
        editor.getOptions<RuntimeTriggerComboboxOptions>(plugin);

      if (
        hasRuntimeInsertTextAt(options) ||
        !matchesRuntimeTrigger(triggerOptions.trigger, text) ||
        triggerOptions.triggerQuery?.(editor) === false
      ) {
        return previousInsertText(text, options);
      }

      const previousChar = getRuntimePreviousCharacter(editor);

      if (!triggerOptions.triggerPreviousCharPattern?.test(previousChar)) {
        return previousInsertText(text, options);
      }

      const inputNode = createRuntimeComboboxInput(
        plugin,
        triggerOptions,
        text
      );

      if (editor.meta.userId) {
        inputNode.userId = editor.meta.userId;
      }

      editor.update((tx) => {
        tx.nodes.insert(inputNode as ElementOrTextIn<V>);
      });

      return true;
    },
  }) as PlateRuntimeTransforms;
};

type RuntimeToggleElement = SlateElement & {
  id?: unknown;
  indent?: unknown;
  listStyleType?: unknown;
  type?: unknown;
};

type RuntimeToggleOptions = {
  openIds?: Set<string>;
};

type RuntimeToggleMoveResult = 'blocked' | 'moved' | undefined;

const RUNTIME_TOGGLE_LIST_STYLE_TYPE_KEY = 'listStyleType';

const isRuntimeToggleIndexElement = (
  node: unknown
): node is RuntimeToggleElement & { id: string } =>
  isRuntimeElementNode(node) && typeof node.id === 'string';

const getRuntimeToggleIndent = (node: RuntimeToggleElement) =>
  typeof node.indent === 'number' ? node.indent : 0;

const getRuntimeToggleComparableIndent = (node: RuntimeToggleElement) => {
  const indent = getRuntimeToggleIndent(node);

  if (
    node[RUNTIME_TOGGLE_LIST_STYLE_TYPE_KEY] !== undefined &&
    typeof node.indent === 'number'
  ) {
    return indent - 1;
  }

  return indent;
};

const buildRuntimeToggleIndex = (
  elements: readonly Descendant[],
  toggleType: string
) => {
  const result = new Map<string, string[]>();
  let currentEnclosingToggles: [id: string, indent: number][] = [];

  elements.forEach((element) => {
    if (!isRuntimeToggleIndexElement(element)) return;

    const elementIndent = getRuntimeToggleComparableIndent(element);
    const enclosingToggles = currentEnclosingToggles.filter(
      ([, indent]) => indent < elementIndent
    );

    currentEnclosingToggles = enclosingToggles;
    result.set(
      element.id,
      enclosingToggles.map(([toggleId]) => toggleId)
    );

    if (element.type === toggleType) {
      currentEnclosingToggles.push([
        element.id,
        getRuntimeToggleIndent(element),
      ]);
    }
  });

  return result;
};

const getRuntimeToggleRoot = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
) => editor.read((state) => state.value.root());

const getRuntimeToggleOpenIds = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  const { openIds } = editor.getOptions<RuntimeToggleOptions>(plugin);

  return openIds ?? new Set<string>();
};

const isRuntimeToggleOpen = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin,
  toggleId: string
) => getRuntimeToggleOpenIds(editor, plugin).has(toggleId);

const isRuntimeInClosedToggle = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin,
  toggleType: string,
  elementId: string
) => {
  const toggleIndex = buildRuntimeToggleIndex(
    getRuntimeToggleRoot(editor),
    toggleType
  );
  const enclosingToggleIds = toggleIndex.get(elementId) ?? [];
  const openIds = getRuntimeToggleOpenIds(editor, plugin);

  return enclosingToggleIds.some((toggleId) => !openIds.has(toggleId));
};

const getRuntimeToggleTopLevelEntry = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  at?: Location
): NodeEntry<SlateElement> | undefined => {
  const blockPath = getRuntimeBlockPath(editor, at);

  if (!blockPath) return;

  const topLevelPath = [blockPath[0]];
  const node = getRuntimeDescendant(editor, topLevelPath);

  if (!isRuntimeElementNode(node)) return;

  return [node, topLevelPath];
};

const getRuntimeLastEntryEnclosedInToggle = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  toggleType: string,
  toggleId: string
): NodeEntry<RuntimeToggleElement & { id: string }> | undefined => {
  const root = getRuntimeToggleRoot(editor);
  const toggleIndex = buildRuntimeToggleIndex(root, toggleType);
  let lastEntry: NodeEntry<RuntimeToggleElement & { id: string }> | undefined;

  root.forEach((node, index) => {
    if (!isRuntimeToggleIndexElement(node)) return;

    if ((toggleIndex.get(node.id) ?? []).includes(toggleId)) {
      lastEntry = [node, [index]];
    }
  });

  return lastEntry;
};

const findRuntimeToggleSelectableIndexBefore = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin,
  toggleType: string,
  beforeIndex: number
) => {
  const root = getRuntimeToggleRoot(editor);

  for (let index = beforeIndex - 1; index >= 0; index--) {
    const node = root[index];

    if (
      isRuntimeToggleIndexElement(node) &&
      !isRuntimeInClosedToggle(editor, plugin, toggleType, node.id)
    ) {
      return index;
    }
  }
};

const findRuntimeToggleSelectableIndexAfter = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin,
  toggleType: string,
  afterIndex: number
) => {
  const root = getRuntimeToggleRoot(editor);

  for (let index = afterIndex + 1; index < root.length; index++) {
    const node = root[index];

    if (
      isRuntimeToggleIndexElement(node) &&
      !isRuntimeInClosedToggle(editor, plugin, toggleType, node.id)
    ) {
      return index;
    }
  }
};

const moveRuntimeCurrentBlockAfterPreviousSelectable = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin,
  toggleType: string
): RuntimeToggleMoveResult => {
  const selection = editor.read((state) => state.selection.get());

  if (!selection || !RangeApi.isCollapsed(selection)) return;

  const entry = getRuntimeToggleTopLevelEntry(editor, selection);

  if (!entry) return;

  const [, path] = entry;

  if (
    !isRuntimeSelectionAtBlockEdge(editor, selection, path, 'start') ||
    path[0] <= 0
  ) {
    return;
  }

  const previousNode = getRuntimeToggleRoot(editor)[path[0] - 1];

  if (
    !isRuntimeToggleIndexElement(previousNode) ||
    !isRuntimeInClosedToggle(editor, plugin, toggleType, previousNode.id)
  ) {
    return;
  }

  const previousSelectableIndex = findRuntimeToggleSelectableIndexBefore(
    editor,
    plugin,
    toggleType,
    path[0]
  );

  if (previousSelectableIndex === undefined) return 'blocked';

  editor.update((tx) => {
    tx.nodes.move({ at: path, to: [previousSelectableIndex + 1] });
  });

  return 'moved';
};

const moveRuntimeNextSelectableAfterCurrentBlock = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin,
  toggleType: string
): RuntimeToggleMoveResult => {
  const selection = editor.read((state) => state.selection.get());

  if (!selection || !RangeApi.isCollapsed(selection)) return;

  const entry = getRuntimeToggleTopLevelEntry(editor, selection);

  if (!entry) return;

  const [, path] = entry;

  if (!isRuntimeSelectionAtBlockEdge(editor, selection, path, 'end')) {
    return;
  }

  const root = getRuntimeToggleRoot(editor);
  const nextNode = root[path[0] + 1];

  if (
    !isRuntimeToggleIndexElement(nextNode) ||
    !isRuntimeInClosedToggle(editor, plugin, toggleType, nextNode.id)
  ) {
    return;
  }

  const nextSelectableIndex = findRuntimeToggleSelectableIndexAfter(
    editor,
    plugin,
    toggleType,
    path[0]
  );

  if (nextSelectableIndex === undefined) return 'blocked';

  editor.update((tx) => {
    tx.nodes.move({ at: [nextSelectableIndex], to: [path[0] + 1] });
  });

  return 'moved';
};

const installRuntimeToggle = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeToggle) return;

  const toggleType = editor.getType(plugin.key);
  const paragraphType = getRuntimeParagraphType(editor);
  const previousDeleteBackward =
    getPlateRuntimeTransforms(editor).deleteBackward;
  const previousDeleteForward = getPlateRuntimeTransforms(editor).deleteForward;
  const previousInsertBreak = getPlateRuntimeTransforms(editor).insertBreak;
  const previousIsSelectable = (editor.api as { isSelectable?: unknown })
    .isSelectable;

  plugin.api = mergePlugins(plugin.api ?? {}, {
    isSelectable: (element: unknown) => {
      if (
        isRuntimeToggleIndexElement(element) &&
        isRuntimeInClosedToggle(editor, plugin, toggleType, element.id)
      ) {
        return false;
      }

      if (typeof previousIsSelectable === 'function') {
        return (previousIsSelectable as (element: unknown) => boolean)(element);
      }

      return true;
    },
  });

  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    deleteBackward: (unit?: TextUnit) => {
      const moveResult = moveRuntimeCurrentBlockAfterPreviousSelectable(
        editor,
        plugin,
        toggleType
      );

      if (moveResult === 'blocked') return true;

      previousDeleteBackward(unit);
      return true;
    },
    deleteForward: (unit?: TextUnit) => {
      const moveResult = moveRuntimeNextSelectableAfterCurrentBlock(
        editor,
        plugin,
        toggleType
      );

      if (moveResult === 'blocked') return true;

      previousDeleteForward(unit);
      return true;
    },
    insertBreak: () => {
      const selection = editor.read((state) => state.selection.get());
      const currentBlockEntry = getRuntimeToggleTopLevelEntry(
        editor,
        selection ?? undefined
      );

      if (!currentBlockEntry || currentBlockEntry[0].type !== toggleType) {
        return previousInsertBreak();
      }

      const [currentBlock, currentPath] = currentBlockEntry;
      const toggleId =
        typeof currentBlock.id === 'string' ? currentBlock.id : undefined;

      if (!toggleId) return previousInsertBreak();

      const isOpen = isRuntimeToggleOpen(editor, plugin, toggleId);
      const lastEntryEnclosedInToggle = isOpen
        ? undefined
        : getRuntimeLastEntryEnclosedInToggle(editor, toggleType, toggleId);

      previousInsertBreak();

      const newlyInsertedTogglePath = [currentPath[0] + 1];

      if (isOpen) {
        editor.update((tx) => {
          tx.nodes.set<SlateElement>(
            {
              indent: getRuntimeToggleIndent(currentBlock) + 1,
              type: paragraphType,
            } as Partial<SlateElement>,
            { at: newlyInsertedTogglePath }
          );
        });
        return true;
      }

      if (lastEntryEnclosedInToggle) {
        editor.update((tx) => {
          tx.nodes.move({
            at: newlyInsertedTogglePath,
            to: [lastEntryEnclosedInToggle[1][0] + 1],
          });
        });
      }

      return true;
    },
  }) as PlateRuntimeTransforms;
};

const installRuntimeLink = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeLink) return;

  const type = editor.getType(plugin.key);
  const previousInsertText = getPlateRuntimeTransforms(editor).insertText;

  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    insertText: (text: string, options?: RuntimeInsertTextOptions) => {
      const selection = editor.read((state) => state.selection.get());

      if (
        !hasRuntimeInsertTextAt(options) &&
        selection?.focus &&
        RangeApi.isCollapsed(selection)
      ) {
        const linkEntry = editor.api.above({
          at: selection.focus,
          match: (node: unknown) =>
            isRuntimeElementNode(node) && node.type === type,
        });

        if (
          linkEntry &&
          editor.read((state) =>
            state.points.isEnd(selection.focus, linkEntry[1])
          )
        ) {
          const nextPath = PathApi.next(linkEntry[1]);
          const nextPoint = editor.read((state) =>
            state.nodes.hasPath(nextPath)
              ? state.points.start(nextPath)
              : undefined
          ) ?? { offset: 0, path: nextPath };

          editor.update((tx) => {
            if (!editor.read((state) => state.nodes.hasPath(nextPath))) {
              tx.nodes.insert({ text: '' } as ElementOrTextIn<V>, {
                at: nextPath,
              });
            }

            tx.selection.set({ anchor: nextPoint, focus: nextPoint });
          });
        }
      }

      return previousInsertText(text, options);
    },
  }) as PlateRuntimeTransforms;

  const extension = defineEditorExtension({
    name: 'plate:link:runtime',
    normalizers: {
      node({ entry, next, tx }) {
        const [node, path] = entry;

        if (!isRuntimeElementNode(node) || node.type !== type) {
          next();
          return;
        }

        if (getRuntimeNodeText(node).length === 0) {
          next();
          return;
        }

        const selection = editor.read((state) => state.selection.get());

        if (!selection || !RangeApi.isCollapsed(selection)) {
          next();
          return;
        }

        const focusEntry = editor.read((state) =>
          state.nodes.hasPath(selection.focus.path)
            ? state.nodes.get(selection.focus.path)
            : undefined
        );
        const focusIsValid =
          !!focusEntry &&
          (!TextApi.isText(focusEntry[0]) ||
            selection.focus.offset <= focusEntry[0].text.length);
        const endPoint = editor.read((state) => state.points.end(path));

        if (!focusIsValid || !PointApi.equals(selection.focus, endPoint)) {
          next();
          return;
        }

        const nextPath = PathApi.next(path);
        const hasNextPath = editor.read((state) =>
          state.nodes.hasPath(nextPath)
        );

        if (!hasNextPath) {
          tx.nodes.insert({ text: '' } as ElementOrTextIn<V>, { at: nextPath });
        }
      },
    },
  });

  plugin.runtimeLinkCleanup = editor.extend(extension);
  plugin.runtimeLinkExtension = extension;
};

type RuntimeCommentText = Text & Record<string, unknown>;

type RuntimeCommentNodeOptions = {
  at?: Location;
  id?: string;
  isDraft?: boolean;
  mode?: 'all' | 'highest' | 'lowest';
  pass?: (entry: NodeEntry) => boolean;
  reverse?: boolean;
  transient?: boolean;
  universal?: boolean;
  voids?: boolean;
};

const getRuntimeCommentDraftKey = (commentKey: string) => `${commentKey}_draft`;

const getRuntimeCommentTransientKey = (commentKey: string) =>
  `${commentKey}Transient`;

const getRuntimeCommentKey = (commentKey: string, id: string) =>
  `${commentKey}_${id}`;

const getRuntimeCommentKeyId = (commentKey: string, key: string) =>
  key.replace(`${commentKey}_`, '');

const isRuntimeCommentKey = (commentKey: string, key: string) =>
  key.startsWith(`${commentKey}_`);

const getRuntimeCommentKeys = (commentKey: string, node: RuntimeCommentText) =>
  Object.keys(node).filter((key) => isRuntimeCommentKey(commentKey, key));

const getRuntimeCommentCount = (commentKey: string, node: RuntimeCommentText) =>
  getRuntimeCommentKeys(commentKey, node).filter(
    (key) => key !== getRuntimeCommentDraftKey(commentKey)
  ).length;

const isRuntimeCommentNodeById = (
  commentKey: string,
  node: unknown,
  id: string
) =>
  typeof node === 'object' &&
  node !== null &&
  !!(node as Record<string, unknown>)[getRuntimeCommentKey(commentKey, id)];

const isRuntimeCommentText = (
  commentKey: string,
  node: unknown
): node is RuntimeCommentText =>
  TextApi.isText(node) && !!(node as Record<string, unknown>)[commentKey];

const matchesRuntimeCommentText = (
  commentKey: string,
  node: unknown,
  { id, isDraft, transient }: RuntimeCommentNodeOptions
): node is RuntimeCommentText => {
  if (!isRuntimeCommentText(commentKey, node)) return false;

  if (isDraft) return !!node[getRuntimeCommentDraftKey(commentKey)];
  if (transient) return !!node[getRuntimeCommentTransientKey(commentKey)];

  return id ? isRuntimeCommentNodeById(commentKey, node, id) : true;
};

const getRuntimeCommentNodeOptions = (
  commentKey: string,
  options: RuntimeCommentNodeOptions = {}
) => {
  const { id, isDraft, transient, ...nodeOptions } = options;

  return {
    ...nodeOptions,
    match: (node: unknown) =>
      matchesRuntimeCommentText(commentKey, node, {
        id,
        isDraft,
        transient,
      }),
  };
};

const getRuntimeCommentNodes = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin,
  options: RuntimeCommentNodeOptions = {}
) =>
  editor.read((state) =>
    state.nodes.toArray<RuntimeCommentText>(
      getRuntimeCommentNodeOptions(plugin.key, options)
    )
  );

const getRuntimeCommentNodeId = (
  commentKey: string,
  leaf: RuntimeCommentText
) => {
  const keys = Object.keys(leaf);

  if (keys.includes(getRuntimeCommentDraftKey(commentKey))) return;

  const ids = keys
    .filter(
      (key) =>
        isRuntimeCommentKey(commentKey, key) &&
        key !== getRuntimeCommentDraftKey(commentKey)
    )
    .map((key) => getRuntimeCommentKeyId(commentKey, key));

  return ids.at(-1);
};

const installRuntimeComment = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeComment) return;

  const extension = defineEditorExtension({
    name: 'plate:comment:runtime',
    normalizers: {
      node({ entry, next, tx }) {
        const [node, path] = entry;

        if (
          isRuntimeCommentText(plugin.key, node) &&
          !node[getRuntimeCommentDraftKey(plugin.key)] &&
          getRuntimeCommentCount(plugin.key, node) < 1
        ) {
          tx.nodes.unset(plugin.key, { at: path });
          return;
        }

        next();
      },
    },
  });

  plugin.runtimeCommentCleanup = editor.extend(extension);
  plugin.runtimeCommentExtension = extension;
  plugin.api = mergePlugins(plugin.api ?? {}, {
    comment: {
      has: ({ id }: { id: string }) =>
        getRuntimeCommentNodes(editor, plugin, { at: [], id }).length > 0,
      node: (options?: RuntimeCommentNodeOptions) =>
        getRuntimeCommentNodes(editor, plugin, options)[0],
      nodeId: (leaf: RuntimeCommentText) =>
        getRuntimeCommentNodeId(plugin.key, leaf),
      nodes: (options?: RuntimeCommentNodeOptions) =>
        getRuntimeCommentNodes(editor, plugin, options),
    },
  }) as Record<string, unknown>;
};

const getRuntimeCodeBlockIndent = (node: unknown) => {
  const text = getRuntimeNodeText(node);

  return RUNTIME_CODE_BLOCK_INDENT_RE.exec(text)?.[0] ?? '';
};

const createRuntimeCodeLine = (type: string, text: string): SlateElement => ({
  children: [{ text }],
  type,
});

const createRuntimeCodeLines = (type: string, lines: string[]) =>
  lines.map((line) => createRuntimeCodeLine(type, line));

const createRuntimeCodeBlock = ({
  codeBlockType,
  codeLineType,
  lang,
  lines,
}: {
  codeBlockType: string;
  codeLineType: string;
  lang?: string;
  lines: string[];
}): SlateElement => ({
  children: createRuntimeCodeLines(codeLineType, lines),
  ...(lang ? { lang } : {}),
  type: codeBlockType,
});

const toRuntimeCodeLineFragment = (
  fragment: Descendant[],
  codeBlockType: string,
  codeLineType: string
) =>
  fragment.flatMap((node) => {
    if (isRuntimeElementNode(node) && node.type === codeBlockType) {
      return node.children.filter(isRuntimeElementNode) as SlateElement[];
    }

    return [createRuntimeCodeLine(codeLineType, getRuntimeNodeText(node))];
  });

const getRuntimeElementEndPoint = (
  path: number[],
  element: SlateElement
): Point => {
  for (let index = element.children.length - 1; index >= 0; index--) {
    const child = element.children[index];

    if (TextApi.isText(child)) {
      return { offset: child.text.length, path: [...path, index] };
    }
  }

  return { offset: 0, path: [...path, 0] };
};

const getRuntimeVscodePasteMode = (data: DataTransfer) => {
  const vscodeData = data.getData('vscode-editor-data');

  if (!vscodeData) return;

  try {
    const parsed = JSON.parse(vscodeData) as { mode?: unknown };

    return typeof parsed.mode === 'string' ? parsed.mode : '';
  } catch {
    return;
  }
};

const getRuntimeCodeBlockPath = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  path: number[],
  codeBlockType: string
) => {
  const node = getRuntimeDescendant(editor, path);

  if (isRuntimeElementNode(node) && node.type === codeBlockType) {
    return path;
  }

  return findRuntimeAncestorPath(editor, path, { type: codeBlockType });
};

const isRuntimeCodeLineSelected = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  selection: Range,
  path: number[]
) => {
  try {
    return (
      RangeApi.includes(selection, path) ||
      RangeApi.includes(
        selection,
        getRuntimeEdgePoint(editor, path, 'start')
      ) ||
      RangeApi.includes(selection, getRuntimeEdgePoint(editor, path, 'end'))
    );
  } catch {
    return false;
  }
};

const getRuntimeSelectedCodeLinePaths = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  selection: Range,
  codeBlockType: string,
  codeLineType: string
) => {
  if (RangeApi.isCollapsed(selection)) {
    const blockPath = getRuntimeBlockPath(editor, selection);
    const blockNode = blockPath
      ? getRuntimeDescendant(editor, blockPath)
      : undefined;

    return blockPath &&
      isRuntimeElementNode(blockNode) &&
      blockNode.type === codeLineType &&
      getRuntimeCodeBlockPath(editor, blockPath, codeBlockType)
      ? [blockPath]
      : [];
  }

  return getRuntimeRootNodeEntries(editor)
    .filter((entry): entry is [SlateElement, number[]] => {
      const [node, path] = entry;

      return (
        isRuntimeElementNode(node) &&
        node.type === codeLineType &&
        !!getRuntimeCodeBlockPath(editor, path, codeBlockType) &&
        isRuntimeCodeLineSelected(editor, selection, path)
      );
    })
    .map(([, path]) => path)
    .sort(PathApi.compare);
};

const insertRuntimeCodeLinesAtCodeLine = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  blockPath: number[],
  lines: SlateElement[]
) => {
  const firstLine = lines[0];
  const firstLineText = getRuntimeNodeText(firstLine);
  const remainingLines = lines.slice(1);
  let nextSelection: Range | undefined;

  editor.update((tx) => {
    if (firstLineText.length > 0) {
      tx.text.insert(firstLineText);
    }

    if (remainingLines.length > 0) {
      const insertPath = PathApi.next(blockPath);
      const lastInsertedIndex =
        (insertPath.at(-1) ?? 0) + remainingLines.length - 1;
      const lastInsertedPath = [...insertPath.slice(0, -1), lastInsertedIndex];
      const lastLine = remainingLines.at(-1)!;
      const focus = getRuntimeElementEndPoint(lastInsertedPath, lastLine);

      tx.nodes.insert(remainingLines as ElementOrTextIn<V>[], {
        at: insertPath,
      });
      nextSelection = { anchor: focus, focus };
    }
  });

  const selectionAfterInsert = nextSelection;

  if (selectionAfterInsert) {
    editor.update((tx) => {
      tx.selection.set(selectionAfterInsert);
    });
  }
};

const installRuntimeCodeBlock = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeCodeBlock) return;

  const codeBlockType = editor.getType(plugin.key);
  const codeLineType = editor.getType('code_line');
  const previousDeleteBackward =
    getPlateRuntimeTransforms(editor).deleteBackward;
  const previousInsertBreak = getPlateRuntimeTransforms(editor).insertBreak;
  const previousInsertData = getPlateRuntimeTransforms(editor).insertData;
  const previousInsertFragment =
    getPlateRuntimeTransforms(editor).insertFragment;
  const previousResetBlock = getPlateRuntimeTransforms(editor).resetBlock;
  const previousSelectAll = getPlateRuntimeTransforms(editor).selectAll;
  const previousTab = getPlateRuntimeTransforms(editor).tab;
  const extension = defineEditorExtension({
    name: 'plate:code-block:runtime',
    normalizers: {
      node({ entry, next, tx }) {
        const [node, path] = entry;

        if (isRuntimeElementNode(node) && node.type === codeBlockType) {
          const nonCodeLineIndex = node.children.findIndex(
            (child) =>
              !isRuntimeElementNode(child) || child.type !== codeLineType
          );

          if (nonCodeLineIndex >= 0) {
            tx.nodes.set<SlateElement>(
              { type: codeLineType } as Partial<SlateElement>,
              { at: [...path, nonCodeLineIndex] }
            );
            return;
          }
        }

        next();
      },
    },
    operations: {
      apply({ operation, next }) {
        let shouldRedecorate = false;

        if (
          (plugin.options as { lowlight?: unknown } | undefined)?.lowlight &&
          OperationApi.isSetNodeOperation(operation)
        ) {
          const oldProps = operation.properties as Record<string, unknown>;
          const newProps = operation.newProperties as Record<string, unknown>;
          const touchesLang =
            Object.hasOwn(oldProps, 'lang') || Object.hasOwn(newProps, 'lang');
          const langChanged = oldProps.lang !== newProps.lang;
          const node = getRuntimeDescendant(editor, operation.path);

          shouldRedecorate =
            touchesLang &&
            langChanged &&
            isRuntimeElementNode(node) &&
            node.type === codeBlockType;
        }

        next(operation);

        if (shouldRedecorate) {
          const redecorate = (editor.api as { redecorate?: unknown })
            .redecorate;

          if (typeof redecorate === 'function') {
            redecorate();
          }
        }
      },
    },
  });

  plugin.runtimeCodeBlockCleanup = editor.extend(extension);
  plugin.runtimeCodeBlockExtension = extension;

  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    deleteBackward: (unit?: TextUnit) => {
      const selection = editor.read((state) => state.selection.get());

      if (!selection || !RangeApi.isCollapsed(selection)) {
        return previousDeleteBackward(unit);
      }

      const codeLinePath = getRuntimeBlockPath(editor, selection);
      const codeLine = codeLinePath
        ? getRuntimeDescendant(editor, codeLinePath)
        : undefined;
      const codeBlockPath = codeLinePath
        ? getRuntimeCodeBlockPath(editor, codeLinePath, codeBlockType)
        : null;

      if (
        !codeLinePath ||
        !codeBlockPath ||
        !isRuntimeElementNode(codeLine) ||
        codeLine.type !== codeLineType ||
        !isRuntimeSelectionAtBlockEdge(editor, selection, codeLinePath, 'start')
      ) {
        return previousDeleteBackward(unit);
      }

      const codeLineText = getRuntimeNodeText(codeLine);
      const codeLineIndex = codeLinePath.at(-1) ?? 0;
      const previousCodeLinePath =
        codeLineIndex > 0 ? PathApi.previous(codeLinePath) : null;
      const previousCodeLine = previousCodeLinePath
        ? getRuntimeDescendant(editor, previousCodeLinePath)
        : undefined;

      if (!isRuntimeElementNode(previousCodeLine)) {
        if (codeLineText.length > 0) return true;

        return getPlateRuntimeTransforms(editor).resetBlock({
          at: codeBlockPath,
        });
      }

      if (
        !previousCodeLinePath ||
        previousCodeLine.type !== codeLineType ||
        codeLineText.length > 0
      ) {
        return previousDeleteBackward(unit);
      }

      const previousLineEnd = getRuntimeEdgePoint(
        editor,
        previousCodeLinePath,
        'end'
      );

      editor.update((tx) => {
        tx.nodes.remove({ at: codeLinePath });
        tx.selection.set(previousLineEnd);
      });

      return true;
    },
    insertBreak: () => {
      const selection = editor.read((state) => state.selection.get());

      if (!selection) return previousInsertBreak();

      const codeLinePath = getRuntimeBlockPath(editor, selection);
      const codeLine = codeLinePath
        ? getRuntimeDescendant(editor, codeLinePath)
        : undefined;

      if (
        !codeLinePath ||
        !isRuntimeElementNode(codeLine) ||
        codeLine.type !== codeLineType ||
        !getRuntimeCodeBlockPath(editor, codeLinePath, codeBlockType)
      ) {
        return previousInsertBreak();
      }

      const indent = getRuntimeCodeBlockIndent(codeLine);
      const result = previousInsertBreak();

      if (indent) {
        editor.update((tx) => {
          tx.text.insert(indent);
        });
      }

      return result ?? true;
    },
    insertFragment: (
      fragment: Parameters<
        PlateRuntimeCoreTransforms<V, TExtensions>['insertFragment']
      >[0],
      options?: Parameters<
        PlateRuntimeCoreTransforms<V, TExtensions>['insertFragment']
      >[1]
    ) => {
      const selection = editor.read((state) => state.selection.get());
      const blockPath = getRuntimeBlockPath(editor, selection ?? undefined);
      const codeBlockPath = blockPath
        ? getRuntimeCodeBlockPath(editor, blockPath, codeBlockType)
        : null;
      const blockNode = blockPath
        ? getRuntimeDescendant(editor, blockPath)
        : undefined;

      if (
        !selection ||
        !blockPath ||
        !codeBlockPath ||
        !isRuntimeElementNode(blockNode) ||
        blockNode.type !== codeLineType
      ) {
        return previousInsertFragment(fragment, options);
      }

      const codeLines = toRuntimeCodeLineFragment(
        fragment,
        codeBlockType,
        codeLineType
      );

      insertRuntimeCodeLinesAtCodeLine(editor, blockPath, codeLines);

      return true;
    },
    insertData: (data: DataTransfer) => {
      const text = data.getData('text/plain');
      const vscodeMode = getRuntimeVscodePasteMode(data);
      const textLines = text.split('\n');
      const selection = editor.read((state) => state.selection.get());
      const blockPath = getRuntimeBlockPath(editor, selection ?? undefined);
      const blockNode = blockPath
        ? getRuntimeDescendant(editor, blockPath)
        : undefined;
      const codeBlockPath = blockPath
        ? getRuntimeCodeBlockPath(editor, blockPath, codeBlockType)
        : null;
      const isInCodeLine =
        !!selection &&
        !!blockPath &&
        !!codeBlockPath &&
        isRuntimeElementNode(blockNode) &&
        blockNode.type === codeLineType;

      if (vscodeMode !== undefined) {
        if (isInCodeLine) {
          insertRuntimeCodeLinesAtCodeLine(
            editor,
            blockPath,
            createRuntimeCodeLines(codeLineType, textLines)
          );

          return true;
        }

        const codeBlock = createRuntimeCodeBlock({
          codeBlockType,
          codeLineType,
          lang: vscodeMode || undefined,
          lines: textLines,
        });
        const insertPath = blockPath ? PathApi.next(blockPath) : undefined;
        const lastLinePath =
          insertPath && codeBlock.children.length > 0
            ? [...insertPath, codeBlock.children.length - 1]
            : undefined;
        const lastLine =
          codeBlock.children.length > 0 ? codeBlock.children.at(-1) : undefined;

        editor.update((tx) => {
          tx.nodes.insert(codeBlock as ElementOrTextIn<V>, { select: true });
        });

        if (lastLinePath && isRuntimeElementNode(lastLine)) {
          const focus = getRuntimeElementEndPoint(lastLinePath, lastLine);

          editor.update((tx) => {
            tx.selection.set({ anchor: focus, focus });
          });
        }

        return true;
      }

      if (isInCodeLine && text.includes('\n')) {
        insertRuntimeCodeLinesAtCodeLine(
          editor,
          blockPath,
          createRuntimeCodeLines(codeLineType, textLines)
        );

        return true;
      }

      return previousInsertData(data);
    },
    resetBlock: (options?: PlateRuntimeResetBlockOptions) => {
      const selection = editor.read((state) => state.selection.get());
      const target = options?.at ?? selection ?? undefined;
      const blockPath = getRuntimeBlockPath(editor, target);
      const codeBlockPath = blockPath
        ? getRuntimeCodeBlockPath(editor, blockPath, codeBlockType)
        : null;
      const codeBlock = codeBlockPath
        ? getRuntimeDescendant(editor, codeBlockPath)
        : undefined;

      if (!codeBlockPath || !isRuntimeElementNode(codeBlock)) {
        return previousResetBlock(options);
      }

      const paragraphType = editor.plugins[BaseParagraphPlugin.key]
        ? editor.getType(BaseParagraphPlugin.key)
        : BaseParagraphPlugin.key;

      editor.update((tx) => {
        codeBlock.children.forEach((_, index) => {
          tx.nodes.set<SlateElement>(
            { type: paragraphType } as Partial<SlateElement>,
            { at: [...codeBlockPath, index] }
          );
        });
        tx.nodes.unwrap<SlateElement>({
          at: codeBlockPath,
          match: (node) =>
            isRuntimeElementNode(node) && node.type === codeBlockType,
        });
      });

      return true;
    },
    selectAll: () => {
      const selection = editor.read((state) => state.selection.get());
      const blockPath = getRuntimeBlockPath(editor, selection ?? undefined);
      const codeBlockPath = blockPath
        ? getRuntimeCodeBlockPath(editor, blockPath, codeBlockType)
        : null;

      if (!selection || !codeBlockPath) {
        return previousSelectAll();
      }

      if (
        isRuntimeSelectionAtBlockEdge(
          editor,
          selection,
          codeBlockPath,
          'start'
        ) &&
        isRuntimeSelectionAtBlockEdge(editor, selection, codeBlockPath, 'end')
      ) {
        return previousSelectAll();
      }

      const anchor = getRuntimeEdgePoint(editor, codeBlockPath, 'start');
      const focus = getRuntimeEdgePoint(editor, codeBlockPath, 'end');

      editor.update((tx) => {
        tx.selection.set({ anchor, focus });
      });

      return true;
    },
    tab: (options: { reverse: boolean }) => {
      const selection = editor.read((state) => state.selection.get());

      if (!selection) return previousTab(options);

      const codeLinePaths = getRuntimeSelectedCodeLinePaths(
        editor,
        selection,
        codeBlockType,
        codeLineType
      );

      if (codeLinePaths.length === 0) return previousTab(options);

      if (options.reverse) {
        const deleteRanges = codeLinePaths.flatMap((path) => {
          const codeLine = getRuntimeDescendant(editor, path);
          const whitespace = RUNTIME_CODE_BLOCK_LEADING_WHITESPACE_RE.exec(
            getRuntimeNodeText(codeLine)
          )?.[0];
          const start = getRuntimeEdgePoint(editor, path, 'start');
          const end = whitespace
            ? editor.read((state) =>
                state.points.after(start, {
                  distance: whitespace.length,
                  unit: 'character',
                })
              )
            : null;

          return whitespace && end ? [{ anchor: start, focus: end }] : [];
        });

        if (deleteRanges.length > 0) {
          editor.update((tx) => {
            deleteRanges.forEach((at) => {
              tx.text.delete({ at });
            });
          });
        }

        return true;
      }

      const collapsedLinePath = RangeApi.isCollapsed(selection)
        ? getRuntimeBlockPath(editor, selection)
        : null;

      editor.update((tx) => {
        codeLinePaths.forEach((path) => {
          const lineStart = getRuntimeEdgePoint(editor, path, 'start');
          const insertionPoint =
            collapsedLinePath &&
            PathApi.equals(collapsedLinePath, path) &&
            RUNTIME_CODE_BLOCK_NON_WHITESPACE_RE.test(
              editor.read((state) =>
                state.text.string({
                  anchor: lineStart,
                  focus: selection.anchor,
                })
              )
            )
              ? selection.anchor
              : lineStart;

          tx.text.insert('  ', { at: insertionPoint });
        });
      });

      return true;
    },
  }) as PlateRuntimeTransforms;
};

type RuntimeListElement = SlateElement & {
  checked?: unknown;
  indent?: unknown;
  listRestart?: unknown;
  listRestartPolite?: unknown;
  listStart?: unknown;
  listStyleType?: unknown;
};

type RuntimeListMutationTx<V extends Value> = {
  nodes: Pick<EditorUpdateTransaction<V>['nodes'], 'set' | 'unset'>;
};

const isRuntimeListElement = (node: unknown): node is RuntimeListElement =>
  isRuntimeElementNode(node) &&
  (node as RuntimeListElement)[RUNTIME_LIST_STYLE_TYPE_KEY] !== undefined;

const getRuntimeListIndent = (node: unknown) => {
  if (!isRuntimeElementNode(node)) return 0;

  const indent = (node as RuntimeListElement)[RUNTIME_LIST_INDENT_KEY];

  return typeof indent === 'number' ? indent : 0;
};

const getRuntimeListNumber = (
  node: RuntimeListElement,
  key: typeof RUNTIME_LIST_RESTART_KEY | typeof RUNTIME_LIST_RESTART_POLITE_KEY
) => {
  const value = node[key];

  return typeof value === 'number' ? value : null;
};

const getRuntimePreviousSiblingElement = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  path: number[]
): NodeEntry<SlateElement> | undefined => {
  if (!PathApi.hasPrevious(path)) return;

  const previousPath = PathApi.previous(path);
  const previousNode = getRuntimeDescendant(editor, previousPath);

  if (!isRuntimeElementNode(previousNode)) return;

  return [previousNode, previousPath];
};

const getRuntimeNextSiblingElement = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  path: number[]
): NodeEntry<SlateElement> | undefined => {
  const nextPath = PathApi.next(path);
  const nextNode = getRuntimeDescendant(editor, nextPath);

  if (!isRuntimeElementNode(nextNode)) return;

  return [nextNode, nextPath];
};

const isRuntimeSameListSequence = (
  current: RuntimeListElement,
  sibling: RuntimeListElement
) =>
  sibling[RUNTIME_LIST_STYLE_TYPE_KEY] ===
    current[RUNTIME_LIST_STYLE_TYPE_KEY] &&
  getRuntimeListIndent(sibling) === getRuntimeListIndent(current);

const getRuntimePreviousListEntry = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  entry: NodeEntry<RuntimeListElement>
): NodeEntry<RuntimeListElement> | undefined => {
  const previous = getRuntimePreviousSiblingElement(editor, entry[1]);

  if (!previous || !isRuntimeListElement(previous[0])) return;

  return isRuntimeSameListSequence(entry[0], previous[0])
    ? (previous as NodeEntry<RuntimeListElement>)
    : undefined;
};

const getRuntimePreviousIndentedListEntry = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  entry: NodeEntry<RuntimeListElement>
): NodeEntry<RuntimeListElement> | undefined => {
  const previous = getRuntimePreviousSiblingElement(editor, entry[1]);

  if (!previous || !isRuntimeListElement(previous[0])) return;

  return getRuntimeListIndent(previous[0]) === getRuntimeListIndent(entry[0])
    ? (previous as NodeEntry<RuntimeListElement>)
    : undefined;
};

const getRuntimeExpectedListStart = (
  entry: NodeEntry<RuntimeListElement>,
  previous?: NodeEntry<RuntimeListElement>
) => {
  const [node] = entry;
  const [previousNode] = previous ?? [];
  const restart = getRuntimeListNumber(node, RUNTIME_LIST_RESTART_KEY);
  const restartPolite = getRuntimeListNumber(
    node,
    RUNTIME_LIST_RESTART_POLITE_KEY
  );

  if (restart) return restart;
  if (restartPolite && !previousNode) return restartPolite;

  if (previousNode) {
    return typeof previousNode.listStart === 'number'
      ? previousNode.listStart + 1
      : 2;
  }

  return 1;
};

const normalizeRuntimeListEntry = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  tx: RuntimeListMutationTx<V>,
  editor: PlateRuntimeEditor<V, TExtensions>,
  entry: NodeEntry<SlateElement>
) => {
  const [node, path] = entry;

  if (!isRuntimeElementNode(node)) return false;

  const listNode = node as RuntimeListElement;

  if (
    getRuntimeListIndent(listNode) === 0 &&
    (listNode.listStyleType !== undefined || listNode.listStart !== undefined)
  ) {
    tx.nodes.unset([RUNTIME_LIST_STYLE_TYPE_KEY, RUNTIME_LIST_START_KEY], {
      at: path,
    });
    return true;
  }

  if (!isRuntimeListElement(listNode)) return false;

  const previousIndented = getRuntimePreviousIndentedListEntry(editor, [
    listNode,
    path,
  ]);

  if (
    listNode.listStyleType === 'lower-roman' &&
    previousIndented?.[0].listStyleType === 'lower-alpha'
  ) {
    tx.nodes.set<SlateElement>(
      { [RUNTIME_LIST_STYLE_TYPE_KEY]: 'lower-alpha' } as Partial<SlateElement>,
      { at: path }
    );
    return true;
  }

  if (
    listNode.listStyleType === 'upper-roman' &&
    previousIndented?.[0].listStyleType === 'upper-alpha'
  ) {
    tx.nodes.set<SlateElement>(
      { [RUNTIME_LIST_STYLE_TYPE_KEY]: 'upper-alpha' } as Partial<SlateElement>,
      { at: path }
    );
    return true;
  }

  if (
    typeof listNode.listStyleType === 'string' &&
    RUNTIME_UNORDERED_LIST_STYLE_TYPES.has(listNode.listStyleType)
  ) {
    if (listNode.listStart !== undefined) {
      tx.nodes.unset([RUNTIME_LIST_START_KEY], { at: path });
      return true;
    }

    return false;
  }

  const previous = getRuntimePreviousListEntry(editor, [listNode, path]);
  const expectedListStart = getRuntimeExpectedListStart(
    [listNode, path],
    previous
  );

  if (listNode.listStart !== undefined && expectedListStart === 1) {
    tx.nodes.unset([RUNTIME_LIST_START_KEY], { at: path });
    return true;
  }

  if (listNode.listStart !== expectedListStart && expectedListStart > 1) {
    tx.nodes.set<SlateElement>(
      { [RUNTIME_LIST_START_KEY]: expectedListStart } as Partial<SlateElement>,
      { at: path }
    );
    return true;
  }

  return false;
};

const normalizeRuntimeListFromPath = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  path: number[]
) => {
  let currentPath = path;

  editor.update((tx) => {
    let entry = editor.read((state) =>
      state.nodes.hasPath(currentPath)
        ? state.nodes.get<SlateElement>(currentPath)
        : undefined
    );

    if (entry && !isRuntimeListElement(entry[0])) {
      entry = getRuntimeNextSiblingElement(editor, currentPath);
    }

    while (entry && isRuntimeListElement(entry[0])) {
      const normalized = normalizeRuntimeListEntry(tx, editor, entry);

      if (normalized) break;

      const nextEntry = getRuntimeNextSiblingElement(editor, entry[1]);

      if (!nextEntry || !isRuntimeListElement(nextEntry[0])) break;

      currentPath = nextEntry[1];
      entry = nextEntry;
    }
  });
};

const getRuntimeListAffectedPaths = (operation: Operation): number[][] => {
  switch (operation.type) {
    case 'insert_node':
    case 'remove_node':
    case 'set_node':
      return [operation.path];
    case 'merge_node':
      return PathApi.hasPrevious(operation.path)
        ? [PathApi.previous(operation.path)]
        : [];
    case 'move_node':
      return [operation.path, operation.newPath];
    case 'split_node':
      return [operation.path, PathApi.next(operation.path)];
    default:
      return [];
  }
};

const installRuntimeList = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeList) return;

  const previousInsertBreak = getPlateRuntimeTransforms(editor).insertBreak;
  const previousResetBlock = getPlateRuntimeTransforms(editor).resetBlock;
  const extension = defineEditorExtension({
    name: 'plate:list:runtime',
    normalizers: {
      node({ entry, next, tx }) {
        if (
          ElementApi.isElement(entry[0]) &&
          normalizeRuntimeListEntry(tx, editor, [
            entry[0] as SlateElement,
            entry[1],
          ])
        )
          return;

        next();
      },
    },
    operations: {
      apply({ operation, next }) {
        const affectedPaths = getRuntimeListAffectedPaths(operation);

        next(operation);

        affectedPaths.forEach((path) => {
          normalizeRuntimeListFromPath(editor, path);
        });
      },
    },
  });

  plugin.runtimeListCleanup = editor.extend(extension);
  plugin.runtimeListExtension = extension;
  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    insertBreak: () => {
      const selection = editor.read((state) => state.selection.get());
      const blockPath = getRuntimeBlockPath(editor, selection ?? undefined);
      const block = blockPath ? getRuntimeDescendant(editor, blockPath) : null;
      const isTodoEnd =
        !!selection &&
        !!blockPath &&
        RangeApi.isCollapsed(selection) &&
        isRuntimeListElement(block) &&
        block.listStyleType === RUNTIME_LIST_TODO_STYLE_TYPE &&
        isRuntimeSelectionAtBlockEdge(editor, selection, blockPath, 'end');

      const result = previousInsertBreak();

      if (isTodoEnd) {
        const nextSelection = editor.read((state) => state.selection.get());
        const nextBlockPath = getRuntimeBlockPath(
          editor,
          nextSelection ?? undefined
        );

        if (nextBlockPath) {
          editor.update((tx) => {
            tx.nodes.set<SlateElement>(
              { [RUNTIME_LIST_CHECKED_KEY]: false } as Partial<SlateElement>,
              { at: nextBlockPath }
            );
          });
        }
      }

      return result;
    },
    resetBlock: (options?: PlateRuntimeResetBlockOptions) => {
      const selection = editor.read((state) => state.selection.get());
      const target = options?.at ?? selection ?? undefined;
      const blockPath = getRuntimeBlockPath(editor, target);
      const block = blockPath ? getRuntimeDescendant(editor, blockPath) : null;

      if (!blockPath || !isRuntimeListElement(block)) {
        return previousResetBlock(options);
      }

      const indent = getRuntimeListIndent(block);

      editor.update((tx) => {
        if (indent <= 1) {
          tx.nodes.unset(
            [
              RUNTIME_LIST_CHECKED_KEY,
              RUNTIME_LIST_INDENT_KEY,
              RUNTIME_LIST_START_KEY,
              RUNTIME_LIST_STYLE_TYPE_KEY,
            ],
            { at: blockPath }
          );
          return;
        }

        tx.nodes.set<SlateElement>(
          { [RUNTIME_LIST_INDENT_KEY]: indent - 1 } as Partial<SlateElement>,
          { at: blockPath }
        );
      });

      return true;
    },
  }) as PlateRuntimeTransforms;
};

type RuntimeClassicTodoListOptions = {
  inheritCheckStateOnLineEndBreak?: boolean;
  inheritCheckStateOnLineStartBreak?: boolean;
};

type RuntimeClassicTodoListElement = SlateElement & {
  checked?: unknown;
  type?: unknown;
};

const isRuntimeClassicTodoListElement = (
  node: unknown,
  type: string
): node is RuntimeClassicTodoListElement =>
  isRuntimeElementNode(node) && node.type === type;

const getRuntimeClassicTodoListChecked = (
  node: RuntimeClassicTodoListElement
) => (typeof node.checked === 'boolean' ? node.checked : false);

const createRuntimeClassicTodoListItem = <V extends Value>({
  checked,
  marks,
  type,
}: {
  checked: boolean;
  marks?: Record<string, unknown> | null;
  type: string;
}): ElementOrTextIn<V> =>
  ({
    checked,
    children: [{ text: '', ...(marks ?? {}) }],
    type,
  }) as ElementOrTextIn<V>;

const installRuntimeClassicTodoList = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeClassicTodoList) return;

  const previousInsertBreak = getPlateRuntimeTransforms(editor).insertBreak;
  const type = editor.getType(plugin.key);

  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    insertBreak: () => {
      const selection = editor.read((state) => state.selection.get());

      if (!selection || !RangeApi.isCollapsed(selection)) {
        return previousInsertBreak();
      }

      const blockPath = getRuntimeBlockPath(editor, selection);
      const block = blockPath
        ? getRuntimeDescendant<V, TExtensions, RuntimeClassicTodoListElement>(
            editor,
            blockPath
          )
        : null;

      if (!blockPath || !isRuntimeClassicTodoListElement(block, type)) {
        return previousInsertBreak();
      }

      const isStart = isRuntimeSelectionAtBlockEdge(
        editor,
        selection,
        blockPath,
        'start'
      );
      const isEnd = isRuntimeSelectionAtBlockEdge(
        editor,
        selection,
        blockPath,
        'end'
      );

      if (!isStart && !isEnd) {
        return previousInsertBreak();
      }

      const options = editor.getOptions<RuntimeClassicTodoListOptions>(plugin);
      const checked = getRuntimeClassicTodoListChecked(block);

      if (isStart) {
        editor.update((tx) => {
          tx.nodes.insert(
            createRuntimeClassicTodoListItem<V>({
              checked: options.inheritCheckStateOnLineStartBreak
                ? checked
                : false,
              type,
            }),
            { at: blockPath }
          );
        });

        return true;
      }

      const nextPath = PathApi.next(blockPath);
      const marks = editor.read((state) => state.marks.get()) as Record<
        string,
        unknown
      > | null;

      editor.update((tx) => {
        tx.nodes.insert(
          createRuntimeClassicTodoListItem<V>({
            checked: options.inheritCheckStateOnLineEndBreak ? checked : false,
            marks,
            type,
          }),
          { at: nextPath }
        );
        tx.selection.set({ offset: 0, path: [...nextPath, 0] });
      });

      return true;
    },
  }) as PlateRuntimeTransforms;
};

type RuntimeFootnoteElement = SlateElement & {
  identifier?: unknown;
  type?: unknown;
};

type RuntimeFootnoteInsertOptions<V extends Value> = NonNullable<
  Parameters<EditorUpdateTransaction<V>['nodes']['insert']>[1]
> & {
  focusDefinition?: boolean;
  identifier?: string;
};

const RUNTIME_FOOTNOTE_DEFINITION_KEY = 'footnoteDefinition';
const RUNTIME_FOOTNOTE_REFERENCE_KEY = 'footnoteReference';
const RUNTIME_FOOTNOTE_NUMERIC_IDENTIFIER_RE = /^\d+$/;

const getRuntimeFootnoteIdentifier = (node: RuntimeFootnoteElement) =>
  typeof node.identifier === 'string' ? node.identifier : undefined;

const createRuntimeFootnoteIdentifierProps = <V extends Value>(
  identifier: string
) => ({ identifier }) as unknown as Partial<NodeProps<NodeIn<V>>>;

const isRuntimeFootnoteElement = (
  node: unknown,
  type: string
): node is RuntimeFootnoteElement =>
  isRuntimeElementNode(node) && node.type === type;

const compareRuntimeFootnoteEntries = (
  a: NodeEntry<RuntimeFootnoteElement>,
  b: NodeEntry<RuntimeFootnoteElement>
) => PathApi.compare(a[1], b[1]);

const getRuntimeFootnoteEntries = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  {
    identifier,
    type,
  }: {
    identifier?: string;
    type: string;
  }
) =>
  editor
    .read((state) =>
      state.nodes.toArray<RuntimeFootnoteElement>({
        at: [],
        match: (node) =>
          isRuntimeFootnoteElement(node, type) &&
          (identifier === undefined ||
            getRuntimeFootnoteIdentifier(node) === identifier),
      })
    )
    .sort(compareRuntimeFootnoteEntries);

const getRuntimeFootnoteDefinitions = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  identifier?: string
) =>
  getRuntimeFootnoteEntries(editor, {
    identifier,
    type: editor.getType(RUNTIME_FOOTNOTE_DEFINITION_KEY),
  });

const getRuntimeFootnoteReferences = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  identifier?: string
) =>
  getRuntimeFootnoteEntries(editor, {
    identifier,
    type: editor.getType(RUNTIME_FOOTNOTE_REFERENCE_KEY),
  });

const getRuntimeFootnoteNumericIdentifier = (identifier: string) =>
  RUNTIME_FOOTNOTE_NUMERIC_IDENTIFIER_RE.test(identifier)
    ? Number.parseInt(identifier, 10)
    : undefined;

const getRuntimeFootnoteNextIdentifier = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
) => {
  const used = new Set<number>();

  for (const [node] of [
    ...getRuntimeFootnoteDefinitions(editor),
    ...getRuntimeFootnoteReferences(editor),
  ]) {
    const identifier = getRuntimeFootnoteIdentifier(node);
    const numeric = identifier
      ? getRuntimeFootnoteNumericIdentifier(identifier)
      : undefined;

    if (numeric !== undefined) {
      used.add(numeric);
    }
  }

  let next = 1;

  while (used.has(next)) {
    next += 1;
  }

  return `${next}`;
};

const getRuntimeFootnoteDefinitionText = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  identifier: string
) => {
  const definition = getRuntimeFootnoteDefinitions(editor, identifier)[0];

  return definition ? getRuntimeNodeText(definition[0]) : undefined;
};

const getRuntimeFootnoteDuplicateIdentifiers = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
) => {
  const counts = new Map<string, number>();

  for (const [node] of getRuntimeFootnoteDefinitions(editor)) {
    const identifier = getRuntimeFootnoteIdentifier(node);

    if (identifier) {
      counts.set(identifier, (counts.get(identifier) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([identifier]) => identifier);
};

const isRuntimeDuplicateFootnoteDefinition = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  path: number[]
) => {
  const node = getRuntimeDescendant<V, TExtensions, RuntimeFootnoteElement>(
    editor,
    path
  );

  if (
    !node ||
    !isRuntimeFootnoteElement(
      node,
      editor.getType(RUNTIME_FOOTNOTE_DEFINITION_KEY)
    )
  ) {
    return false;
  }

  const identifier = getRuntimeFootnoteIdentifier(node);

  if (!identifier) return false;

  return getRuntimeFootnoteDefinitions(editor, identifier).some(
    ([, definitionPath], index) =>
      index > 0 && PathApi.equals(definitionPath, path)
  );
};

const getRuntimeFootnoteDefinitionChildren = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  fragment?: Descendant[]
) => {
  const paragraphType = editor.getType('p');
  const clonedFragment = fragment ? structuredClone(fragment) : [];

  return clonedFragment.length > 0
    ? clonedFragment.map((child) =>
        ElementApi.isElement(child) && child.type === paragraphType
          ? child
          : {
              children: [child],
              type: paragraphType,
            }
      )
    : [{ children: [{ text: '' }], type: paragraphType }];
};

const focusRuntimeFootnoteDefinition = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  { identifier }: { identifier: string }
) => {
  const definition = getRuntimeFootnoteDefinitions(editor, identifier)[0];

  if (!definition) return false;

  const path = definition[1].concat([0, 0]);
  const point = editor.read((state) => state.points.start(path));

  if (!point) return false;

  editor.update((tx) => {
    tx.selection.set({ anchor: point, focus: point });
  });

  return true;
};

const getRuntimeFootnoteReferenceSelectionPoint = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  path: number[]
) => {
  const parentPath = PathApi.parent(path);
  const parent = getRuntimeDescendant<V, TExtensions, SlateElement>(
    editor,
    parentPath
  );
  const parentChildren = getRuntimeChildren(parent);
  const childIndex = path.at(-1) ?? -1;
  const nextSibling = parentChildren?.[childIndex + 1];
  const previousSibling = parentChildren?.[childIndex - 1];

  if (TextApi.isText(nextSibling)) {
    return {
      offset: 0,
      path: parentPath.concat([childIndex + 1]),
    };
  }

  if (TextApi.isText(previousSibling)) {
    return {
      offset: previousSibling.text.length,
      path: parentPath.concat([childIndex - 1]),
    };
  }

  return editor.read((state) => state.points.start(path.concat([0])));
};

const focusRuntimeFootnoteReference = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  {
    identifier,
    index = 0,
  }: {
    identifier: string;
    index?: number;
  }
) => {
  const reference = getRuntimeFootnoteReferences(editor, identifier)[index];

  if (!reference) return false;

  const point = getRuntimeFootnoteReferenceSelectionPoint(editor, reference[1]);

  if (!point) return false;

  editor.update((tx) => {
    tx.selection.set({ anchor: point, focus: point });
  });

  return true;
};

const createRuntimeFootnoteDefinition = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  {
    focus = true,
    fragment,
    identifier,
  }: {
    focus?: boolean;
    fragment?: Descendant[];
    identifier: string;
  }
) => {
  const existingDefinition = getRuntimeFootnoteDefinitions(
    editor,
    identifier
  )[0];

  if (existingDefinition) {
    if (focus) {
      focusRuntimeFootnoteDefinition(editor, { identifier });
    }

    return existingDefinition[1];
  }

  const definitionPath = editor.read((state) => [
    state.value.root().length,
  ]) as number[];

  editor.update((tx) => {
    tx.nodes.insert(
      {
        children: getRuntimeFootnoteDefinitionChildren(editor, fragment),
        identifier,
        type: editor.getType(RUNTIME_FOOTNOTE_DEFINITION_KEY),
      } as ElementOrTextIn<V>,
      { at: definitionPath }
    );
  });

  if (focus) {
    focusRuntimeFootnoteDefinition(editor, { identifier });
  }

  return definitionPath;
};

const normalizeRuntimeDuplicateFootnoteDefinition = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  { identifier, path }: { identifier?: string; path: number[] }
) => {
  const node = getRuntimeDescendant<V, TExtensions, RuntimeFootnoteElement>(
    editor,
    path
  );

  if (
    !node ||
    !isRuntimeFootnoteElement(
      node,
      editor.getType(RUNTIME_FOOTNOTE_DEFINITION_KEY)
    ) ||
    !isRuntimeDuplicateFootnoteDefinition(editor, path)
  ) {
    return false;
  }

  const nextIdentifier = identifier ?? getRuntimeFootnoteNextIdentifier(editor);

  if (
    nextIdentifier !== node.identifier &&
    getRuntimeFootnoteDefinitions(editor, nextIdentifier).length > 0
  ) {
    return false;
  }

  editor.update((tx) => {
    tx.nodes.set(createRuntimeFootnoteIdentifierProps<V>(nextIdentifier), {
      at: path,
    });
  });

  return nextIdentifier;
};

const insertRuntimeFootnote = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  {
    focusDefinition = true,
    identifier,
    ...options
  }: RuntimeFootnoteInsertOptions<V> = {}
) => {
  const selection = editor.read((state) => state.selection.get());

  if (!selection) return;

  const nextIdentifier = identifier ?? getRuntimeFootnoteNextIdentifier(editor);
  const fragment = RangeApi.isExpanded(selection)
    ? editor.read((state) => state.fragment.get())
    : undefined;
  const anchorPath = selection.anchor.path;
  const childIndex = anchorPath.at(-1);
  const referencePath =
    childIndex === undefined
      ? undefined
      : anchorPath.slice(0, -1).concat([childIndex + 1]);

  editor.update((tx) => {
    tx.nodes.insert(
      {
        children: [{ text: '' }],
        identifier: nextIdentifier,
        type: editor.getType(RUNTIME_FOOTNOTE_REFERENCE_KEY),
      } as ElementOrTextIn<V>,
      options
    );
  });

  createRuntimeFootnoteDefinition(editor, {
    focus: false,
    fragment,
    identifier: nextIdentifier,
  });

  if (focusDefinition) {
    focusRuntimeFootnoteDefinition(editor, { identifier: nextIdentifier });

    return;
  }

  if (referencePath) {
    const point = getRuntimeFootnoteReferenceSelectionPoint(
      editor,
      referencePath
    );

    if (point) {
      editor.update((tx) => {
        tx.selection.set({ anchor: point, focus: point });
      });
    }
  }
};

const installRuntimeFootnote = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeFootnote) return;

  plugin.api = mergePlugins(plugin.api ?? {}, {
    footnote: {
      definition: ({ identifier }: { identifier: string }) =>
        getRuntimeFootnoteDefinitions(editor, identifier)[0],
      definitions: ({ identifier }: { identifier: string }) =>
        getRuntimeFootnoteDefinitions(editor, identifier),
      definitionText: ({ identifier }: { identifier: string }) =>
        getRuntimeFootnoteDefinitionText(editor, identifier),
      duplicateDefinitions: ({ identifier }: { identifier: string }) =>
        getRuntimeFootnoteDefinitions(editor, identifier).slice(1),
      duplicateIdentifiers: () =>
        getRuntimeFootnoteDuplicateIdentifiers(editor),
      hasDuplicateDefinitions: ({ identifier }: { identifier: string }) =>
        getRuntimeFootnoteDefinitions(editor, identifier).length > 1,
      identifiers: () =>
        Array.from(
          new Set(
            getRuntimeFootnoteDefinitions(editor)
              .map(([node]) => getRuntimeFootnoteIdentifier(node))
              .filter((identifier): identifier is string => !!identifier)
          )
        ),
      isDuplicateDefinition: ({ path }: { path: number[] }) =>
        isRuntimeDuplicateFootnoteDefinition(editor, path),
      isResolved: ({ identifier }: { identifier: string }) =>
        getRuntimeFootnoteDefinitions(editor, identifier).length > 0,
      nextId: () => getRuntimeFootnoteNextIdentifier(editor),
      references: ({ identifier }: { identifier: string }) =>
        getRuntimeFootnoteReferences(editor, identifier),
    },
  }) as Record<string, unknown>;

  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    footnote: {
      createDefinition: (options: {
        focus?: boolean;
        fragment?: Descendant[];
        identifier: string;
      }) => createRuntimeFootnoteDefinition(editor, options),
      focusDefinition: (options: { identifier: string }) =>
        focusRuntimeFootnoteDefinition(editor, options),
      focusReference: (options: { identifier: string; index?: number }) =>
        focusRuntimeFootnoteReference(editor, options),
      normalizeDuplicateDefinition: (options: {
        identifier?: string;
        path: number[];
      }) => normalizeRuntimeDuplicateFootnoteDefinition(editor, options),
    },
    insert: {
      footnote: (options?: RuntimeFootnoteInsertOptions<V>) =>
        insertRuntimeFootnote(editor, options),
    },
  }) as PlateRuntimeTransforms;
};

const isRuntimeMultiSelectTag = (
  node: unknown,
  type: string
): node is SlateElement & { value?: unknown } =>
  isRuntimeElementNode(node) && node.type === type && 'value' in node;

const hasRuntimeMultiSelectTag = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  type: string
) =>
  getRuntimeRootNodeEntries(editor).some(([node]) =>
    isRuntimeMultiSelectTag(node, type)
  );

const shouldRemoveRuntimeMultiSelectText = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  type: string,
  path: number[]
) => {
  const selection = editor.read((state) => state.selection.get());

  return (
    hasRuntimeMultiSelectTag(editor, type) ||
    !selection ||
    !RangeApi.includes(selection, path)
  );
};

const compareRuntimePathsDescending = (left: number[], right: number[]) =>
  PathApi.compare(right, left);

const cleanupRuntimeMultiSelect = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  type: string
) => {
  const entries = getRuntimeRootNodeEntries(editor);
  const seenTagValues = new Set<unknown>();
  const removePaths: number[][] = [];
  const trimRanges: Range[] = [];

  entries.forEach(([node, path]) => {
    if (isRuntimeMultiSelectTag(node, type)) {
      if (seenTagValues.has(node.value)) {
        removePaths.push(path);
      } else {
        seenTagValues.add(node.value);
      }

      return;
    }

    if (!isRuntimeTextNode(node) || node.text.length === 0) return;

    if (shouldRemoveRuntimeMultiSelectText(editor, type, path)) {
      removePaths.push(path);
      return;
    }

    const trimmedText = node.text.trimStart();

    if (trimmedText !== node.text) {
      trimRanges.push({
        anchor: { offset: 0, path },
        focus: {
          offset: node.text.length - trimmedText.length,
          path,
        },
      });
    }
  });

  if (removePaths.length === 0 && trimRanges.length === 0) return;

  editor.update((tx) => {
    trimRanges.forEach((at) => {
      tx.text.delete({ at });
    });

    removePaths.sort(compareRuntimePathsDescending).forEach((at) => {
      tx.nodes.remove({ at });
    });
  });
};

const installRuntimeMultiSelect = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeMultiSelect) return;

  const type = plugin.node?.type ?? plugin.key;
  const previousDeleteBackward =
    getPlateRuntimeTransforms(editor).deleteBackward;
  const previousMove = getPlateRuntimeTransforms(editor).move;
  let isCleaning = false;
  const extension = defineEditorExtension({
    name: 'plate:multiselect:runtime',
    setup() {
      return {
        normalizers: {
          editor({ next, tx }) {
            const seenTagValues = new Set<unknown>();
            const duplicatePaths = getRuntimeRootNodeEntries(editor)
              .flatMap(([node, path]) => {
                if (!isRuntimeMultiSelectTag(node, type)) return [];

                if (seenTagValues.has(node.value)) {
                  return [path];
                }

                seenTagValues.add(node.value);
                return [];
              })
              .sort(compareRuntimePathsDescending);

            if (duplicatePaths.length > 0) {
              duplicatePaths.forEach((at) => {
                tx.nodes.remove({ at });
              });
              return;
            }

            next();
          },
        },
        onCommit() {
          if (isCleaning) return;

          isCleaning = true;

          try {
            cleanupRuntimeMultiSelect(editor, type);
          } finally {
            isCleaning = false;
          }
        },
      };
    },
  });

  plugin.runtimeMultiSelectCleanup = editor.extend(extension);
  plugin.runtimeMultiSelectExtension = extension;
  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    deleteBackward: (unit?: TextUnit) => {
      const result = previousDeleteBackward(unit);

      if (hasRuntimeMultiSelectTag(editor, type)) {
        previousMove();
      }

      return result;
    },
  }) as PlateRuntimeTransforms;
};

const createRuntimeTypedBlock = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  type: string
): ElementOrTextIn<V> => {
  const block = createRuntimeDefaultBlock(editor);

  if (ElementApi.isElement(block)) {
    return { ...block, type } as ElementOrTextIn<V>;
  }

  return { children: [{ text: '' }], type } as ElementOrTextIn<V>;
};

const getRuntimeLastDescendantEntry = (
  children: readonly Descendant[],
  parentPath: number[] = []
): NodeEntry<Descendant> | undefined => {
  if (children.length === 0) return;

  const childIndex = children.length - 1;
  const child = children[childIndex];
  const childPath = [...parentPath, childIndex];

  if (ElementApi.isElement(child) && child.children.length > 0) {
    return (
      getRuntimeLastDescendantEntry(child.children, childPath) ?? [
        child,
        childPath,
      ]
    );
  }

  return [child, childPath];
};

const getRuntimeTrailingBlockLastEntry = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  level: number
): NodeEntry<Descendant> | undefined => {
  const deepestLastEntry = getRuntimeLastDescendantEntry(
    editor.read((state) => state.value.root())
  );

  if (!deepestLastEntry) return;

  const targetPath = deepestLastEntry[1].slice(0, level + 1);

  if (targetPath.length === 0) return;

  return editor.read((state) =>
    state.nodes.hasPath(targetPath) ? state.nodes.get(targetPath) : undefined
  ) as NodeEntry<Descendant> | undefined;
};

const installRuntimeTrailingBlock = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeTrailingBlock) return;

  const extension = defineEditorExtension({
    name: 'plate:trailing-block:runtime',
    normalizers: {
      editor({ next, tx }) {
        const {
          insert,
          level = 0,
          type = editor.getType('p'),
          ...query
        } = editor.getOptions<RuntimeTrailingBlockOptions>(plugin);
        const lastEntry = getRuntimeTrailingBlockLastEntry(editor, level);
        const lastNodeType = (lastEntry?.[0] as { type?: unknown } | undefined)
          ?.type;

        if (
          !lastEntry ||
          (lastNodeType !== type && queryNode(lastEntry, query))
        ) {
          const at = lastEntry ? PathApi.next(lastEntry[1]) : [0];
          const insertTrailingBlock = () => {
            tx.nodes.insert(createRuntimeTypedBlock(editor, type), { at });
          };

          if (insert) {
            insert(editor, { at, insert: insertTrailingBlock, type });
            return;
          }

          insertTrailingBlock();
          return;
        }

        next();
      },
    },
  });

  plugin.runtimeTrailingBlockCleanup = editor.extend(extension);
  plugin.runtimeTrailingBlockExtension = extension;
};

const getRuntimeColumnWidth = (node: Descendant): number => {
  const width = ElementApi.isElement(node)
    ? Number.parseFloat(String(node.width ?? ''))
    : Number.NaN;

  return Number.isNaN(width) ? 0 : width;
};

const installRuntimeLayoutColumn = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeLayoutColumn) return;

  const columnType = editor.getType('column');
  const columnGroupType = editor.getType('column_group');
  const paragraphType = editor.getType('p');
  const previousSelectAll = getPlateRuntimeTransforms(editor).selectAll;
  const extension = defineEditorExtension({
    name: 'plate:layout-column:runtime',
    normalizers: {
      node({ entry, next, tx }) {
        const [node, path] = entry;

        if (ElementApi.isElement(node) && node.type === columnGroupType) {
          const firstChild = node.children[0];
          const hasColumnChild = node.children.some(
            (child) => ElementApi.isElement(child) && child.type === columnType
          );

          if (
            node.children.length === 1 &&
            ElementApi.isElement(firstChild) &&
            firstChild.type === paragraphType
          ) {
            tx.nodes.unwrap({ at: path });
            return;
          }

          if (!hasColumnChild) {
            tx.nodes.unwrap({ at: path });
            return;
          }

          if (node.children.length < 2) {
            tx.nodes.unwrap({ at: path });
            tx.nodes.unwrap({ at: path });
            return;
          }

          const totalColumns = node.children.length;
          const widths = node.children.map(getRuntimeColumnWidth);
          const sum = widths.reduce((acc, width) => acc + width, 0);

          if (sum !== 100) {
            const adjustment = (100 - sum) / totalColumns;

            widths.forEach((width, index) => {
              tx.nodes.set<SlateElement>(
                { width: `${width + adjustment}%` } as Partial<SlateElement>,
                { at: [...path, index] }
              );
            });
            return;
          }
        }

        if (
          ElementApi.isElement(node) &&
          node.type === columnType &&
          node.children.length === 0
        ) {
          tx.nodes.remove({ at: path });
          return;
        }

        next();
      },
    },
  });

  plugin.runtimeLayoutColumnCleanup = editor.extend(extension);
  plugin.runtimeLayoutColumnExtension = extension;
  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    selectAll: () => {
      const selection = editor.read((state) => state.selection.get());

      if (!selection) return previousSelectAll();

      const column = editor.read((state) =>
        state.nodes.above<SlateElement>({
          at: selection,
          match: (node) =>
            ElementApi.isElement(node) && node.type === columnType,
        })
      );

      if (!column) return previousSelectAll();

      let targetPath = column[1];
      const isColumnSelected = editor.read((state) => {
        const start = state.points.start(selection);
        const end = state.points.end(selection);

        return (
          state.points.isStart(start, targetPath) &&
          state.points.isEnd(end, targetPath)
        );
      });

      if (isColumnSelected) {
        targetPath = PathApi.parent(targetPath);
      }

      if (targetPath.length === 0) return previousSelectAll();

      editor.update((tx) => {
        tx.selection.set(targetPath);
      });

      return true;
    },
  }) as PlateRuntimeTransforms;
};

const getRuntimeIndentValue = (node: SlateElement) => {
  const value = node.indent;

  return typeof value === 'number' ? value : 0;
};

const getRuntimeIndentTargetTypes = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  const targetPlugins =
    plugin.inject?.targetPlugins && plugin.inject.targetPlugins.length > 0
      ? plugin.inject.targetPlugins
      : ['p'];

  return new Set(targetPlugins.map((key) => editor.getType(key)));
};

const getRuntimeIndentBlockEntries = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  targetTypes: Set<string>
) => {
  const selection = editor.read((state) => state.selection.get());

  if (!selection) return [];

  return editor.read((state) =>
    Array.from(
      state.nodes.entries<SlateElement>({
        at: selection,
        match: (node) =>
          ElementApi.isElement(node) &&
          typeof node.type === 'string' &&
          targetTypes.has(node.type),
      })
    )
  ) as NodeEntry<SlateElement>[];
};

const applyRuntimeIndent = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  entries: NodeEntry<SlateElement>[],
  offset: number
) => {
  editor.update((tx) => {
    entries.forEach(([node, path]) => {
      const nextIndent = getRuntimeIndentValue(node) + offset;

      if (nextIndent <= 0) {
        tx.nodes.unset(['indent'], { at: path });
        return;
      }

      tx.nodes.set<SlateElement>(
        { indent: nextIndent } as Partial<SlateElement>,
        { at: path }
      );
    });
  });
};

const installRuntimeIndent = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeIndent) return;

  const targetTypes = getRuntimeIndentTargetTypes(editor, plugin);
  const previousTab = getPlateRuntimeTransforms(editor).tab;
  const extension = defineEditorExtension({
    name: 'plate:indent:runtime',
    normalizers: {
      node({ entry, next, tx }) {
        const [node, path] = entry;

        if (!ElementApi.isElement(node) || typeof node.type !== 'string') {
          next();
          return;
        }

        const indent = getRuntimeIndentValue(node);
        const matchesTarget = targetTypes.has(node.type);
        const { indentMax } = editor.getOptions<{ indentMax?: number }>(plugin);

        if (matchesTarget && indentMax && indent > indentMax) {
          tx.nodes.set<SlateElement>(
            { indent: indentMax } as Partial<SlateElement>,
            { at: path }
          );
          return;
        }

        if (!matchesTarget && indent > 0) {
          tx.nodes.unset(['indent'], { at: path });
          return;
        }

        next();
      },
    },
  });

  plugin.runtimeIndentCleanup = editor.extend(extension);
  plugin.runtimeIndentExtension = extension;
  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    tab: (options: { reverse: boolean }) => {
      const entries = getRuntimeIndentBlockEntries(editor, targetTypes);
      const firstEntry = entries[0];

      if (!firstEntry) return previousTab(options);

      const [firstNode] = firstEntry;

      if (options.reverse) {
        if (getRuntimeIndentValue(firstNode) <= 0) {
          const previousHandled = previousTab(options);

          if (previousHandled) return true;

          return true;
        }

        applyRuntimeIndent(editor, entries, -1);
        return true;
      }

      applyRuntimeIndent(editor, entries, 1);
      return true;
    },
  }) as PlateRuntimeTransforms;
};

const installRuntimeNormalizeTypes = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeNormalizeTypes) return;

  const extension = defineEditorExtension({
    name: 'plate:normalize-types:runtime',
    normalizers: {
      editor({ next, tx }) {
        const { onError, rules = [] } =
          editor.getOptions<RuntimeNormalizeTypesOptions>(plugin);

        for (const { path, strictType, type } of rules) {
          const entry = editor.read((state) =>
            state.nodes.hasPath(path) ? state.nodes.get(path) : undefined
          );

          if (entry) {
            const [node] = entry;

            if (strictType) {
              if (!ElementApi.isElement(node)) {
                tx.nodes.remove({ at: path });
                tx.nodes.insert(createRuntimeTypedBlock(editor, strictType), {
                  at: path,
                });
                return;
              }

              if (node.type !== strictType) {
                tx.nodes.set({ type: strictType }, { at: path });
                return;
              }
            }

            continue;
          }

          const targetType = strictType ?? type;

          if (!targetType) continue;

          try {
            tx.nodes.insert(createRuntimeTypedBlock(editor, targetType), {
              at: path,
            });
            return;
          } catch (error) {
            onError?.(error);
          }
        }

        next();
      },
    },
  });

  plugin.runtimeNormalizeTypesCleanup = editor.extend(extension);
  plugin.runtimeNormalizeTypesExtension = extension;
};

const installRuntimeSingleBlock = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeSingleBlock) return;

  const extension = defineEditorExtension({
    name: 'plate:single-block:runtime',
    normalizers: {
      editor({ next, tx }) {
        const children = editor.read((state) => state.value.root());

        if (children.length > 1) {
          const secondNode = children[1];
          const secondText = getRuntimeNodeText(secondNode);

          if (secondText.length === 0) {
            let firstBlockEnd: Point;

            try {
              firstBlockEnd = editor.read((state) => state.points.end([0]));
            } catch {
              next();
              return;
            }

            tx.text.insert('\n', { at: firstBlockEnd });
            tx.nodes.remove({ at: [1] });
            return;
          }

          const secondBlockStart = editor.read((state) =>
            state.points.start([1])
          );

          tx.text.insert('\n', { at: secondBlockStart });
          tx.nodes.merge({
            at: [1],
            match: (_node, path) => path.length === 1,
          });
          return;
        }

        next();
      },
    },
    transforms: {
      insertBreak({ tx }) {
        tx.text.insert('\n');
        return true;
      },
      insertSoftBreak({ tx }) {
        tx.text.insert('\n');
        return true;
      },
    },
  });

  plugin.runtimeSingleBlockCleanup = editor.extend(extension);
  plugin.runtimeSingleBlockExtension = extension;
};

const cleanupRuntimeSingleLine = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>
) => {
  const lineBreakTextEntries = getRuntimeRootNodeEntries(editor)
    .filter(
      (entry): entry is [Text, number[]] =>
        TextApi.isText(entry[0]) &&
        RUNTIME_SINGLE_LINE_BREAK_RE.test(entry[0].text)
    )
    .map(
      ([node, path]) =>
        [
          node.text.replace(RUNTIME_SINGLE_LINE_BREAK_GLOBAL_RE, ''),
          node.text.length,
          path,
        ] as const
    );

  if (lineBreakTextEntries.length === 0) return;

  editor.update((tx) => {
    lineBreakTextEntries.forEach(([text, length, path]) => {
      tx.text.delete({
        at: {
          anchor: { offset: 0, path },
          focus: { offset: length, path },
        },
      });

      if (text.length > 0) {
        tx.text.insert(text, { at: { offset: 0, path } });
      }
    });
  });
};

const installRuntimeSingleLine = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeSingleLine) return;

  let isCleaning = false;
  const extension = defineEditorExtension({
    name: 'plate:single-line:runtime',
    setup() {
      return {
        normalizers: {
          editor({ next, tx }) {
            const children = editor.read((state) => state.value.root());

            if (children.length > 1) {
              const secondText = getRuntimeNodeText(children[1]);

              if (secondText.length === 0) {
                tx.nodes.remove({ at: [1] });
                return;
              }

              tx.nodes.merge({
                at: [1],
                match: (_node, path) => path.length === 1,
              });
              return;
            }

            next();
          },
          node({ entry, next, tx }) {
            const [node, path] = entry;

            if (TextApi.isText(node)) {
              const pathExists = editor.read((state) =>
                state.nodes.hasPath(path)
              );

              if (!pathExists) {
                next();
                return;
              }

              const filteredText = node.text.replace(
                RUNTIME_SINGLE_LINE_BREAK_GLOBAL_RE,
                ''
              );

              if (filteredText !== node.text) {
                tx.text.delete({
                  at: {
                    anchor: { offset: 0, path },
                    focus: { offset: node.text.length, path },
                  },
                });

                if (filteredText.length > 0) {
                  tx.text.insert(filteredText, { at: { offset: 0, path } });
                }
                return;
              }
            }

            next();
          },
        },
        transforms: {
          insertBreak() {
            return true;
          },
          insertSoftBreak() {
            return true;
          },
        },
        onCommit() {
          if (isCleaning) return;

          isCleaning = true;

          try {
            cleanupRuntimeSingleLine(editor);
          } finally {
            isCleaning = false;
          }
        },
      };
    },
  });

  plugin.runtimeSingleLineCleanup = editor.extend(extension);
  plugin.runtimeSingleLineExtension = extension;
};

const installRuntimeCaption = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeCaption) return;

  const previousMoveLine = getPlateRuntimeTransforms(editor).moveLine;
  const extension = defineEditorExtension({
    name: 'plate:caption:runtime',
    setup() {
      return {
        operations: {
          apply({ operation, next }) {
            const nextSelection = getRuntimeSetSelectionRange(
              editor,
              operation
            );

            if (
              isRuntimeArrowUpEvent(editor.dom.currentKeyboardEvent) &&
              nextSelection &&
              RangeApi.isCollapsed(nextSelection)
            ) {
              const entry = getRuntimeCaptionEntry(
                editor,
                plugin,
                nextSelection
              );

              if (
                entry &&
                getRuntimeNodeText((entry[0] as { caption?: unknown }).caption)
                  .length > 0
              ) {
                setTimeout(() => {
                  editor.setOption(plugin, 'focusEndPath', entry[1]);
                }, 0);
              }
            }

            next(operation);
          },
        },
      };
    },
  });

  plugin.runtimeCaptionCleanup = editor.extend(extension);
  plugin.runtimeCaptionExtension = extension;
  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    moveLine: (options: { reverse: boolean }) => {
      if (!options.reverse) {
        const selection = editor.read((state) => state.selection.get());
        const entry = selection
          ? getRuntimeCaptionEntry(editor, plugin, selection)
          : undefined;

        if (entry) {
          editor.setOption(plugin, 'focusEndPath', entry[1]);
          return true;
        }
      }

      return previousMoveLine(options);
    },
  }) as PlateRuntimeTransforms;
};

const installRuntimeBlockquote = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeBlockquote) return;

  const type = editor.getType(plugin.key);
  const previousTab = getPlateRuntimeTransforms(editor).tab;
  const extension = defineEditorExtension({
    name: 'plate:blockquote:runtime',
    normalizers: {
      node({ entry, next, tx }) {
        const [node, path] = entry;

        if (isRuntimeElementNode(node) && node.type === type) {
          const nextChildren = normalizeRuntimeBlockquoteChildren(
            editor,
            node.children
          );

          if (
            shouldReplaceRuntimeBlockquoteChildren(node.children, nextChildren)
          ) {
            replaceRuntimeBlockquoteChildren(
              tx,
              path,
              node.children,
              nextChildren
            );
            return;
          }
        }

        next();
      },
    },
  });

  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    tab: (options: { reverse: boolean }) => {
      if (!options.reverse) {
        return previousTab(options);
      }

      const liftableBlocks = getRuntimeLiftableBlockquoteChildren(editor, type);

      if (liftableBlocks.length === 0) {
        return previousTab(options);
      }

      const blocks = [...liftableBlocks].sort(
        (a, b) =>
          b[1].length - a[1].length ||
          b[1].join('.').localeCompare(a[1].join('.'))
      );

      for (const [, path] of blocks) {
        getPlateRuntimeTransforms(editor).liftBlock({
          at: path,
          match: { type },
        });
      }

      return true;
    },
  }) as PlateRuntimeTransforms;

  plugin.runtimeBlockquoteCleanup = editor.extend(extension);
  plugin.runtimeBlockquoteExtension = extension;
};

const installRuntimeNavigationFeedback = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeNavigationFeedback) return;

  const activeTarget = () => {
    const storedTarget = editor.getOption<RuntimeNavigationStoredTarget | null>(
      plugin,
      'activeTarget'
    );
    const resolvedTarget = resolveRuntimeNavigationTarget(storedTarget);

    if (!resolvedTarget && storedTarget) {
      clearRuntimeNavigationFeedbackTarget(editor, plugin);
      return null;
    }

    return resolvedTarget;
  };

  plugin.api = mergePlugins(plugin.api ?? {}, {
    navigation: {
      activeTarget,
      clear: () => clearRuntimeNavigationFeedbackTarget(editor, plugin),
      isTarget: (path: number[]) => {
        const target = activeTarget();

        return !!target && PathApi.equals(target.path, path);
      },
    },
  }) as Record<string, unknown>;
  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    navigation: {
      clear: () => clearRuntimeNavigationFeedbackTarget(editor, plugin),
      flashTarget: (
        options: Parameters<typeof flashRuntimeNavigationTarget>[2]
      ) => flashRuntimeNavigationTarget(editor, plugin, options),
      navigate: ({
        flash,
        focus = true,
        scroll = true,
        scrollTarget,
        select,
        target,
      }: {
        flash?: false | { duration?: number; variant?: string };
        focus?: boolean;
        scroll?: boolean;
        scrollTarget?: Point;
        select?: Point | Range;
        target: RuntimeNavigationTarget;
      }) => {
        if (!getRuntimeDescendant(editor, target.path)) return false;

        if (select) {
          getPlateRuntimeTransforms(editor).select(
            'focus' in select ? select : { anchor: select, focus: select }
          );
        }

        if (focus) {
          getPlateRuntimeTransforms(editor).focus();
        }

        if (scroll) {
          const point = getRuntimeNavigationScrollPoint(editor, {
            scrollTarget,
            select,
            target,
          });
          const scrollIntoView = (
            editor.api as unknown as PlateRuntimeScrollApi
          ).scrollIntoView;

          if (point && typeof scrollIntoView === 'function') {
            scrollIntoView(point);
          }
        }

        if (flash !== false) {
          flashRuntimeNavigationTarget(editor, plugin, {
            duration: flash?.duration,
            target,
            variant: flash?.variant,
          });
        }

        return true;
      },
    },
  }) as PlateRuntimeTransforms;
};

const createRuntimeCachedGetter = <TValue>(compute: () => TValue) => {
  let hasValue = false;
  let value: TValue;

  return () => {
    if (!hasValue) {
      value = compute();
      hasValue = true;
    }

    return value;
  };
};

type RuntimeInputRuleSelectionContext<
  V extends Value,
  TExtensions extends readonly unknown[],
> = {
  editor: PlateRuntimeEditor<V, TExtensions>;
  getBlockEntry: () => NodeEntry<SlateElement> | undefined;
  getBlockStartRange: () => Range | undefined;
  getBlockStartText: () => string | undefined;
  getBlockTextBeforeSelection: () => string;
  getCharAfter: () => string | undefined;
  getCharBefore: () => string | undefined;
  isCollapsed: boolean;
  pluginKey: string;
};

type RuntimeInsertBreakInputRuleContext<
  V extends Value,
  TExtensions extends readonly unknown[],
> = RuntimeInputRuleSelectionContext<V, TExtensions> & {
  cause: 'insertBreak';
  insertBreak: () => void;
};

type RuntimeInsertDataInputRuleContext<
  V extends Value,
  TExtensions extends readonly unknown[],
> = RuntimeInputRuleSelectionContext<V, TExtensions> & {
  cause: 'insertData';
  data: DataTransfer;
  insertData: (data: DataTransfer) => void;
  text: string | null;
};

type RuntimeInsertTextInputRuleContext<
  V extends Value,
  TExtensions extends readonly unknown[],
> = RuntimeInputRuleSelectionContext<V, TExtensions> & {
  cause: 'insertText';
  insertText: (
    text: string,
    options?: TextInsertTextOptions & { marks?: boolean }
  ) => void;
  options?: TextInsertTextOptions & { marks?: boolean };
  text: string;
};

type RuntimeInputRule<TContext> = {
  apply: (context: TContext, match: unknown) => boolean | void;
  enabled?: (context: TContext) => boolean;
  resolve?: (context: TContext) => unknown;
};

const createRuntimeInputRuleSelectionContext = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  pluginKey: string
): RuntimeInputRuleSelectionContext<V, TExtensions> => {
  const selection = editor.read((state) => state.selection.get());
  const isCollapsed = !!selection && RangeApi.isCollapsed(selection);
  const getBlockPath = createRuntimeCachedGetter(() =>
    selection ? getRuntimeBlockPath(editor, selection) : undefined
  );
  const getBlockEntry = createRuntimeCachedGetter(() => {
    const path = getBlockPath();

    if (!path) return;

    const node = getRuntimeDescendant(editor, path);

    return isRuntimeElementNode(node)
      ? ([node as SlateElement, path] as NodeEntry<SlateElement>)
      : undefined;
  });
  const getBlockStartRange = createRuntimeCachedGetter(() => {
    const path = getBlockPath();

    if (!selection || !path) return;

    const focus = RangeApi.start(selection);
    const anchor = editor.read((state) => state.points.start(path));

    return { anchor, focus };
  });
  const getBlockStartText = createRuntimeCachedGetter(() => {
    const range = getBlockStartRange();

    return range ? editor.read((state) => state.text.string(range)) : undefined;
  });

  return {
    editor,
    getBlockEntry,
    getBlockStartRange,
    getBlockStartText,
    getBlockTextBeforeSelection: createRuntimeCachedGetter(
      () => getBlockStartText() ?? ''
    ),
    getCharAfter: createRuntimeCachedGetter(() => {
      if (!selection || !isCollapsed) return;

      const afterPoint = editor.read((state) =>
        state.points.after(selection, { distance: 1, unit: 'character' })
      );

      if (!afterPoint) return;

      return (
        editor.read((state) =>
          state.text.string({ anchor: selection.anchor, focus: afterPoint })
        ) || undefined
      );
    }),
    getCharBefore: createRuntimeCachedGetter(() => {
      if (!selection || !isCollapsed) return;

      const beforePoint = editor.read((state) =>
        state.points.before(selection, { distance: 1, unit: 'character' })
      );

      if (!beforePoint) return;

      return (
        editor.read((state) =>
          state.text.string({ anchor: beforePoint, focus: selection.anchor })
        ) || undefined
      );
    }),
    isCollapsed,
    pluginKey,
  };
};

const isRuntimeInputRuleTriggerMatch = (
  trigger: readonly string[] | string,
  text: string
) => (Array.isArray(trigger) ? trigger.includes(text) : trigger === text);

const asRuntimeInputRule = <TContext>(
  rule: ResolvedInputRule
): RuntimeInputRule<TContext> => rule as unknown as RuntimeInputRule<TContext>;

const runRuntimeInputRule = <TContext>(
  rule: ResolvedInputRule,
  context: TContext
) => {
  const runtimeRule = asRuntimeInputRule<TContext>(rule);

  if (runtimeRule.enabled?.(context) === false) return false;

  const match = runtimeRule.resolve ? runtimeRule.resolve(context) : true;

  if (match === undefined) return false;

  return runtimeRule.apply(context, match) !== false;
};

const executeRuntimeInputRulesInsertBreak = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  insertBreak: () => boolean | void
) => {
  for (const rule of editor.meta.inputRules.insertBreak) {
    const context: RuntimeInsertBreakInputRuleContext<V, TExtensions> = {
      cause: 'insertBreak',
      insertBreak: () => {
        insertBreak();
      },
      ...createRuntimeInputRuleSelectionContext(editor, rule.pluginKey),
    };

    if (runRuntimeInputRule(rule, context)) return true;
  }

  return false;
};

const executeRuntimeInputRulesInsertData = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  data: DataTransfer,
  insertData: (data: DataTransfer) => boolean | void
) => {
  const text = data.getData('text/plain') || null;

  for (const rule of editor.meta.inputRules.insertData) {
    const context: RuntimeInsertDataInputRuleContext<V, TExtensions> = {
      cause: 'insertData',
      data,
      insertData: (nextData) => {
        insertData(nextData);
      },
      text,
      ...createRuntimeInputRuleSelectionContext(editor, rule.pluginKey),
    };

    if (
      rule.mimeTypes &&
      rule.mimeTypes.length > 0 &&
      !rule.mimeTypes.some((type) => !!context.data.getData(type))
    ) {
      continue;
    }

    if (runRuntimeInputRule(rule, context)) return true;
  }

  return false;
};

const executeRuntimeInputRulesInsertText = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  text: string,
  options: (TextInsertTextOptions & { marks?: boolean }) | undefined,
  insertText: (
    text: string,
    options?: TextInsertTextOptions & { marks?: boolean }
  ) => boolean | void
) => {
  const rules = editor.meta.inputRules.insertText.byTrigger[text] ?? [];

  for (const rule of rules) {
    if (!isRuntimeInputRuleTriggerMatch(rule.trigger, text)) continue;

    const context: RuntimeInsertTextInputRuleContext<V, TExtensions> = {
      cause: 'insertText',
      insertText: (nextText, nextOptions) => {
        insertText(nextText, nextOptions);
      },
      options,
      text,
      ...createRuntimeInputRuleSelectionContext(editor, rule.pluginKey),
    };

    if (runRuntimeInputRule(rule, context)) return true;
  }

  return false;
};

const installRuntimeInputRules = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeInputRules) return;

  const previousInsertBreak = getPlateRuntimeTransforms(editor).insertBreak;
  const previousInsertData = getPlateRuntimeTransforms(editor).insertData;
  const previousInsertText = getPlateRuntimeTransforms(editor).insertText;

  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    insertBreak: () => {
      if (executeRuntimeInputRulesInsertBreak(editor, previousInsertBreak)) {
        return true;
      }

      return previousInsertBreak();
    },
    insertData: (data: DataTransfer) => {
      if (
        executeRuntimeInputRulesInsertData(editor, data, previousInsertData)
      ) {
        return true;
      }

      return previousInsertData(data);
    },
    insertText: (
      text: string,
      options?: TextInsertTextOptions & { marks?: boolean }
    ) => {
      if (
        executeRuntimeInputRulesInsertText(
          editor,
          text,
          options,
          previousInsertText
        )
      ) {
        return true;
      }

      return previousInsertText(text, options);
    },
  }) as PlateRuntimeTransforms;
};

const installRuntimeLength = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeLength) return;

  const extension = defineEditorExtension({
    name: 'plate:length:runtime',
    setup() {
      return {
        operations: {
          apply({ operation, next }) {
            next(operation);

            const maxLength = editor.getOption<number | undefined>(
              plugin,
              'maxLength'
            );

            if (!maxLength) return;

            const length = editor.read((state) => state.text.string([]).length);

            if (length <= maxLength) return;

            editor.update((tx) => {
              tx.text.delete({
                distance: length - maxLength,
                reverse: true,
                unit: 'character',
              });
            });
          },
        },
      };
    },
  });

  plugin.runtimeLengthCleanup = editor.extend(extension);
  plugin.runtimeLengthExtension = extension;
};

type PlateRuntimeChunkingOptions = {
  chunkSize?: number;
  query?: (ancestor: Ancestor) => boolean;
};

const installRuntimeChunking = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeChunking) return;

  const { chunkSize = 1000, query } = (plugin.options ??
    {}) as PlateRuntimeChunkingOptions;
  const isDefaultQuery = !query || query === isCurrentEditorRoot;

  editor.getChunkSize = (ancestor) =>
    (isDefaultQuery ? ancestor === editor : query?.(ancestor))
      ? chunkSize
      : null;
};

const installRuntimeNodeId = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeNodeId) return;

  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    nodeId: {
      normalize: () => {
        const updates = collectRuntimeNodeIdNormalizeUpdates(
          editor,
          (plugin.options ?? {}) as NodeIdOptions
        );

        if (updates.length === 0) return;

        editor.update(
          (tx) => {
            updates.forEach(({ at, props }) => {
              tx.nodes.set(props, { at });
            });
          },
          { metadata: { history: { mode: 'skip' } }, skipNormalize: true }
        );
      },
    },
  }) as PlateRuntimeTransforms;

  const extension = defineEditorExtension({
    name: 'plate:node-id:runtime',
    setup() {
      return {
        operations: {
          apply({ operation, next }) {
            const {
              disableInsertOverrides,
              idCreator = () => nanoid(10),
              idKey = 'id',
              reuseId,
            } = (plugin.options ?? {}) as NodeIdOptions;
            const query = getRuntimeNodeIdQuery(
              (plugin.options ?? {}) as NodeIdOptions
            );

            if (operation.type === 'insert_node') {
              const node = cloneDeep(operation.node) as Descendant;
              const candidateIds = collectRuntimeDuplicateCandidateIds({
                disableInsertOverrides,
                idKey,
                nodeEntry: toRuntimeNodeIdEntry(node, operation.path),
                query,
              });
              const existingIds = collectRuntimeExistingNodeIds(editor, {
                candidateIds,
                idKey,
                onDuplicateIdScan: ((plugin.options ?? {}) as NodeIdOptions)
                  .onDuplicateIdScan,
                root: operation.root,
              });

              normalizeRuntimeNodeIdInsertedNode(
                toRuntimeNodeIdEntry(node, operation.path),
                {
                  disableInsertOverrides,
                  existingIds,
                  idCreator,
                  idKey,
                  query,
                }
              );

              next({
                ...operation,
                node,
              });
              return;
            }

            if (operation.type === 'split_node') {
              const props = getRuntimeNodeIdRecord(operation.properties);
              let id = props[idKey];

              if (
                queryNode(
                  toRuntimeNodeIdEntry(operation.properties, operation.path),
                  query
                )
              ) {
                if (
                  !reuseId ||
                  id === undefined ||
                  hasRuntimeNodeId(editor, {
                    id,
                    idKey,
                    root: operation.root,
                  })
                ) {
                  id = idCreator();
                }

                next({
                  ...operation,
                  properties: {
                    ...operation.properties,
                    [idKey]: id,
                  },
                });
                return;
              }

              if (id !== undefined) {
                const properties = { ...operation.properties };

                delete getRuntimeNodeIdRecord(properties)[idKey];

                next({
                  ...operation,
                  properties,
                });
                return;
              }
            }

            next(operation);
          },
        },
      };
    },
  });

  plugin.runtimeNodeIdCleanup = editor.extend(extension);
  plugin.runtimeNodeIdExtension = extension;
};

const installRuntimeAffinity = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeAffinity) return;

  const previousDeleteBackward =
    getPlateRuntimeTransforms(editor).deleteBackward;
  const previousInsertText = getPlateRuntimeTransforms(editor).insertText;
  const previousMove = getPlateRuntimeTransforms(editor).move;

  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    deleteBackward: (unit?: TextUnit) => {
      if (unit === 'character') {
        const start = getRuntimeAffinityEdgeNodes(editor)?.[0] ?? null;
        const startText = start
          ? TextApi.isText(start[0])
            ? start[0].text
            : getRuntimeNodeText(start[0])
          : null;

        if (start) {
          previousDeleteBackward(unit);

          const edgeNodes = getRuntimeAffinityEdgeNodes(editor);

          if (
            edgeNodes &&
            hasRuntimeAffinityNodes(editor, edgeNodes, 'directional') &&
            !hasRuntimeAffinityElement(edgeNodes)
          ) {
            setRuntimeAffinitySelection(
              editor,
              edgeNodes,
              startText && startText.length > 1 ? 'backward' : 'forward'
            );
          }

          return true;
        }
      }

      return previousDeleteBackward(unit);
    },
    insertText: (
      text: string,
      options?: TextInsertTextOptions & { marks?: boolean }
    ) => {
      const selection = editor.read((state) => state.selection.get());

      if (selection && RangeApi.isCollapsed(selection)) {
        const textPath = selection.focus.path;
        const textNode = getRuntimeDescendant<V, TExtensions, Text>(
          editor,
          textPath
        );

        if (textNode && TextApi.isText(textNode)) {
          const outwardMarks = Object.keys(
            getRuntimeNodeProps(textNode)
          ).filter(
            (type) =>
              getRuntimePluginByType(editor, type)?.rules?.selection
                ?.affinity === 'outward'
          );
          const isAtEnd = editor.read((state) =>
            state.points.isEnd(selection.focus, textPath)
          );

          if (outwardMarks.length > 0 && isAtEnd) {
            const afterPoint = editor.read((state) =>
              state.points.after(selection, {
                distance: 1,
                unit: 'character',
              })
            );
            const nextTextNode = afterPoint
              ? getRuntimeDescendant<V, TExtensions, Text>(
                  editor,
                  afterPoint.path
                )
              : null;
            const marksToRemove = outwardMarks.filter(
              (markKey) =>
                !!textNode[markKey] &&
                !(nextTextNode && TextApi.isText(nextTextNode)
                  ? nextTextNode[markKey]
                  : undefined)
            );

            if (marksToRemove.length > 0) {
              editor.update((tx) => {
                marksToRemove.forEach((markKey) => {
                  tx.marks.remove(markKey);
                });
              });
            }
          }
        }
      }

      return previousInsertText(text, options);
    },
    move: (options?: SelectionMoveOptions) => {
      const {
        distance = 1,
        reverse = false,
        unit = 'character',
      } = options ?? {};
      const selection = editor.read((state) => state.selection.get());

      if (
        unit === 'character' &&
        distance === 1 &&
        selection &&
        RangeApi.isCollapsed(selection)
      ) {
        const preEdgeNodes = getRuntimeAffinityEdgeNodes(editor);

        if (
          preEdgeNodes &&
          hasRuntimeAffinityNodes(editor, preEdgeNodes, 'hard')
        ) {
          if (
            preEdgeNodes[reverse ? 0 : 1] === null &&
            getRuntimeMarkBoundaryAffinity(editor, preEdgeNodes) ===
              (reverse ? 'forward' : 'backward')
          ) {
            setRuntimeAffinitySelection(
              editor,
              preEdgeNodes,
              reverse ? 'backward' : 'forward'
            );

            return true;
          }

          previousMove({ ...options, unit: 'offset' });
          return true;
        }

        previousMove(options);

        const postEdgeNodes = getRuntimeAffinityEdgeNodes(editor);

        if (
          postEdgeNodes &&
          hasRuntimeAffinityNodes(editor, postEdgeNodes, 'directional') &&
          !hasRuntimeAffinityElement(postEdgeNodes)
        ) {
          setRuntimeAffinitySelection(
            editor,
            postEdgeNodes,
            reverse ? 'forward' : 'backward'
          );
        }

        return true;
      }

      return previousMove(options);
    },
  }) as PlateRuntimeTransforms;
};

const getRuntimeParserMimeTypes = (parser: PlateRuntimeParser): string[] => {
  if (parser.mimeTypes) return parser.mimeTypes;

  const formats = Array.isArray(parser.format)
    ? parser.format
    : parser.format
      ? [parser.format]
      : [];

  return formats.map((format) =>
    format.includes('/') ? format : `text/${format}`
  );
};

const getRuntimeInjectedParserPlugins = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
): PlateRuntimePlugin[] => {
  const injectedPlugins: PlateRuntimePlugin[] = [];

  [...editor.meta.pluginList].reverse().forEach((candidate) => {
    const injectedPlugin = candidate.inject?.plugins?.[plugin.key];

    if (injectedPlugin) {
      injectedPlugins.push({
        ...plugin,
        ...injectedPlugin,
        key: injectedPlugin.key ?? plugin.key,
      } as PlateRuntimePlugin);
    }
  });

  return [plugin, ...injectedPlugins];
};

const createRuntimeParserContext = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin,
  options: PlateRuntimeParserOptions
) => ({
  ...createRuntimePluginContext(editor, plugin),
  ...options,
});

const shouldRuntimeInsertParserData = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugins: PlateRuntimePlugin[],
  options: PlateRuntimeParserOptions
) =>
  plugins.every((plugin) => {
    const query = plugin.parser?.query;

    return !query || query(createRuntimeParserContext(editor, plugin, options));
  });

const transformRuntimeParserData = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugins: PlateRuntimePlugin[],
  options: PlateRuntimeParserOptions
) => {
  let data = options.data;

  plugins.forEach((plugin) => {
    const transformData = plugin.parser?.transformData;

    if (!transformData) return;

    data = transformData(
      createRuntimeParserContext(editor, plugin, { ...options, data })
    );
  });

  return data;
};

const transformRuntimeParserFragment = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugins: PlateRuntimePlugin[],
  options: PlateRuntimeParserOptions & { fragment: Descendant[] }
) => {
  let fragment = options.fragment;

  plugins.forEach((plugin) => {
    const transformFragment = plugin.parser?.transformFragment;

    if (!transformFragment) return;

    fragment = transformFragment({
      ...createRuntimeParserContext(editor, plugin, options),
      fragment,
    });
  });

  return fragment;
};

const insertRuntimeParserFragment = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugins: PlateRuntimePlugin[],
  options: PlateRuntimeParserOptions & { fragment: Descendant[] }
) => {
  editor.update((tx) => {
    const fragment = options.fragment as Parameters<
      typeof tx.fragment.insert
    >[0];

    plugins.some(
      (plugin) =>
        plugin.parser?.preInsert?.({
          ...createRuntimeParserContext(editor, plugin, options),
          fragment: options.fragment,
        }) === true
    );

    tx.fragment.insert(fragment);
  });
};

const insertRuntimeParserData = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  dataTransfer: DataTransfer
) =>
  [...editor.meta.pluginList].reverse().some((plugin) => {
    const parser = plugin.parser;

    if (!parser) return false;

    const mimeTypes = getRuntimeParserMimeTypes(parser);

    if (mimeTypes.length === 0) return false;

    const injectedPlugins = getRuntimeInjectedParserPlugins(editor, plugin);

    for (const mimeType of mimeTypes) {
      let data = dataTransfer.getData(mimeType);

      if (
        (mimeType !== 'Files' && !data) ||
        (mimeType === 'Files' && dataTransfer.files.length === 0)
      ) {
        continue;
      }

      const parserOptions = { data, dataTransfer, mimeType };

      if (
        !shouldRuntimeInsertParserData(editor, injectedPlugins, parserOptions)
      ) {
        continue;
      }

      data = transformRuntimeParserData(editor, injectedPlugins, parserOptions);

      let fragment = parser.deserialize?.(
        createRuntimeParserContext(editor, plugin, {
          ...parserOptions,
          data,
        })
      );

      if (!fragment?.length) continue;

      fragment = transformRuntimeParserFragment(editor, injectedPlugins, {
        ...parserOptions,
        data,
        fragment,
      });

      if (fragment.length === 0) continue;

      insertRuntimeParserFragment(editor, injectedPlugins, {
        ...parserOptions,
        data,
        fragment,
      });

      return true;
    }

    return false;
  });

const installRuntimeParser = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  if (!plugin.runtimeParser) return;

  const previousInsertData = getPlateRuntimeTransforms(editor).insertData;

  plugin.runtimeTransforms = mergePlugins(plugin.runtimeTransforms ?? {}, {
    insertData: (dataTransfer: DataTransfer) => {
      if (insertRuntimeParserData(editor, dataTransfer)) return true;

      return previousInsertData(dataTransfer);
    },
  }) as PlateRuntimeTransforms;
};

const createPlateRuntimeTransforms = <
  V extends Value,
  const TExtensions extends readonly unknown[],
  P extends PlateRuntimePluginInput,
>(
  editor: PlateRuntimeEditor<V, TExtensions, P>
): PlateRuntimeTransforms<V, TExtensions> =>
  ({
    deleteBackward: (unit = 'character') => {
      const selection = editor.read((state) => state.selection.get());

      if (selection && RangeApi.isCollapsed(selection)) {
        const blockPath = getRuntimeBlockPath(editor, selection);
        const blockNode = blockPath
          ? getRuntimeDescendant(editor, blockPath)
          : undefined;
        const previousSelectableBlockVoidPoint =
          unit === 'character' && blockPath
            ? getPreviousRuntimeKeyboardSelectableBlockVoidPoint(
                editor,
                selection,
                blockPath
              )
            : null;

        if (previousSelectableBlockVoidPoint) {
          editor.update((tx) => {
            tx.selection.set(previousSelectableBlockVoidPoint);
          });
          return true;
        }

        if (blockPath && isRuntimeElementNode(blockNode)) {
          const blockType =
            typeof blockNode.type === 'string' ? blockNode.type : undefined;
          const plugin = blockType
            ? getRuntimePluginByType(editor, blockType)
            : undefined;
          const deleteRules = plugin?.rules?.delete;
          const blockText = getRuntimeNodeText(blockNode);
          const isAtStart = isRuntimeSelectionAtBlockEdge(
            editor,
            selection,
            blockPath,
            'start'
          );

          if (isAtStart) {
            const overridePlugin = getRuntimeDeleteOverridePlugin(
              editor,
              'delete.start',
              blockNode,
              blockPath
            );
            const startAction = (overridePlugin?.rules?.delete ?? deleteRules)
              ?.start;

            if (
              executeRuntimeDeleteAction(
                editor,
                startAction,
                blockPath,
                overridePlugin?.node?.type
              )
            ) {
              return true;
            }
          }

          if (blockText.length === 0) {
            const overridePlugin = getRuntimeDeleteOverridePlugin(
              editor,
              'delete.empty',
              blockNode,
              blockPath
            );
            const emptyAction = (overridePlugin?.rules?.delete ?? deleteRules)
              ?.empty;

            if (
              executeRuntimeDeleteAction(
                editor,
                emptyAction,
                blockPath,
                overridePlugin?.node?.type
              )
            ) {
              return true;
            }
          }
        }

        const rootStart = getRuntimeValueEdgePoint(
          editor.read((state) => state.value.root()),
          'start'
        );

        if (rootStart && PointApi.equals(selection.anchor, rootStart)) {
          getPlateRuntimeTransforms(editor).resetBlock({ at: [0] });
          return true;
        }
      }

      editor.update((tx) => {
        tx.text.deleteBackward({ unit });
      });

      return true;
    },
    deleteForward: (unit = 'character') => {
      editor.update((tx) => {
        tx.text.deleteForward({ unit });
      });

      return true;
    },
    deleteFragment: (options) => {
      const selection = editor.read((state) => state.selection.get());

      if (selection && isRuntimeSelectionWholeRoot(editor, selection)) {
        getPlateRuntimeTransforms(editor).reset({
          children: true,
          select: true,
        });
        return true;
      }

      editor.update((tx) => {
        tx.fragment.delete(options);
      });

      return true;
    },
    escape: () => false,
    focus: (options = {}) => {
      const target = resolveRuntimeFocusTarget(editor, options);

      if (target) {
        editor.update((tx) => {
          tx.selection.set(target);
        });
      }

      getPlateRuntimeDomApi(editor).focus({ retries: options.retries ?? 5 });
    },
    init: (options = {}) => {
      const { autoSelect, selection, shouldNormalizeEditor, value, onReady } =
        options;

      const applyValue = (nextValueInput: unknown, isAsync = false) => {
        const nextValue = resolveRuntimeInitValue(editor, nextValueInput);
        const autoSelectEdge =
          autoSelect === true
            ? 'end'
            : autoSelect === 'start'
              ? 'start'
              : autoSelect;
        const autoPoint = autoSelectEdge
          ? getRuntimeValueEdgePoint(nextValue, autoSelectEdge)
          : null;
        const autoSelection =
          selection ??
          (autoPoint ? { anchor: autoPoint, focus: autoPoint } : null);

        editor.update(
          (tx) => {
            tx.value.replace({
              children: nextValue,
              selection: autoSelection,
            });
          },
          { metadata: { history: { mode: 'skip' } }, skipNormalize: true }
        );

        pipeRuntimeTransformInitialValue(editor);

        if (shouldNormalizeEditor) {
          editor.update((tx) => {
            tx.normalize({ force: true });
          });
        }

        onReady?.({
          editor,
          isAsync,
          value: editor.read((state) => state.value.root()),
        });
      };

      if (typeof value === 'function') {
        const result = (
          value as (editor: PlateRuntimeEditor<V, TExtensions>) => unknown
        )(editor);

        if (isRuntimePromiseLike(result)) {
          result.then((resolvedValue) => {
            applyValue(resolvedValue, true);
          });
          return true;
        }

        applyValue(result);
        return true;
      }

      applyValue(value);
      return true;
    },
    insertBreak: () => {
      const selection = editor.read((state) => state.selection.get());

      if (selection && RangeApi.isCollapsed(selection)) {
        const blockPath = getRuntimeBlockPath(editor, selection);
        const blockNode = blockPath
          ? getRuntimeDescendant(editor, blockPath)
          : undefined;

        if (blockPath && isRuntimeElementNode(blockNode)) {
          const blockType =
            typeof blockNode.type === 'string' ? blockNode.type : undefined;
          const plugin = blockType
            ? getRuntimePluginByType(editor, blockType)
            : undefined;
          const breakRules = plugin?.rules?.break;
          const blockText = getRuntimeNodeText(blockNode);
          const isAtStart = isRuntimeSelectionAtBlockEdge(
            editor,
            selection,
            blockPath,
            'start'
          );
          const isAtEnd = isRuntimeSelectionAtBlockEdge(
            editor,
            selection,
            blockPath,
            'end'
          );

          if (blockText.length === 0) {
            const overridePlugin = getRuntimeBreakOverridePlugin(
              editor,
              'break.empty',
              blockNode,
              blockPath
            );
            const emptyAction = (overridePlugin?.rules?.break ?? breakRules)
              ?.empty;

            if (
              executeRuntimeBreakAction(
                editor,
                emptyAction,
                blockPath,
                overridePlugin?.node?.type
              )
            ) {
              return true;
            }
          }

          if (blockText.length > 0 && isAtEnd && blockText.endsWith('\n')) {
            const overridePlugin = getRuntimeBreakOverridePlugin(
              editor,
              'break.emptyLineEnd',
              blockNode,
              blockPath
            );
            const emptyLineEndAction = (
              overridePlugin?.rules?.break ?? breakRules
            )?.emptyLineEnd;

            if (
              executeRuntimeBreakAction(
                editor,
                emptyLineEndAction,
                blockPath,
                overridePlugin?.node?.type
              )
            ) {
              return true;
            }
          }

          const overrideDefaultPlugin = getRuntimeBreakOverridePlugin(
            editor,
            'break.default',
            blockNode,
            blockPath
          );
          const defaultAction = (
            overrideDefaultPlugin?.rules?.break ?? breakRules
          )?.default;

          if (
            executeRuntimeBreakAction(
              editor,
              defaultAction,
              blockPath,
              overrideDefaultPlugin?.node?.type
            )
          ) {
            return true;
          }

          const overrideSplitResetPlugin = getRuntimeBreakOverridePlugin(
            editor,
            'break.splitReset',
            blockNode,
            blockPath
          );
          const splitReset =
            overrideSplitResetPlugin?.rules?.break?.splitReset ??
            breakRules?.splitReset;

          if (splitReset) {
            const resetPath = isAtStart ? blockPath : PathApi.next(blockPath);

            editor.update((tx) => {
              tx.break.insert();
            });
            getPlateRuntimeTransforms(editor).resetBlock({ at: resetPath });

            return true;
          }
        }
      }

      editor.update((tx) => {
        tx.break.insert();
      });

      return true;
    },
    insertData: (dataTransfer) => {
      const clipboard = editor.api as unknown as {
        clipboard?: {
          insertData?: (data: DataTransfer) => boolean;
        };
        dom?: {
          clipboard?: {
            insertData?: (data: DataTransfer) => boolean;
          };
        };
      };
      const insertData =
        clipboard.clipboard?.insertData ?? clipboard.dom?.clipboard?.insertData;

      return insertData?.(dataTransfer) ?? false;
    },
    insertExitBreak: ({ at, match, reverse } = {}) => {
      const selection = editor.read((state) => state.selection.get());

      if (!at && (!selection || !RangeApi.isCollapsed(selection))) return;

      const blockPath = getRuntimeBlockPath(editor, at);

      if (!blockPath) return;

      const ancestorPath = findRuntimeExitBreakAncestorPath(
        editor,
        blockPath,
        match
      );
      const targetPath = reverse ? ancestorPath : PathApi.next(ancestorPath);

      if (!targetPath) return;

      editor.update((tx) => {
        tx.nodes.insert(createRuntimeDefaultBlock(editor), {
          at: targetPath,
          select: true,
        });
      });

      return true;
    },
    insertFragment: (fragment, options) => {
      if (fragment.length === 0) return false;

      editor.update((tx) => {
        tx.fragment.insert(fragment, options);
      });

      return true;
    },
    insertSoftBreak: () => {
      editor.update((tx) => {
        tx.text.insert('\n');
      });

      return true;
    },
    insertText: (text, options) => {
      const { marks: _marks, ...textOptions } = options ?? {};

      editor.update((tx) => {
        tx.text.insert(text, textOptions);
      });

      return true;
    },
    liftBlock: ({ at, match } = {}) => {
      if (!match) return;

      const blockPath = getRuntimeBlockPath(editor, at);

      if (!blockPath) return;

      const ancestorPath = findRuntimeAncestorPath(editor, blockPath, match);

      if (!ancestorPath) return;

      editor.update((tx) => {
        tx.nodes.unwrap<SlateElement>({
          at: ancestorPath,
          match: (node, path) => matchesRuntimeNode(node, path, match),
          split: true,
        });
      });

      return true;
    },
    move: (options) => {
      editor.update((tx) => {
        tx.selection.move(options);
      });

      return true;
    },
    moveLine: () => false,
    reset: (options = {}) => {
      const wasFocused = getPlateRuntimeReactApi(editor).isFocused();
      const children = createRuntimeDefaultValue(editor);
      const startPoint = options.select
        ? getRuntimeValueEdgePoint(children, 'start')
        : null;

      editor.update(
        (tx) => {
          tx.value.replace({
            children,
            selection: startPoint
              ? { anchor: startPoint, focus: startPoint }
              : null,
          });
        },
        options.children
          ? undefined
          : { metadata: { history: { mode: 'skip' } } }
      );

      if (wasFocused) {
        getPlateRuntimeTransforms(editor).focus({ edge: 'startEditor' });
      }
    },
    resetBlock: ({ at } = {}) => {
      const blockPath = getRuntimeBlockPath(editor, at);

      if (!blockPath) return;

      const block = getRuntimeDescendant(editor, blockPath);

      if (!isRuntimeElementNode(block)) return;

      const idKey = getRuntimeNodeIdKey(editor);
      const paragraphType = editor.plugins[BaseParagraphPlugin.key]
        ? editor.getType(BaseParagraphPlugin.key)
        : BaseParagraphPlugin.key;
      const unsetKeys = Object.keys(block).filter(
        (key) => key !== 'children' && key !== 'type' && key !== idKey
      );

      editor.update((tx) => {
        if (unsetKeys.length > 0) {
          tx.nodes.unset(unsetKeys, { at: blockPath });
        }

        if (block.type !== paragraphType) {
          tx.nodes.set<SlateElement>(
            { type: paragraphType } as Partial<SlateElement>,
            { at: blockPath }
          );
        }
      });

      return true;
    },
    select: (target, options) => {
      const nextTarget = options?.edge
        ? getRuntimeLocationPoint(editor, target, options.edge)
        : target;

      editor.update((tx) => {
        tx.selection.set(nextTarget);
      });

      return true;
    },
    selectAll: () => false,
    setValue: (value) => {
      let children: V;

      if (typeof value === 'string') {
        children = getPlateRuntimeHtmlApi(editor).deserialize({
          element: value,
        });
      } else if (!value || value.length === 0) {
        children = createRuntimeDefaultValue(editor);
      } else {
        children = value as V;
      }

      editor.update((tx) => {
        tx.value.replace({ children });
      });
    },
    tab: () => false,
  }) as PlateRuntimeTransforms<V, TExtensions>;

const assertRuntimePluginSupported = (plugin: PlateRuntimePlugin) => {
  if (plugin.extendEditor) {
    throw new Error(
      `[Plate] Plugin "${plugin.key}" uses extendEditor, which is not supported by createPlateRuntimeEditor yet. Move it to the runtime helper packet.`
    );
  }
  if (plugin.__configuration) {
    throw new Error(
      `[Plate] Plugin "${plugin.key}" still has unresolved configure() metadata.`
    );
  }
  if (plugin.__extensions && plugin.__extensions.length > 0) {
    throw new Error(
      `[Plate] Plugin "${plugin.key}" still has unresolved functional extensions.`
    );
  }
  if (plugin.__apiExtensions && plugin.__apiExtensions.length > 0) {
    throw new Error(
      `[Plate] Plugin "${plugin.key}" extends editor api/transforms, which is not supported by createPlateRuntimeEditor yet. Move it to the command-surface packet.`
    );
  }
  if (plugin.__txExtensions && plugin.__txExtensions.length > 0) {
    throw new Error(
      `[Plate] Plugin "${plugin.key}" still has unresolved tx metadata.`
    );
  }
};

const resolveRuntimeHandledEditorExtension = (
  plugin: PlateRuntimePlugin
): PlateRuntimePlugin => {
  if (!plugin.extendEditor) return plugin;

  if (plugin.key === 'chunking' && plugin.extendEditor === withChunking) {
    return { ...plugin, extendEditor: undefined, runtimeChunking: true };
  }

  if (plugin.key === 'nodeId' && plugin.extendEditor === withNodeId) {
    return { ...plugin, extendEditor: undefined, runtimeNodeId: true };
  }

  if (plugin.key !== 'history' && plugin.key !== 'dom') return plugin;

  return { ...plugin, extendEditor: undefined };
};

const normalizeConfiguredInputRules = (inputRules: unknown) => {
  if (inputRules === undefined) return [];
  if (Array.isArray(inputRules)) return [...inputRules];

  throw new Error(
    'inputRules config must be an array of explicit rule instances.'
  );
};

const createRuntimePluginContext = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
): RuntimePluginContext => {
  const getInstalledPlugin = () => editor.plugins[plugin.key] ?? plugin;
  const getOptions = () => {
    const installedPlugin = getInstalledPlugin();

    if (installedPlugin.optionsStore) return editor.getOptions(installedPlugin);

    return installedPlugin.options ?? {};
  };
  const setOptions = (
    nextOptions:
      | ((state: Record<string, unknown>) => void)
      | Record<string, unknown>
  ) => {
    const installedPlugin = getInstalledPlugin();

    if (installedPlugin.optionsStore) {
      editor.setOptions(installedPlugin, nextOptions);
      return;
    }

    installedPlugin.options = installedPlugin.options ?? {};

    if (typeof nextOptions === 'function') {
      nextOptions(installedPlugin.options);
      return;
    }

    Object.assign(installedPlugin.options, nextOptions);
  };

  return {
    api: editor.api,
    editor,
    plugin,
    type: plugin.node?.type ?? plugin.key,
    getOption: (key) => getOptions()[key],
    getOptions,
    setOption: (keyOrOptions, value) => {
      if (typeof keyOrOptions === 'string') {
        setOptions({ [keyOrOptions]: value });
        return;
      }

      setOptions(keyOrOptions);
    },
    setOptions,
  };
};

const createRuntimeTxTransformFacade = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
): Record<string, unknown> => {
  const facade: Record<string, unknown> = {};

  Object.keys(plugin.tx ?? {}).forEach((groupKey) => {
    facade[groupKey] = new Proxy(
      {},
      {
        get: (_target, methodKey) => {
          if (typeof methodKey !== 'string') return;

          return (...args: unknown[]) => {
            let result: unknown;

            editor.update((tx: Record<string, any>) => {
              result = tx[groupKey]?.[methodKey]?.(...args);
            });

            return result;
          };
        },
      }
    );
  });

  return facade;
};

const createRuntimeTransformPluginContext = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  const context = createRuntimePluginContext(editor, plugin) as ReturnType<
    typeof createRuntimePluginContext
  > & {
    tf: PlateRuntimeTransforms<V, TExtensions>;
  };
  const txTransforms = createRuntimeTxTransformFacade(editor, plugin);
  const runtimeTransforms = getPlateRuntimeTransforms(editor) as Record<
    string,
    unknown
  >;

  context.tf = new Proxy(runtimeTransforms, {
    get: (target, property) => {
      if (typeof property === 'string' && property in txTransforms) {
        return txTransforms[property];
      }

      return Reflect.get(target, property);
    },
  }) as PlateRuntimeTransforms<V, TExtensions>;

  return context;
};

const normalizeRuntimeSlateExtensions = (extensions: unknown) => {
  if (!extensions) return [];

  return Array.isArray(extensions) ? extensions : [extensions];
};

const installRuntimeSlateExtensions = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  plugin: PlateRuntimePlugin
) => {
  const rawExtensions =
    typeof plugin.slateExtensions === 'function'
      ? plugin.slateExtensions(createRuntimePluginContext(editor, plugin))
      : plugin.slateExtensions;
  const extensions = normalizeRuntimeSlateExtensions(rawExtensions);

  if (extensions.length === 0) return;

  plugin.runtimeSlateExtensions = extensions;
  plugin.runtimeSlateExtensionsCleanup = extensions.map((extension) =>
    editor.extend(extension as EditorExtensionInput)
  );
};

const resolveRuntimePluginConfig = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  pluginInput: PlateRuntimePluginInput
): PlateRuntimePlugin => {
  let plugin = mergePlugins({}, pluginInput) as PlateRuntimePlugin;

  if (plugin.__configuration) {
    const rawConfig = plugin.__configuration(
      createRuntimePluginContext(editor, plugin)
    );
    const { inputRules, ...config } = rawConfig ?? {};

    if (inputRules !== undefined) {
      plugin.__configuredInputRules = [
        ...normalizeConfiguredInputRules(plugin.__configuredInputRules),
        ...normalizeConfiguredInputRules(inputRules),
      ];
    }

    plugin = mergePlugins(plugin, config) as PlateRuntimePlugin;
    plugin.__configuration = undefined;
  }

  if (plugin.__extensions && plugin.__extensions.length > 0) {
    for (const extension of plugin.__extensions) {
      plugin = mergePlugins(
        plugin,
        extension(createRuntimePluginContext(editor, plugin))
      ) as PlateRuntimePlugin;
    }

    plugin.__extensions = [];
  }

  if (plugin.key === 'blockquote') {
    plugin.runtimeBlockquote = true;
  }
  if (plugin.key === 'indent') {
    plugin.runtimeIndent = true;
  }
  if (plugin.key === 'list') {
    plugin.runtimeList = true;
  }
  if (plugin.key === 'tag') {
    plugin.runtimeMultiSelect = true;
  }
  if (plugin.key === 'toggle') {
    plugin.runtimeToggle = true;
  }
  if (plugin.key === 'column') {
    plugin.runtimeLayoutColumn = true;
  }
  if (plugin.key === 'code_block') {
    plugin.runtimeCodeBlock = true;
  }
  if (plugin.key === 'a') {
    plugin.runtimeLink = true;
  }

  if (plugin.__txExtensions && plugin.__txExtensions.length > 0) {
    for (const txExtension of plugin.__txExtensions) {
      const context = createRuntimePluginContext(editor, plugin);

      plugin.tx = mergePlugins(
        plugin.tx ?? {},
        txExtension(context)
      ) as PlateRuntimePlugin['tx'];
    }

    plugin.__txExtensions = [];
  }

  if (plugin.__apiExtensions && plugin.__apiExtensions.length > 0) {
    const unsupportedExtensions: PlateRuntimeApiExtension[] = [];

    for (const apiExtension of plugin.__apiExtensions as PlateRuntimeApiExtension[]) {
      const rawExtension =
        apiExtension.source ??
        (
          apiExtension.extension as unknown as {
            __legacyTransformSource?: unknown;
          }
        ).__legacyTransformSource ??
        (apiExtension.extension as unknown);

      if (
        plugin.key === 'chunking' &&
        apiExtension.isOverride &&
        apiExtension.isTransform &&
        rawExtension === withChunking
      ) {
        plugin.runtimeChunking = true;
        continue;
      }

      if (
        plugin.key === 'nodeId' &&
        apiExtension.isOverride &&
        apiExtension.isTransform &&
        rawExtension === withNodeId
      ) {
        plugin.runtimeNodeId = true;
        continue;
      }

      if (
        plugin.key === 'blockquote' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeBlockquote = true;
        continue;
      }

      if (
        plugin.key === 'caption' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeCaption = true;
        continue;
      }

      if (
        plugin.key === 'comment' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeComment = true;
        continue;
      }

      if (
        plugin.key === 'comment' &&
        !apiExtension.isOverride &&
        !apiExtension.isTransform
      ) {
        plugin.runtimeComment = true;
        continue;
      }

      if (
        plugin.key === 'code_block' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeCodeBlock = true;
        continue;
      }

      if (
        plugin.key === RUNTIME_FOOTNOTE_REFERENCE_KEY &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeFootnote = true;
        plugin.runtimeTriggerCombobox = true;
        continue;
      }

      if (
        plugin.key === RUNTIME_FOOTNOTE_REFERENCE_KEY &&
        !apiExtension.isOverride
      ) {
        plugin.runtimeFootnote = true;
        continue;
      }

      if (
        plugin.key === 'tag' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeMultiSelect = true;
        continue;
      }

      if (
        plugin.key === 'column' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeLayoutColumn = true;
        continue;
      }

      if (
        plugin.key === 'indent' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeIndent = true;
        continue;
      }

      if (
        plugin.key === 'list' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeList = true;
        continue;
      }

      if (
        plugin.key === RUNTIME_CLASSIC_TODO_LIST_KEY &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeClassicTodoList = true;
        continue;
      }

      if (
        plugin.key === 'toggle' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeToggle = true;
        continue;
      }

      if (
        plugin.key === 'singleBlock' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeSingleBlock = true;
        continue;
      }

      if (
        plugin.key === 'singleLine' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeSingleLine = true;
        continue;
      }

      if (
        plugin.key === 'normalizeTypes' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeNormalizeTypes = true;
        continue;
      }

      if (
        plugin.key === 'trailingBlock' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeTrailingBlock = true;
        continue;
      }

      if (
        plugin.key === 'affinity' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeAffinity = true;
        continue;
      }

      if (plugin.key === 'navigationFeedback' && apiExtension.isTransform) {
        plugin.runtimeNavigationFeedback = true;
        continue;
      }

      if (
        plugin.key === 'parser' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeParser = true;
        continue;
      }

      if (
        plugin.key === 'inputRules' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeInputRules = true;
        continue;
      }

      if (
        plugin.key === 'length' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        plugin.runtimeLength = true;
        continue;
      }

      if (
        plugin.key === 'override' &&
        apiExtension.isOverride &&
        apiExtension.isTransform &&
        (rawExtension === withOverrides ||
          rawExtension === withBreakRules ||
          rawExtension === withDeleteRules)
      ) {
        continue;
      }

      if (
        plugin.key === 'override' &&
        apiExtension.isOverride &&
        apiExtension.isTransform &&
        rawExtension === withMergeRules
      ) {
        plugin.runtimeOverrideMergeRules = true;
        continue;
      }

      if (
        plugin.key === 'override' &&
        apiExtension.isOverride &&
        apiExtension.isTransform &&
        rawExtension === withNormalizeRules
      ) {
        plugin.runtimeOverrideNormalizeRules = true;
        continue;
      }

      if (
        plugin.key === 'dom' &&
        apiExtension.isTransform &&
        !apiExtension.isPluginSpecific &&
        !apiExtension.isOverride
      ) {
        plugin.runtimeTransforms = mergePlugins(
          plugin.runtimeTransforms ?? {},
          apiExtension.extension(createRuntimePluginContext(editor, plugin))
        ) as PlateRuntimeTransforms;
        continue;
      }

      if (
        plugin.key === 'slateExtension' &&
        apiExtension.isTransform &&
        !apiExtension.isPluginSpecific &&
        !apiExtension.isOverride
      ) {
        plugin.runtimeSlateExtensionPipeline = true;
        continue;
      }

      if (
        plugin.key === 'dom' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        const extension = apiExtension.extension(
          createRuntimePluginContext(editor, plugin)
        ) as {
          tf?: Record<string, unknown>;
        };
        const tf = extension.tf;

        if (tf?.withScrolling) {
          plugin.runtimeTransforms = mergePlugins(
            plugin.runtimeTransforms ?? {},
            {
              withScrolling: tf.withScrolling,
            }
          ) as PlateRuntimeTransforms;
        }

        plugin.runtimeDomOperations = true;
        continue;
      }

      if (
        plugin.key === 'slateExtension' &&
        apiExtension.isOverride &&
        apiExtension.isTransform
      ) {
        const extension = apiExtension.extension(
          createRuntimePluginContext(editor, plugin)
        ) as {
          tf?: Record<string, unknown>;
        };
        const tf = extension.tf;

        if (tf?.apply || tf?.init) {
          plugin.runtimeSlateExtensionPipeline = true;
        } else {
          plugin.runtimeSlateReactOverride = true;
        }

        continue;
      }

      if (
        apiExtension.isTransform &&
        !apiExtension.isPluginSpecific &&
        !apiExtension.isOverride &&
        hasRuntimePluginTx(plugin)
      ) {
        plugin.runtimeTransforms = mergePlugins(
          plugin.runtimeTransforms ?? {},
          apiExtension.extension(
            createRuntimeTransformPluginContext(editor, plugin)
          )
        ) as PlateRuntimeTransforms;
        continue;
      }

      if (
        apiExtension.isTransform &&
        apiExtension.isPluginSpecific &&
        !apiExtension.isOverride
      ) {
        plugin.runtimeTransforms = mergePlugins(
          plugin.runtimeTransforms ?? {},
          {
            [plugin.key]: apiExtension.extension(
              createRuntimeTransformPluginContext(editor, plugin)
            ),
          }
        ) as PlateRuntimeTransforms;
        continue;
      }

      if (apiExtension.isOverride) {
        const context = createRuntimePluginContext(
          editor,
          plugin
        ) as ReturnType<typeof createRuntimePluginContext> & {
          tf: PlateRuntimeTransforms<V, TExtensions>;
        };

        context.tf = getPlateRuntimeTransforms(editor);

        const extension = apiExtension.extension(context) as {
          api?: Record<string, unknown>;
          tf?: Record<string, unknown>;
        };
        const tf = extension.tf;

        if (extension.api) {
          plugin.api = mergePlugins(plugin.api ?? {}, extension.api) as Record<
            string,
            unknown
          >;
        }
        if (tf) {
          plugin.runtimeTransforms = mergePlugins(
            plugin.runtimeTransforms ?? {},
            tf
          ) as PlateRuntimeTransforms;
        }

        continue;
      }

      if (apiExtension.isOverride || apiExtension.isTransform) {
        unsupportedExtensions.push(apiExtension);
        continue;
      }

      const api = apiExtension.extension(
        createRuntimePluginContext(editor, plugin)
      );

      plugin.api = apiExtension.isPluginSpecific
        ? (mergePlugins(plugin.api ?? {}, {
            [plugin.key]: api,
          }) as Record<string, unknown>)
        : (mergePlugins(plugin.api ?? {}, api) as Record<string, unknown>);
    }

    plugin.__apiExtensions = unsupportedExtensions;
  }

  return plugin;
};

const cloneRuntimePlugin = <
  V extends Value,
  const TExtensions extends readonly unknown[],
>(
  editor: PlateRuntimeEditor<V, TExtensions>,
  pluginInput: PlateRuntimePluginInput
): PlateRuntimePlugin => {
  const resolvedPlugin = resolveRuntimeHandledEditorExtension(
    resolveRuntimePluginConfig(editor, pluginInput)
  );

  assertRuntimePluginSupported(resolvedPlugin);

  const cloned = mergePlugins({}, resolvedPlugin) as PlateRuntimePlugin;

  if (cloned.node?.component) {
    cloned.render = { ...cloned.render, node: cloned.node.component };
  }
  if (cloned.render?.node) {
    cloned.node = { ...cloned.node, component: cloned.render.node };
  }

  return cloned;
};

const flattenRuntimePlugins = <
  V extends Value,
  const TExtensions extends readonly unknown[],
  P extends PlateRuntimePluginInput,
>(
  editor: PlateRuntimeEditor<V, TExtensions, P>,
  plugins: PlateRuntimePluginInput[]
): Map<string, PlateRuntimePlugin> => {
  const pluginMap = new Map<string, PlateRuntimePlugin>();

  const visit = (pluginInput: PlateRuntimePluginInput) => {
    const plugin = cloneRuntimePlugin(editor, pluginInput);
    const existingPlugin = pluginMap.get(plugin.key);
    const resolvedPlugin = existingPlugin
      ? (mergePlugins(existingPlugin, plugin) as PlateRuntimePlugin)
      : plugin;

    pluginMap.set(plugin.key, resolvedPlugin);
    editor.plugins[plugin.key] = resolvedPlugin;

    resolvedPlugin.plugins?.forEach(visit);
  };

  plugins.forEach(visit);

  return pluginMap;
};

const applyRuntimePluginOverrides = (
  plugins: PlateRuntimePlugin[]
): PlateRuntimePlugin[] => {
  const enabledOverrides: Record<string, boolean> = {};
  const componentOverrides: Record<
    string,
    { component: unknown; priority: number }
  > = {};
  const pluginOverrides: Record<string, Partial<PlateRuntimePlugin>> = {};

  plugins.forEach((plugin) => {
    Object.assign(enabledOverrides, plugin.override?.enabled);
    Object.entries(plugin.override?.components ?? {}).forEach(
      ([key, component]) => {
        const priority = plugin.priority ?? 100;

        if (
          !componentOverrides[key] ||
          priority > componentOverrides[key].priority
        ) {
          componentOverrides[key] = { component, priority };
        }
      }
    );
    Object.entries(plugin.override?.plugins ?? {}).forEach(([key, value]) => {
      pluginOverrides[key] = mergePlugins(
        pluginOverrides[key] ?? {},
        value
      ) as Partial<PlateRuntimePlugin>;

      if (value.enabled !== undefined) {
        enabledOverrides[key] = value.enabled;
      }
    });
  });

  return plugins
    .map((plugin) => {
      const override = pluginOverrides[plugin.key];
      let nextPlugin = override
        ? (mergePlugins(plugin, override) as PlateRuntimePlugin)
        : { ...plugin };
      const componentOverride = componentOverrides[plugin.key];

      if (
        componentOverride &&
        (!nextPlugin.render?.node ||
          componentOverride.priority > (nextPlugin.priority ?? 100))
      ) {
        nextPlugin = {
          ...nextPlugin,
          node: { ...nextPlugin.node, component: componentOverride.component },
          render: { ...nextPlugin.render, node: componentOverride.component },
        };
      }

      const enabled = enabledOverrides[plugin.key] ?? nextPlugin.enabled;

      return { ...nextPlugin, enabled };
    })
    .filter((plugin) => plugin.enabled !== false);
};

const sortRuntimePlugins = (
  pluginMap: Map<string, PlateRuntimePlugin>
): PlateRuntimePlugin[] => {
  const sortedByPriority = Array.from(pluginMap.values()).sort(
    (a, b) => (b.priority ?? 100) - (a.priority ?? 100)
  );
  const ordered: PlateRuntimePlugin[] = [];
  const visited = new Set<string>();

  const visit = (plugin: PlateRuntimePlugin) => {
    if (visited.has(plugin.key)) return;

    visited.add(plugin.key);

    plugin.dependencies?.forEach((dependencyKey) => {
      const dependency = pluginMap.get(dependencyKey);

      if (!dependency) {
        throw new Error(
          `[Plate] Plugin "${plugin.key}" depends on missing plugin "${dependencyKey}".`
        );
      }

      visit(dependency);
    });

    ordered.push(plugin);
  };

  sortedByPriority.forEach(visit);

  return ordered;
};

const createRuntimeInputRulesMeta = (plugins: PlateRuntimePlugin[]) => {
  const meta: ResolvedInputRulesMeta = {
    insertBreak: [],
    insertData: [],
    insertText: { all: [], byTrigger: {} },
    plugins: {},
  };

  plugins.forEach((plugin, pluginIndex) => {
    meta.plugins[plugin.key] = { rules: [] };

    const inputRules =
      typeof plugin.inputRules === 'function'
        ? plugin.inputRules({
            rule: createInputRuleBuilder(),
          } as never)
        : (plugin.inputRules ?? []);
    const rules = [
      ...normalizeConfiguredInputRules(inputRules),
      ...normalizeConfiguredInputRules(plugin.__configuredInputRules),
    ] as AnyInputRule[];

    rules.forEach((definition, ruleIndex) => {
      if (!definition) return;

      const mergedRule = mergePlugins(
        {},
        definition
      ) as unknown as ResolvedInputRule;
      const resolvedRule = {
        ...mergedRule,
        id: `${plugin.key}.${ruleIndex}`,
        pluginIndex,
        pluginKey: plugin.key,
        priority: mergedRule.priority ?? plugin.priority ?? 100,
        ruleIndex,
      } as ResolvedInputRule;

      meta.plugins[plugin.key].rules.push(resolvedRule);

      if (resolvedRule.target === 'insertText') {
        const triggers = Array.isArray(resolvedRule.trigger)
          ? [...resolvedRule.trigger]
          : [resolvedRule.trigger];

        meta.insertText.all.push(resolvedRule);
        triggers.forEach((trigger) => {
          meta.insertText.byTrigger[trigger] ??= [];
          meta.insertText.byTrigger[trigger].push(resolvedRule);
        });
      } else if (resolvedRule.target === 'insertBreak') {
        meta.insertBreak.push(resolvedRule);
      } else if (resolvedRule.target === 'insertData') {
        meta.insertData.push(resolvedRule);
      }
    });
  });

  const sortRules = (a: ResolvedInputRule, b: ResolvedInputRule) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.pluginIndex !== b.pluginIndex) return a.pluginIndex - b.pluginIndex;

    return a.ruleIndex - b.ruleIndex;
  };

  meta.insertBreak.sort(sortRules);
  meta.insertData.sort(sortRules);
  meta.insertText.all.sort(sortRules);
  Object.values(meta.insertText.byTrigger).forEach((rules) => {
    rules.sort(sortRules);
  });

  return meta;
};

const applyRuntimePluginMetadata = <
  V extends Value,
  const TExtensions extends readonly unknown[],
  P extends PlateRuntimePluginInput,
>(
  editor: PlateRuntimeEditor<V, TExtensions, P>,
  plugins: PlateRuntimePlugin[],
  createStore: PlateRuntimePluginStoreFactory
) => {
  const pluginTxGroups: Record<string, NonNullable<PlateRuntimePlugin['tx']>[string][]> =
    {};

  editor.meta.pluginList = plugins;
  editor.plugins = Object.fromEntries(
    plugins.map((plugin) => [plugin.key, plugin])
  );
  editor.meta.inputRules = createRuntimeInputRulesMeta(plugins);

  const elementSpecs = plugins
    .map(createRuntimeElementSpec)
    .filter((spec): spec is EditorElementSpec => spec !== null);

  if (elementSpecs.length > 0) {
    editor.extend(
      defineEditorExtension({
        elements: elementSpecs,
        name: 'plate:element-specs:runtime',
      })
    );
  }

  plugins.forEach((plugin) => {
    let store = createStore(plugin.options ?? {}, {
      mutative: true,
      name: plugin.key,
    });

    if (plugin.__selectorExtensions && plugin.__selectorExtensions.length > 0) {
      for (const extension of plugin.__selectorExtensions) {
        const selectors = extension(createRuntimePluginContext(editor, plugin));

        store = store.extendSelectors(() => selectors);
      }

      plugin.__selectorExtensions = [];
    }

    plugin.optionsStore = store;

    if (plugin.node?.isContainer) {
      editor.meta.pluginCache.node.isContainer.push(plugin.key);
    }
    if (plugin.node?.isMetadataProp) {
      editor.meta.pluginCache.node.isMetadataProp.push(plugin.key);
    }
    if (plugin.node?.type) {
      editor.meta.pluginCache.node.types[plugin.node.type] = plugin.key;
    }
    if (plugin.inject?.nodeProps) {
      editor.meta.pluginCache.inject.nodeProps.push(plugin.key);
    }
    if (plugin.render?.node) {
      editor.meta.components[plugin.key] = plugin.render.node;
    }
    if (
      plugin.node?.isLeaf &&
      (plugin.node?.isDecoration === true ||
        plugin.render?.leaf ||
        plugin.render?.node)
    ) {
      editor.meta.pluginCache.node.isLeaf.push(plugin.key);
    }
    if (plugin.node?.isLeaf && plugin.node?.isDecoration === false) {
      editor.meta.pluginCache.node.isText.push(plugin.key);
    }
    if (plugin.node?.leafProps) {
      editor.meta.pluginCache.node.leafProps.push(plugin.key);
    }
    if (plugin.node?.textProps) {
      editor.meta.pluginCache.node.textProps.push(plugin.key);
    }
    if (plugin.render?.aboveEditable) {
      editor.meta.pluginCache.render.aboveEditable.push(plugin.key);
    }
    if (plugin.render?.aboveSlate) {
      editor.meta.pluginCache.render.aboveSlate.push(plugin.key);
    }
    if (plugin.render?.afterEditable) {
      editor.meta.pluginCache.render.afterEditable.push(plugin.key);
    }
    if (plugin.render?.beforeEditable) {
      editor.meta.pluginCache.render.beforeEditable.push(plugin.key);
    }
    if (plugin.rules?.match) {
      editor.meta.pluginCache.rules.match.push(plugin.key);
    }
    if (plugin.render?.afterContainer) {
      editor.meta.pluginCache.render.afterContainer.push(plugin.key);
    }
    if (plugin.render?.beforeContainer) {
      editor.meta.pluginCache.render.beforeContainer.push(plugin.key);
    }
    if (plugin.render?.belowRootNodes) {
      editor.meta.pluginCache.render.belowRootNodes.push(plugin.key);
    }
    if (plugin.transformInitialValue) {
      editor.meta.pluginCache.transformInitialValue.push(plugin.key);
    }
    if (plugin.decorate) {
      editor.meta.pluginCache.decorate.push(plugin.key);
    }
    if (plugin.render?.aboveNodes) {
      editor.meta.pluginCache.render.aboveNodes.push(plugin.key);
    }
    if (plugin.render?.belowNodes) {
      editor.meta.pluginCache.render.belowNodes.push(plugin.key);
    }
    if (plugin.useHooks) {
      editor.meta.pluginCache.useHooks.push(plugin.key);
    }
    if (plugin.handlers?.onChange) {
      editor.meta.pluginCache.handlers.onChange.push(plugin.key);
    }
    if (plugin.handlers?.onKeyDown) {
      editor.meta.pluginCache.handlers.onKeyDown.push(plugin.key);
    }
    if (plugin.handlers?.onNodeChange) {
      editor.meta.pluginCache.handlers.onNodeChange.push(plugin.key);
    }
    if (plugin.handlers?.onTextChange) {
      editor.meta.pluginCache.handlers.onTextChange.push(plugin.key);
    }

    Object.entries(plugin.shortcuts ?? {}).forEach(([key, shortcut]) => {
      if (shortcut === null) return;

      editor.meta.shortcuts[`${plugin.key}.${key}`] = shortcut;
    });

    installRuntimeChunking(editor, plugin);
    installRuntimeNodeId(editor, plugin);
    installRuntimeDomExtension(editor, plugin);
    installRuntimeAffinity(editor, plugin);
    installRuntimeBlockquote(editor, plugin);
    installRuntimeCaption(editor, plugin);
    installRuntimeCodeBlock(editor, plugin);
    installRuntimeClassicTodoList(editor, plugin);
    installRuntimeComment(editor, plugin);
    installRuntimeFootnote(editor, plugin);
    installRuntimeInputRules(editor, plugin);
    installRuntimeIndent(editor, plugin);
    installRuntimeLayoutColumn(editor, plugin);
    installRuntimeList(editor, plugin);
    installRuntimeLength(editor, plugin);
    installRuntimeLink(editor, plugin);
    installRuntimeNavigationFeedback(editor, plugin);
    installRuntimeNormalizeTypes(editor, plugin);
    installRuntimeOverrideMergeRules(editor, plugin);
    installRuntimeOverrideNormalizeRules(editor, plugin);
    installRuntimeParser(editor, plugin);
    installRuntimeSlateExtensionPipeline(editor, plugin);
    installRuntimeSlateReactOverride(editor, plugin);
    installRuntimeSingleBlock(editor, plugin);
    installRuntimeSingleLine(editor, plugin);
    installRuntimeTrailingBlock(editor, plugin);
    installRuntimeToggle(editor, plugin);
    installRuntimeTriggerCombobox(editor, plugin);
    installRuntimeMultiSelect(editor, plugin);
    installRuntimeSlateExtensions(editor, plugin);

    if (plugin.api && Object.keys(plugin.api).length > 0) {
      const extension = defineEditorExtension({
        api: plugin.api,
        name: `plate:${plugin.key}:api`,
      });

      plugin.runtimeApiCleanup = editor.extend(extension);
      plugin.runtimeApiExtension = extension;
    }
    if (plugin.tx && Object.keys(plugin.tx).length > 0) {
      Object.entries(plugin.tx).forEach(([groupKey, groupFactory]) => {
        if (!groupFactory) return;

        pluginTxGroups[groupKey] ??= [];
        pluginTxGroups[groupKey].push(groupFactory);
      });
    }
    if (
      plugin.runtimeTransforms &&
      Object.keys(plugin.runtimeTransforms).length > 0
    ) {
      setPlateRuntimeTransforms(
        editor,
        mergePlugins(
          getPlateRuntimeTransforms(editor),
          plugin.runtimeTransforms
        ) as PlateRuntimeTransforms<V, TExtensions>
      );
    }
  });

  if (Object.keys(pluginTxGroups).length > 0) {
    const tx = Object.fromEntries(
      Object.entries(pluginTxGroups).map(([groupKey, groupFactories]) => [
        groupKey,
        (
          transaction: EditorUpdateTransaction,
          editorArg: PlateRuntimeEditor,
          context: EditorUpdateContext<PlateRuntimeEditor>
        ) =>
          groupFactories.reduce(
            (acc, groupFactory) =>
              mergePlugins(
                acc,
                groupFactory(transaction, editorArg, context)
              ) as Record<string, unknown>,
            {}
          ),
      ])
    );
    const extension = defineEditorExtension({
      name: 'plate:plugins:tx',
      tx,
    });
    const cleanup = editor.extend(extension);

    plugins.forEach((plugin) => {
      if (!plugin.tx || Object.keys(plugin.tx).length === 0) return;

      plugin.runtimeTxCleanup = cleanup;
      plugin.runtimeTxExtension = extension;
    });
  }
};

const isRuntimeTransformInitialValueEditOnly = (
  readOnly: boolean,
  plugin: PlateRuntimePlugin
) => {
  if (!readOnly) return false;
  if (plugin.editOnly === true) return false;

  return (
    typeof plugin.editOnly === 'object' &&
    plugin.editOnly.transformInitialValue === true
  );
};

const pipeRuntimeTransformInitialValue = <
  V extends Value,
  const TExtensions extends readonly unknown[],
  P extends PlateRuntimePluginInput,
>(
  editor: PlateRuntimeEditor<V, TExtensions, P>
) => {
  if (editor.meta.pluginCache.transformInitialValue.length === 0) return;

  let nextValue = editor.read((state) => state.value.root()) as V;
  let hasTransformed = false;

  editor.meta.pluginCache.transformInitialValue.forEach((key) => {
    const plugin = editor.getPlugin({ key });

    if (isRuntimeTransformInitialValueEditOnly(editor.dom.readOnly, plugin)) {
      return;
    }

    if (!plugin.transformInitialValue) return;

    const transformedValue = plugin.transformInitialValue({
      ...createRuntimePluginContext(editor, plugin),
      value: nextValue,
    });

    if (transformedValue === undefined) {
      throw new Error(
        `Plugin "${key}" transformInitialValue must return the next value.`
      );
    }

    nextValue = transformedValue as V;
    hasTransformed = true;
  });

  if (!hasTransformed) return;

  const selection = editor.read((state) => state.selection.get());

  editor.update(
    (tx) => {
      tx.value.replace({ children: nextValue, selection });
    },
    { skipNormalize: true }
  );
};

/**
 * Create the first Plate-owned editor scaffold on top of the Slate v2 React
 * runtime. This does not replace `createPlateEditor` yet; plugin resolution and
 * React provider migration are separate packets.
 */
export const createPlateRuntimeEditor = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
  const P extends PlateRuntimePluginInput = PlateRuntimePluginInput,
>({
  id = nanoid(),
  optionsStoreFactory = createZustandStore,
  plugins = [],
  readOnly = false,
  uid,
  userId,
  ...options
}: CreatePlateRuntimeEditorOptions<V, TExtensions, P> = {}): PlateRuntimeEditor<
  V,
  TExtensions,
  P
> => {
  const editor = createReactEditor<V, TExtensions>(
    options
  ) as PlateRuntimeEditor<V, TExtensions, P>;

  plateRuntimeEditors.add(editor);

  editor.id = id;
  editor.dom = {
    composing: false,
    currentKeyboardEvent: null,
    focused: false,
    prevSelection: null,
    readOnly,
  };
  editor.meta = createPlateRuntimeMeta({ uid, userId });
  editor.plugins = {};
  setPlateRuntimeTransforms(editor, createPlateRuntimeTransforms(editor));
  installPlateRuntimeCompatibilityBridge(editor);
  Object.defineProperties(editor, {
    children: {
      configurable: true,
      get: () => editor.read((state) => state.value.root()) as V,
    },
    selection: {
      configurable: true,
      get: () => editor.read((state) => state.selection.get()),
    },
  });
  editor.getPlugin = <
    T extends PlateRuntimePlugin = PlateRuntimePlugin,
  >(plugin: {
    key: string;
  }) => {
    const resolvedPlugin = editor.plugins[plugin.key];

    if (!resolvedPlugin) {
      throw new Error(`[Plate] Plugin "${plugin.key}" is not installed.`);
    }

    return resolvedPlugin as T;
  };
  editor.getType = (pluginKey) =>
    editor.plugins[pluginKey]?.node?.type ?? pluginKey;
  editor.getPluginApi = (plugin) =>
    (editor.getPlugin(plugin).api ??
      (editor.api as Record<string, unknown>)[plugin.key] ??
      {}) as Record<string, unknown>;
  editor.getTransforms = () => getPlateRuntimeTransforms(editor);
  editor.getInjectProps = (plugin) => {
    const installedPlugin = editor.getPlugin(plugin);
    const nodeProps = {
      ...(asRuntimeInjectNodeProps(installedPlugin.inject?.nodeProps) ?? {}),
    };

    nodeProps.nodeKey = nodeProps.nodeKey ?? editor.getType(plugin.key);
    nodeProps.styleKey = nodeProps.styleKey ?? nodeProps.nodeKey;

    return nodeProps;
  };
  editor.getOptionsStore = (plugin) => editor.plugins[plugin.key]?.optionsStore;
  editor.getOptions = <T = Record<string, unknown>>(plugin: {
    key: string;
  }) => {
    const installedPlugin = editor.getPlugin(plugin);
    const store = installedPlugin.optionsStore as
      | { get: (key: 'state') => Record<string, unknown> }
      | undefined;

    return (store?.get('state') ?? installedPlugin.options ?? {}) as T;
  };
  editor.getOption = <T = unknown>(
    plugin: { key: string },
    key: string,
    ...args: unknown[]
  ) => {
    const store = editor.getOptionsStore(plugin) as
      | { get: (key: string, ...args: unknown[]) => unknown }
      | undefined;

    if (store) {
      return store.get(key, ...args) as T;
    }

    return (editor.getOptions(plugin) as Record<string, unknown>)[key] as T;
  };
  editor.setOption = (plugin, key, value) => {
    const store = editor.getOptionsStore(plugin) as
      | { set: (key: string, value: unknown) => void }
      | undefined;

    store?.set(key, value);
  };
  editor.setOptions = (plugin, nextOptions) => {
    const store = editor.getOptionsStore(plugin) as
      | {
          set: (
            key: 'state',
            value:
              | ((state: Record<string, unknown>) => void)
              | Record<string, unknown>
          ) => void;
        }
      | undefined;

    if (!store) return;

    if (typeof nextOptions === 'function') {
      store.set('state', nextOptions);
      return;
    }

    store.set('state', (state) => {
      Object.assign(state, nextOptions);
    });
  };

  if (plugins.length > 0) {
    const resolvedPlugins = applyRuntimePluginOverrides(
      sortRuntimePlugins(flattenRuntimePlugins(editor, plugins))
    );

    applyRuntimePluginMetadata(editor, resolvedPlugins, optionsStoreFactory);
    pipeRuntimeTransformInitialValue(editor);
  }

  return editor;
};

export const PlateRuntimeSlate = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>({
  children,
  editor,
  onChange: propsOnChange,
  readOnly = editor.dom.readOnly,
  ...props
}: PlateRuntimeSlateProps<V, TExtensions>): ReactElement => {
  const onChange = pipeRuntimeChangeHandler(editor, propsOnChange);
  let content: ReactElement = createElement(Slate<V, TExtensions>, {
    ...props,
    ...(onChange ? { onChange } : {}),
    children,
    editor,
    readOnly,
  });

  editor.meta.pluginCache.render.aboveSlate.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    const AboveSlate = getRuntimeReactComponent<{ children?: ReactNode }>(
      key,
      'render.aboveSlate',
      plugin.render?.aboveSlate
    );

    content = createElement(AboveSlate, {}, content);
  });

  return createElement(
    PlateStoreProvider<PlateRuntimeEditor<V, TExtensions>>,
    {
      editor,
      readOnly,
      scope: editor.id,
    },
    content
  );
};

export const PlateRuntimeEditable = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
  T = unknown,
  TElement extends SlateElement = SlateElement,
>({
  editor,
  readOnly = editor.dom.readOnly,
  renderEditable,
  ...props
}: PlateRuntimeEditableProps<V, TExtensions, T, TElement>): ReactElement => {
  const editableRef = useRef<HTMLDivElement | null>(null);
  const onKeyDown = pipeRuntimeKeyDownHandler(
    editor,
    props.onKeyDown as
      | ((event: ReactKeyboardEvent) => boolean | void)
      | undefined
  );
  const renderElement = pipeRuntimeRenderElement(
    editor,
    props.renderElement as
      | ((props: PlateRuntimeRenderElementProps<TElement>) => ReactNode)
      | undefined
  );
  const decorate = pipeRuntimeDecorate(
    editor,
    props.decorate as PlateRuntimeDecorate<T> | undefined
  );
  const editableProps: EditableProps<T, TElement> = {
    ...props,
    ...(decorate ? { decorate } : {}),
    ...(onKeyDown ? { onKeyDown } : {}),
    ...(renderElement ? { renderElement } : {}),
    readOnly,
  };
  const editablePropsWithRef = {
    ...editableProps,
    ref: editableRef,
  } as EditableProps<T, TElement> & {
    ref: Ref<HTMLDivElement>;
  };
  const siblingProps: PlateRuntimeEditableSiblingProps<
    V,
    TExtensions,
    T,
    TElement
  > = {
    ...editableProps,
    editor,
  };
  const editable = createElement(Editable<T, TElement>, editablePropsWithRef);
  const pluginHookElements = editor.meta.pluginCache.useHooks.map((key) =>
    createElement(PlateRuntimePluginHooks<V, TExtensions>, {
      editor,
      key,
      plugin: editor.getPlugin({ key }),
    })
  );

  let beforeEditable: ReactNode = null;
  let afterEditable: ReactNode = null;
  let aboveEditable: ReactNode = createElement(
    Fragment,
    {},
    renderEditable ? renderEditable(editable) : editable,
    createElement(EditorHotkeysEffect, {
      editableRef,
      id: editor.id,
      key: 'hotkeys',
    }),
    pluginHookElements
  );

  editor.meta.pluginCache.render.beforeEditable.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    const BeforeEditable = getRuntimeReactComponent<
      PlateRuntimeEditableSiblingProps<V, TExtensions, T, TElement>
    >(key, 'render.beforeEditable', plugin.render?.beforeEditable);

    beforeEditable = createElement(
      Fragment,
      {},
      beforeEditable,
      createElement(BeforeEditable, siblingProps)
    );
  });

  editor.meta.pluginCache.render.afterEditable.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    const AfterEditable = getRuntimeReactComponent<
      PlateRuntimeEditableSiblingProps<V, TExtensions, T, TElement>
    >(key, 'render.afterEditable', plugin.render?.afterEditable);

    afterEditable = createElement(
      Fragment,
      {},
      afterEditable,
      createElement(AfterEditable, siblingProps)
    );
  });

  editor.meta.pluginCache.render.aboveEditable.forEach((key) => {
    const plugin = editor.getPlugin({ key });
    const AboveEditable = getRuntimeReactComponent<{ children?: ReactNode }>(
      key,
      'render.aboveEditable',
      plugin.render?.aboveEditable
    );

    aboveEditable = createElement(AboveEditable, {}, aboveEditable);
  });

  return createElement(
    Fragment,
    {},
    beforeEditable,
    aboveEditable,
    afterEditable
  );
};

export const PlateRuntimeContent = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
  T = unknown,
  TElement extends SlateElement = SlateElement,
>({
  editableProps,
  editor,
  readOnly = editor.dom.readOnly,
  ...slateProps
}: PlateRuntimeContentProps<V, TExtensions, T, TElement>): ReactElement =>
  createElement(
    PlateRuntimeSlate<V, TExtensions>,
    {
      ...slateProps,
      editor,
      readOnly,
    },
    createElement(PlateRuntimeEditable<V, TExtensions, T, TElement>, {
      ...editableProps,
      editor,
      readOnly,
    })
  );
