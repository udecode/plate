import type {
  Ancestor,
  BaseEditor as PliteRuntimeBaseEditor,
  EditorUpdateContext,
  EditorUpdateOptions,
  EditorUpdateTransaction,
  Range,
  Selection,
  Value,
} from '@platejs/plite';
import type {
  CurrentRuntimeEditorApi as EditorApi,
  CurrentRuntimeEditorBase as EditorBase,
} from '../../internal/currentRuntimeBridge';
import type { UnionToIntersection } from '@udecode/utils';
import type { KeyboardEventLike } from 'is-hotkey';
import type { Draft } from 'mutative';
import type { TStateApi } from 'zustand-x';

import type {
  AnyPluginConfig,
  InferApi,
  InferKey,
  InferOptions,
  InferSelectors,
  InferTx,
  NodeComponents,
  PluginConfig,
  WithRequiredKey,
} from '../plugin/BasePlugin';
import type {
  AnyEditorPlugin,
  EditorPlugin,
  InjectNodeProps,
} from '../plugin/EditorPlugin';
import type {
  BaseParagraphPlugin,
  CorePlugin,
  CorePluginApi,
} from '../plugins';
import type { ResolvedInputRulesMeta } from '../plugins/input-rules/types';

export type EditorPluginInput = AnyPluginConfig | EditorPlugin<AnyPluginConfig>;

export type InferPluginConfig<P> =
  P extends EditorPlugin<infer C> ? C : P extends AnyPluginConfig ? P : never;

export type InferPlugins<T extends readonly unknown[]> = InferPluginConfig<
  T[number]
>;

type InferInstalledPluginTx<P> =
  P extends EditorPlugin<infer C> ? InferTx<C> : InferTx<P>;

export type BaseEditor = EditorBase & {
  /** DOM state */
  dom: {
    /** Whether the editor is composing text. */
    composing: boolean;
    /** The current keyboard event. */
    currentKeyboardEvent: KeyboardEventLike | null;
    /** Whether the editor is focused. */
    focused: boolean;
    /** The previous selection. */
    prevSelection: Range | null;
    /** Whether the editor is read-only. */
    readOnly: boolean;
  };
  meta: EditorBase['meta'] & {
    /**
     * A key that can be used to uniquely identify the editor. For RSC usage,
     * use `uid` instead.
     */
    key: any;
    /** A record of plugin components. */
    components: NodeComponents;
    /**
     * Current user ID for collaborative features (e.g., Yjs). Used to identify
     * the creator of elements like combobox inputs.
     */
    userId?: string | null;
    /** Whether the editor is a fallback editor. */
    isFallback: boolean;
    /** Plugin cache by feature. */
    pluginCache: {
      decorate: string[];
      handlers: {
        onChange: string[];
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
        /** Node types to plugin keys. */
        types: Record<string, string>;
      };
      transformInitialValue: string[];
      render: {
        aboveEditable: string[];
        aboveNodes: string[];
        abovePlite: string[];
        afterContainer: string[];
        afterEditable: string[];
        beforeContainer: string[];
        beforeEditable: string[];
        belowNodes: string[];
        belowRootNodes: string[];
      };
      rules: { match: string[] };
      useHooks: string[];
    };
    /** All plugins. */
    pluginList: any[];
    /**
     * A stable unique identifier that remains constant from Plate RSC to client
     * hydration.
     */
    uid?: string;
  };
  plugins: Record<string, any>;
  setOptions: <C extends AnyPluginConfig>(
    plugin: WithRequiredKey<C>,
    options:
      | ((state: Draft<Partial<InferOptions<C>>>) => void)
      | Partial<InferOptions<C>>
  ) => void;
  getInjectProps: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => InjectNodeProps<C>;
  getApi: PliteRuntimeBaseEditor['getApi'];
  getOption: <
    C extends AnyPluginConfig,
    StateType extends InferOptions<C>,
    TSelectors extends InferSelectors<C>,
    K extends keyof StateType | keyof TSelectors | 'state',
  >(
    plugin: WithRequiredKey<C>,
    key: K,
    ...args: K extends keyof TSelectors ? Parameters<TSelectors[K]> : []
  ) => K extends 'state'
    ? StateType
    : K extends keyof TSelectors
      ? ReturnType<TSelectors[K]>
      : K extends keyof StateType
        ? StateType[K]
        : never;
  getOptions: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => InferOptions<C>;
  getOptionsStore: <C extends AnyPluginConfig>(
    plugin: WithRequiredKey<C>
  ) => TStateApi<
    InferOptions<C>,
    [['zustand/mutative-x', never]],
    {},
    InferSelectors<C>
  >;
  getPlugin: <PInput extends EditorPluginInput = PluginConfig>(
    plugin: WithRequiredKey<PInput>
  ) => InferPluginConfig<PInput> extends { node: any }
    ? InferPluginConfig<PInput>
    : EditorPlugin<InferPluginConfig<PInput>>;
  read: PliteRuntimeBaseEditor['read'];
  subscribe: PliteRuntimeBaseEditor['subscribe'];
  subscribeCommit: PliteRuntimeBaseEditor['subscribeCommit'];
  getType: (pluginKey: string) => string;
  getChunkSize?: (ancestor: Ancestor) => number | null;
  setOption: <C extends AnyPluginConfig, K extends keyof InferOptions<C>>(
    plugin: WithRequiredKey<C>,
    optionKey: K,
    value: InferOptions<C>[K]
  ) => void;
  update: <TTx extends object = {}>(
    fn: (
      transaction: EditorUpdateTransaction & TTx,
      context: EditorUpdateContext
    ) => void,
    options?: EditorUpdateOptions
  ) => void;
  extend: PliteRuntimeBaseEditor['extend'];
};

export type KeyofPlugins<T extends AnyPluginConfig> =
  | (string & {})
  | InferKey<CorePlugin | T>;

export type KeyofNodePlugins<T extends AnyPluginConfig> =
  | (string & {})
  | InferKey<T | typeof BaseParagraphPlugin>;

export type BasePlateEditor = BaseEditor & {
  api: EditorApi & CorePluginApi;
  meta: BaseEditor['meta'] & {
    /** An array of plugins that are currently being used by the editor. */
    pluginList: AnyEditorPlugin[];
    inputRules: ResolvedInputRulesMeta;
    shortcuts: any;
  };
  plugins: Record<string, AnyEditorPlugin>;
  getPlugin: <PInput extends EditorPluginInput = PluginConfig>(
    plugin: WithRequiredKey<PInput>
  ) => InferPluginConfig<PInput> extends { node: any }
    ? InferPluginConfig<PInput>
    : EditorPlugin<InferPluginConfig<PInput>>;
};

type TBasePlateEditorBase<V extends Value> = Pick<
  EditorBase<V>,
  'history' | 'id' | 'marks' | 'normalizeNode' | 'operations' | 'redo' | 'undo'
> &
  Pick<
    BaseEditor,
    | 'dom'
    | 'extend'
    | 'getApi'
    | 'getChunkSize'
    | 'getInjectProps'
    | 'getOption'
    | 'getOptions'
    | 'getOptionsStore'
    | 'read'
    | 'setOption'
    | 'setOptions'
    | 'subscribe'
    | 'subscribeCommit'
  >;

type TBasePlateEditorPlugins<P extends AnyPluginConfig> = Record<
  string,
  AnyEditorPlugin
> & {
  [K in P['key']]: EditorPlugin<Extract<P, { key: K }>>;
};

export type TBasePlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
> = TBasePlateEditorBase<V> & {
  api: EditorApi<V> & CorePluginApi & UnionToIntersection<InferApi<P>>;
  children: V;
  getType: (pluginKey: string) => string;
  meta: BaseEditor['meta'] & {
    inputRules: ResolvedInputRulesMeta;
    pluginList: AnyEditorPlugin[];
    shortcuts: any;
  };
  plugins: TBasePlateEditorPlugins<P>;
  selection: Selection;
  getPlugin: <PInput extends EditorPluginInput = PluginConfig>(
    plugin: WithRequiredKey<PInput>
  ) => InferPluginConfig<PInput> extends { node: any }
    ? InferPluginConfig<PInput>
    : EditorPlugin<InferPluginConfig<PInput>>;
  update: <TTx extends object = {}>(
    fn: (
      transaction: EditorUpdateTransaction<V> &
        UnionToIntersection<InferInstalledPluginTx<CorePlugin | P>> &
        TTx,
      context: EditorUpdateContext
    ) => void,
    options?: EditorUpdateOptions
  ) => void;
};
