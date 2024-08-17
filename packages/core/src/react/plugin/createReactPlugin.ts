import type { PlateEditor } from './PlateEditor';
import type { PlatePlugin, PlatePluginMethods } from './PlatePlugin';

import {
  type AnyPluginConfig,
  type PluginConfig,
  createPlugin,
} from '../../lib';

export function createReactPlugin<
  K extends string = any,
  O = {},
  A = {},
  T = {},
>(
  config:
    | ((
        editor: PlateEditor
      ) => Omit<
        Partial<PlatePlugin<PluginConfig<K, O, A, T>>>,
        keyof PlatePluginMethods
      >)
    | Omit<
        Partial<PlatePlugin<PluginConfig<K, O, A, T>>>,
        keyof PlatePluginMethods
      > = {}
) {
  return createPlugin(config as any) as unknown as PlatePlugin<
    PluginConfig<K, O, A, T>
  >;
}

/**
 * Explicitly typed version of `createReactPlugin`.
 *
 * @remarks
 *   While `createReactPlugin` uses type inference, this function requires an
 *   explicit type parameter. Use this when you need precise control over the
 *   plugin's type structure or when type inference doesn't provide the desired
 *   result.
 */
export function createTReactPlugin<C extends AnyPluginConfig = PluginConfig>(
  config:
    | ((
        editor: PlateEditor
      ) => Omit<Partial<PlatePlugin<C>>, keyof PlatePluginMethods>)
    | Omit<Partial<PlatePlugin<C>>, keyof PlatePluginMethods> = {}
): PlatePlugin<C> {
  return createPlugin(config as any) as any;
}
