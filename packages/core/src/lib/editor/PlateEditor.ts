import type React from 'react';

import type { TEditor, THistoryEditor, TRange, Value } from '@udecode/slate';
import type { TReactEditor } from '@udecode/slate-react';
import type { UnionToIntersection } from '@udecode/utils';

import type {
  AnyEditorPlugin,
  AnyPluginConfig,
  EditorPlugin,
  InjectProps,
  PluginConfig,
  WithRequiredKey,
} from '../plugin/types/PlatePlugin';
import type {
  InferApi,
  InferOptions,
  InferTransforms,
} from '../plugin/types/infer-types';
import type { CorePlugin } from '../plugins';

export type PlateEditor = {
  api: UnionToIntersection<InferApi<CorePlugin>>;
  currentKeyboardEvent: React.KeyboardEvent | null;

  id: any;

  /**
   * Whether the editor is a fallback editor.
   *
   * @default false
   * @see {@link createPlateFallbackEditor}
   */
  isFallback: boolean;

  key: any;

  pluginList: AnyEditorPlugin[];

  plugins: Record<string, AnyEditorPlugin>;

  prevSelection: TRange | null;

  transforms: UnionToIntersection<InferTransforms<CorePlugin>>;
} & PlateEditorMethods &
  TEditor &
  THistoryEditor &
  TReactEditor;

export type PlateEditorMethods = {
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
  ) => EditorPlugin<C>;

  getType: (plugin: WithRequiredKey) => string;
};

export type TPlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = CorePlugin,
> = {
  api: UnionToIntersection<InferApi<CorePlugin | P>>;
  children: V;

  pluginList: P[];

  plugins: { [K in P['key']]: Extract<P, { key: K }> };

  transforms: UnionToIntersection<InferTransforms<CorePlugin | P>>;
} & PlateEditor;

export type InferPlugins<T extends AnyPluginConfig[]> = T[number];
