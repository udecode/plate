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
import type {
  AnyEditorPlugin,
  EditorPlugin,
  InjectProps,
} from '../plugin/SlatePlugin';
import type { CorePlugin } from '../plugins';

export type BaseEditor = {
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
  ) => C extends { type: any } ? C : EditorPlugin<C>;

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
} & TEditor;

export type SlateEditor = {
  api: UnionToIntersection<InferApi<CorePlugin>>;
  pluginList: AnyEditorPlugin[];

  plugins: Record<string, AnyEditorPlugin>;

  transforms: UnionToIntersection<InferTransforms<CorePlugin>>;
} & BaseEditor;

export type TSlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
> = {
  api: UnionToIntersection<InferApi<CorePlugin | P>>;
  children: V;
  pluginList: P[];
  plugins: { [K in P['key']]: Extract<P, { key: K }> };
  transforms: UnionToIntersection<InferTransforms<CorePlugin | P>>;
} & SlateEditor;

export type InferPlugins<T extends AnyPluginConfig[]> = T[number];
