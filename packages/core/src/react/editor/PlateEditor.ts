import type { EditorApi, EditorTransforms, Value } from '@udecode/slate';
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
  Shortcuts,
} from '../plugin/PlatePlugin';
import type { PlateCorePlugin } from './withPlate';

export type PlateEditor = {
  api: EditorApi & UnionToIntersection<InferApi<PlateCorePlugin>>;
  pluginList: AnyEditorPlatePlugin[];
  plugins: Record<string, AnyEditorPlatePlugin>;
  shortcuts: Shortcuts;
  // Alias for transforms
  tf: EditorTransforms & UnionToIntersection<InferTransforms<PlateCorePlugin>>;
  transforms: EditorTransforms &
    UnionToIntersection<InferTransforms<PlateCorePlugin>>;
  getApi: <C extends AnyPluginConfig = PluginConfig>(
    plugin?: WithRequiredKey<C>
  ) => PlateEditor['api'] & InferApi<C>;
  getPlugin: <C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => C extends { node: any } ? C : EditorPlatePlugin<C>;
  getTransforms: <C extends AnyPluginConfig = PluginConfig>(
    plugin?: WithRequiredKey<C>
  ) => PlateEditor['tf'] & InferTransforms<C>;
  uid?: string;
} & BaseEditor;

export type TPlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
> = PlateEditor & {
  api: EditorApi<V> & UnionToIntersection<InferApi<P | PlateCorePlugin>>;
  children: V;
  pluginList: P[];
  plugins: { [K in P['key']]: Extract<P, { key: K }> };
  tf: EditorTransforms<V> &
    UnionToIntersection<InferTransforms<P | PlateCorePlugin>>;
  transforms: EditorTransforms<V> &
    UnionToIntersection<InferTransforms<P | PlateCorePlugin>>;
  getApi: <C extends AnyPluginConfig = PluginConfig>(
    plugin?: WithRequiredKey<C>
  ) => TPlateEditor<V>['api'] & InferApi<C>;
  getTransforms: <C extends AnyPluginConfig = PluginConfig>(
    plugin?: WithRequiredKey<C>
  ) => TPlateEditor<V>['tf'] & InferTransforms<C>;
};
