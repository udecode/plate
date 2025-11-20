import type {
  EditorApi,
  EditorBase,
  EditorTransforms,
  TRange,
  Value,
} from '@platejs/slate';
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
  InferTransforms,
  NodeComponents,
  PluginConfig,
  WithRequiredKey,
} from '../plugin/BasePlugin';
import type {
  AnyEditorPlugin,
  EditorPlugin,
  InjectNodeProps,
} from '../plugin/SlatePlugin';
import type { BaseParagraphPlugin, CorePlugin } from '../plugins';

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
    prevSelection: TRange | null;
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
        isText: string[];
        leafProps: string[];
        textProps: string[];
        /** Node types to plugin keys. */
        types: Record<string, string>;
      };
      normalizeInitialValue: string[];
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
  getPlugin: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => C extends { node: any } ? C : EditorPlugin<C>;
  getType: (pluginKey: string) => string;
  setOption: <C extends AnyPluginConfig, K extends keyof InferOptions<C>>(
    plugin: WithRequiredKey<C>,
    optionKey: K,
    value: InferOptions<C>[K]
  ) => void;
};

export type InferPlugins<T extends AnyPluginConfig[]> = T[number];

export type KeyofPlugins<T extends AnyPluginConfig> =
  | (string & {})
  | InferKey<CorePlugin | T>;

export type KeyofNodePlugins<T extends AnyPluginConfig> =
  | (string & {})
  | InferKey<T | typeof BaseParagraphPlugin>;

export type SlateEditor = BaseEditor & {
  api: EditorApi & UnionToIntersection<InferApi<CorePlugin>>;
  meta: BaseEditor['meta'] & {
    /** An array of plugins that are currently being used by the editor. */
    pluginList: AnyEditorPlugin[];
    shortcuts: any;
  };
  plugins: Record<string, AnyEditorPlugin>;
  // Alias for transforms
  tf: EditorTransforms & UnionToIntersection<InferTransforms<CorePlugin>>;
  transforms: EditorTransforms &
    UnionToIntersection<InferTransforms<CorePlugin>>;
  getApi: <C extends AnyPluginConfig = PluginConfig>(
    plugin?: WithRequiredKey<C>
  ) => SlateEditor['api'] & InferApi<C>;
  getPlugin: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => C extends { node: any } ? C : EditorPlugin<C>;
  getTransforms: <C extends AnyPluginConfig = PluginConfig>(
    plugin?: WithRequiredKey<C>
  ) => SlateEditor['tf'] & InferTransforms<C>;
};

export type TSlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
> = SlateEditor & {
  api: EditorApi<V> & UnionToIntersection<InferApi<CorePlugin | P>>;
  children: V;
  meta: BaseEditor['meta'] & {
    pluginList: P[];
    shortcuts: any;
  };
  plugins: { [K in P['key']]: Extract<P, { key: K }> };
  tf: EditorTransforms<V> &
    UnionToIntersection<InferTransforms<CorePlugin | P>>;
  transforms: EditorTransforms<V> &
    UnionToIntersection<InferTransforms<CorePlugin | P>>;
  getApi: <C extends AnyPluginConfig = PluginConfig>(
    plugin?: WithRequiredKey<C>
  ) => TSlateEditor<V>['api'] & InferApi<C>;
  getTransforms: <C extends AnyPluginConfig = PluginConfig>(
    plugin?: WithRequiredKey<C>
  ) => TSlateEditor<V>['tf'] & InferTransforms<C>;
};
