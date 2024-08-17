import type { TEditor, TRange, Value } from '@udecode/slate';
import type { UnionToIntersection } from '@udecode/utils';

import type {
  AnyPluginConfig,
  InferApi,
  InferOptions,
  InferTransforms,
  PluginConfig,
  WithRequiredKey,
} from '../plugin/BasePlugin';
import type { EditorPlugin, InjectProps } from '../plugin/SlatePlugin';
import type { CorePlugin } from '../plugins';

export type SlateEditor = {
  api: UnionToIntersection<InferApi<CorePlugin>>;

  getApi: <C extends AnyPluginConfig = PluginConfig>(
    plugin?: WithRequiredKey<C>
  ) => InferApi<C>;

  getInjectProps: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => InjectProps<C>;

  getOptions: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => InferOptions<C>;

  getPlugin: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => C extends EditorPlugin<any> ? C : EditorPlugin<C>;

  getType: (plugin: WithRequiredKey) => string;

  id: any;

  /**
   * Whether the editor is a fallback editor.
   *
   * @default false
   * @see {@link createPlateFallbackEditor}
   */
  isFallback: boolean;

  key: any;

  pluginList: any[];

  plugins: Record<string, any>;

  prevSelection: TRange | null;

  transforms: UnionToIntersection<InferTransforms<CorePlugin>>;
} & TEditor;

export type TBaseEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
> = {
  api: UnionToIntersection<InferApi<CorePlugin | P>>;
  children: V;

  pluginList: P[];

  plugins: { [K in P['key']]: Extract<P, { key: K }> };

  transforms: UnionToIntersection<InferTransforms<CorePlugin | P>>;
};

export type TSlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
> = SlateEditor & TBaseEditor<V, P>;

export type InferPlugins<T extends AnyPluginConfig[]> = T[number];
