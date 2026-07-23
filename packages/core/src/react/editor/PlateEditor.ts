import type { Value } from '@platejs/plite';

import type {
  AnyPluginConfig,
  BaseEditor,
  InferKey,
  PluginConfig,
  WithRequiredKey,
} from '../../lib';
import type { PlatePlugin } from '../plugin/PlatePlugin';

type PlateGetPlugin<V extends Value, P extends AnyPluginConfig> = BaseEditor<
  V,
  P
>['getPlugin'] &
  (<C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => C extends { clone: any } ? C : PlatePlugin<C>);

export type PlateEditor<
  V extends Value = any,
  P extends AnyPluginConfig = AnyPluginConfig,
> = Omit<BaseEditor<V, P>, 'getPlugin'> & {
  getPlugin: PlateGetPlugin<V, P>;
};

export type KeyofPlugins<T extends AnyPluginConfig> =
  | (string & {})
  | InferKey<T>;
