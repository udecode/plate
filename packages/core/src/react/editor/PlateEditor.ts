import type {
  DescendantIn,
  EditorApi,
  EditorTransforms,
  Operation,
  Value,
} from '@platejs/slate';
import type { UnionToIntersection } from '@udecode/utils';

import type {
  AnyPluginConfig,
  BaseEditor,
  InferApi,
  InferKey,
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

export type PlateEditor = BaseEditor & {
  api: EditorApi & UnionToIntersection<InferApi<PlateCorePlugin>>;
  meta: BaseEditor['meta'] & {
    pluginList: AnyEditorPlatePlugin[];
    shortcuts: Shortcuts;
  };
  plugins: Record<string, AnyEditorPlatePlugin>;
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
};

type FilterKeys<T, K extends keyof T> = {
  [P in keyof T as Exclude<P, K>]: T[P];
};

export type TPlateEditor<
  V extends Value = Value,
  P extends AnyPluginConfig = PlateCorePlugin,
> = FilterKeys<PlateEditor, 'children' | 'operations'> & {
  api: EditorApi<V> & UnionToIntersection<InferApi<P | PlateCorePlugin>>;
  children: V;
  meta: BaseEditor['meta'] & {
    pluginList: P[];
    shortcuts: Shortcuts;
  };
  operations: Operation<DescendantIn<V>>[];
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

export type KeyofPlugins<T extends AnyPluginConfig> =
  | (string & {})
  | InferKey<PlateCorePlugin | T>;
