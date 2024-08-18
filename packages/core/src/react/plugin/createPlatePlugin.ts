import type { PlateEditor } from '../editor/PlateEditor';
import type {
  PlatePlugin,
  PlatePluginComponent,
  PlatePluginMethods,
} from './PlatePlugin';

import {
  type AnyPluginConfig,
  type PluginConfig,
  createSlatePlugin,
} from '../../lib';

export function createPlatePlugin<
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
  const plugin = createSlatePlugin(config as any) as unknown as PlatePlugin<
    PluginConfig<K, O, A, T>
  >;

  plugin.withComponent = (component: PlatePluginComponent) => {
    return plugin.extend({ component }) as any;
  };

  return plugin;
}

/**
 * Explicitly typed version of `createPlatePlugin`.
 *
 * @remarks
 *   While `createPlatePlugin` uses type inference, this function requires an
 *   explicit type parameter. Use this when you need precise control over the
 *   plugin's type structure or when type inference doesn't provide the desired
 *   result.
 */
export function createTPlatePlugin<C extends AnyPluginConfig = PluginConfig>(
  config:
    | ((
        editor: PlateEditor
      ) => Omit<Partial<PlatePlugin<C>>, keyof PlatePluginMethods>)
    | Omit<Partial<PlatePlugin<C>>, keyof PlatePluginMethods> = {}
): PlatePlugin<C> {
  return createPlatePlugin(config as any) as any;
}
