import type { Value } from '@platejs/plite';
import type { TStateApi } from 'zustand-x';

import type {
  AnyPluginConfig,
  InferKey,
  InferOptions,
  InferSelectors,
  NodeComponents,
  PluginConfig,
  WithRequiredKey,
} from '../plugin/SlatePlugin';
import type {
  AnyBasePlugin,
  BasePlugin,
  BasePluginContext,
  EditorShortcut,
  InjectNodeProps,
  InferConfig,
} from '../plugin/BasePlugin';
import type { BaseParagraphPlugin, CorePluginConfig } from '../plugins';
import type { ResolvedInputRulesMeta } from '../plugins/input-rules/types';
import type {
  BasePluginInput as RuntimeBasePluginInput,
  InferPluginConfig as RuntimeInferPluginConfig,
  IsBroadPluginConfig,
  PliteEditorWithPlatePlugins,
} from './pluginRuntimeTypes';

export type {
  BasePluginInput,
  InferPluginConfig,
  InferPlugins,
} from './pluginRuntimeTypes';

type PlatePluginCache = {
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

type PlateEditorRuntime = {
  runtime: {
    /** A record of plugin components. */
    components: NodeComponents;
    /**
     * Current user ID for collaborative features (e.g., Yjs). Used to identify
     * the creator of elements like combobox inputs.
     */
    userId?: string | null;
    /** Whether the editor is a fallback editor. */
    isFallback: boolean;
    /** Whether initial value transformation is currently running. */
    isNormalizing?: boolean;
    /** Plugin cache by feature. */
    pluginCache: PlatePluginCache;
    /** All plugins. */
    pluginList: AnyBasePlugin[];
    /** Input rule registry built from plugins. */
    inputRules: ResolvedInputRulesMeta;
    /** Keyboard shortcut registry built from plugins. */
    shortcuts: Record<string, EditorShortcut | null | undefined>;
  };
};

type PlatePluginRuntime<P extends AnyPluginConfig = AnyPluginConfig> = {
  plugins: BaseEditorPlugins<P>;
  plugin: GetBasePluginContext;
  getInjectProps: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => InjectNodeProps<C>;
  getOptionsStore: <C extends AnyPluginConfig>(
    plugin: WithRequiredKey<C>
  ) => TStateApi<
    InferOptions<C>,
    [['zustand/mutative-x', never]],
    {},
    InferSelectors<C>
  >;
  getPlugin: GetBasePlugin;
  getType: (pluginKey: string) => string;
};

type GetBasePlugin = {
  <P extends BasePlugin<AnyPluginConfig>>(plugin: P): P;
  <PInput extends RuntimeBasePluginInput = PluginConfig>(
    plugin: WithRequiredKey<PInput>
  ): RuntimeInferPluginConfig<PInput> extends { node: unknown }
    ? RuntimeInferPluginConfig<PInput>
    : BasePlugin<RuntimeInferPluginConfig<PInput>>;
};

type PluginWithConfig = { readonly __config: AnyPluginConfig; key: string };

type GetBasePluginContext = {
  <P extends PluginWithConfig>(plugin: P): BasePluginContext<InferConfig<P>>;
  <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C> | C['key']
  ): BasePluginContext<C>;
};

export type KeyofPlugins<T extends AnyPluginConfig> =
  | (string & {})
  | InferKey<CorePluginConfig | T>;

export type KeyofNodePlugins<T extends AnyPluginConfig> =
  | (string & {})
  | InferKey<T | typeof BaseParagraphPlugin>;

type PluginConfigWithKey<
  P extends AnyPluginConfig,
  K extends PropertyKey,
> = P extends { key: K } ? P : never;

type PluginByKey<P extends AnyPluginConfig, K extends PropertyKey> = [
  PluginConfigWithKey<P, K>,
] extends [never]
  ? AnyBasePlugin
  : BasePlugin<PluginConfigWithKey<P, K>>;

type NonCorePluginConfig<P extends AnyPluginConfig> = P extends CorePluginConfig
  ? never
  : P;

type TypedBaseEditorPlugins<P extends AnyPluginConfig> = [
  NonCorePluginConfig<P>,
] extends [never]
  ? {}
  : {
      [K in InferKey<NonCorePluginConfig<P>>]: PluginByKey<
        NonCorePluginConfig<P>,
        K
      >;
    };

type BaseEditorPlugins<P extends AnyPluginConfig> =
  IsBroadPluginConfig<P> extends true
    ? Record<string, AnyBasePlugin>
    : Record<string, AnyBasePlugin> & TypedBaseEditorPlugins<P>;

export type BaseEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = AnyPluginConfig,
> = PliteEditorWithPlatePlugins<V, P> &
  PlateEditorRuntime &
  PlatePluginRuntime<P>;
