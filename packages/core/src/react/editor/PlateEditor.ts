import type { Value } from '@udecode/slate';
import type { UnionToIntersection } from '@udecode/utils';

import type {
  AnyPluginConfig,
  BaseEditor,
  InferApi,
  InferTransforms,
  PluginConfig,
  WithRequiredKey,
} from '../../lib';
import type {
  AnyEditorPlatePlugin,
  EditorPlatePlugin,
  PlateShortcuts,
} from '../plugin/PlatePlugin';
import type { PlateCorePlugin } from './withPlate';

export type PlateEditor = {
  api: UnionToIntersection<InferApi<PlateCorePlugin>>;

  getPlugin: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => C extends { type: any } ? C : EditorPlatePlugin<C>;

  pluginList: AnyEditorPlatePlugin[];

  plugins: Record<string, AnyEditorPlatePlugin>;

  shortcuts: PlateShortcuts;

  // Alias for transforms
  tf: PlateEditor['transforms'];
  transforms: UnionToIntersection<InferTransforms<PlateCorePlugin>>;
} & BaseEditor;

export type TPlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
> = {
  api: UnionToIntersection<InferApi<P | PlateCorePlugin>>;
  children: V;
  pluginList: P[];
  plugins: { [K in P['key']]: Extract<P, { key: K }> };
  tf: UnionToIntersection<InferTransforms<P | PlateCorePlugin>>;
  transforms: UnionToIntersection<InferTransforms<P | PlateCorePlugin>>;
} & PlateEditor;
