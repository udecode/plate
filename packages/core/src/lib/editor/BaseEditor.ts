import type { Value } from '@platejs/plite';

import type {
  AnyPluginConfig,
  InferKey,
  PluginConfig,
  WithRequiredKey,
} from '../plugin/PluginConfig';
import type {
  AnyBasePlugin,
  BasePlugin,
  BasePluginContext,
  InjectNodeProps,
  InferConfig,
} from '../plugin/BasePlugin';
import type { BaseParagraphPlugin, CorePluginConfig } from '../plugins';
import type {
  BasePluginInput as RuntimeBasePluginInput,
  InferPluginConfig as RuntimeInferPluginConfig,
  PliteEditorWithPlatePlugins,
} from './pluginRuntimeTypes';

export type {
  BasePluginInput,
  InferPluginConfig,
  InferPlugins,
} from './pluginRuntimeTypes';

export type PlateSchemaIdentity = Readonly<{
  id: string;
  version: number;
}>;

type PlateEditorRuntime = {
  runtime: {
    /**
     * Current user ID for collaborative features (e.g., Yjs). Used to identify
     * the creator of elements like combobox inputs.
     */
    userId?: string | null;
    /** Whether initial value transformation is currently running. */
    isNormalizing?: boolean;
  };
};

type PlatePluginRuntime = {
  plugin: GetBasePluginContext;
  getInjectProps: GetInjectProps;
  getPlugin: GetBasePlugin;
  getType: (pluginKey: string) => string;
};

type GetBasePlugin = {
  <P extends AnyBasePlugin>(plugin: P): P;
  <PInput extends RuntimeBasePluginInput = PluginConfig>(
    plugin: WithRequiredKey<PInput>
  ): RuntimeInferPluginConfig<PInput> extends { clone: unknown }
    ? RuntimeInferPluginConfig<PInput>
    : BasePlugin<RuntimeInferPluginConfig<PInput>>;
};

type PluginWithConfig = { readonly __config: AnyPluginConfig; key: string };

type GetInjectProps = {
  <P extends PluginWithConfig>(plugin: P): InjectNodeProps<InferConfig<P>>;
  <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ): InjectNodeProps<C>;
};

type GetBasePluginContext = {
  <P extends PluginWithConfig>(plugin: P): BasePluginContext<InferConfig<P>>;
  <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ): BasePluginContext<C>;
};

export type KeyofPlugins<T extends AnyPluginConfig> =
  | (string & {})
  | InferKey<CorePluginConfig | T>;

export type KeyofNodePlugins<T extends AnyPluginConfig> =
  | (string & {})
  | InferKey<T | typeof BaseParagraphPlugin>;

export type BaseEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = AnyPluginConfig,
> = PliteEditorWithPlatePlugins<V, P> & PlateEditorRuntime & PlatePluginRuntime;
