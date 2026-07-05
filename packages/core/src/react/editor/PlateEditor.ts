import type { Value } from '@platejs/plite';

import type {
  AnyPluginConfig,
  BaseEditor,
  InferKey,
  PluginConfig,
  WithRequiredKey,
} from '../../lib';
import type { PlatePlugin, Shortcuts } from '../plugin/PlatePlugin';

type PlateGetPlugin<V extends Value, P extends AnyPluginConfig> = BaseEditor<
  V,
  P
>['getPlugin'] &
  (<C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ) => C extends { node: any } ? C : PlatePlugin<C>);

export type PlateEditor<
  V extends Value = any,
  P extends AnyPluginConfig = AnyPluginConfig,
> = Omit<BaseEditor<V, P>, 'getPlugin' | 'runtime'> & {
  getPlugin: PlateGetPlugin<V, P>;
  runtime: BaseEditor<V, P>['runtime'] & {
    shortcuts: Shortcuts;
  };
};

export type KeyofPlugins<T extends AnyPluginConfig> =
  | (string & {})
  | InferKey<T>;
