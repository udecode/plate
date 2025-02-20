import type { Modify } from '@udecode/utils';

import type { PlateEditor } from '../editor/PlateEditor';
import type { PlatePlugin, PlatePluginMethods } from './PlatePlugin';

import {
  type AnyPluginConfig,
  type PluginConfig,
  createSlatePlugin,
} from '../../lib';
import { toPlatePlugin } from './toPlatePlugin';

type PlatePluginConfig<
  K extends string = any,
  O = {},
  A = {},
  T = {},
  S = {},
> = Omit<
  Partial<
    Modify<
      PlatePlugin<PluginConfig<K, O, A, T, S>>,
      {
        node: Partial<PlatePlugin<PluginConfig<K, O, A, T, S>>['node']>;
      }
    >
  >,
  keyof PlatePluginMethods | 'optionsStore' | 'useOptionsStore'
>;

type TPlatePluginConfig<C extends AnyPluginConfig = PluginConfig> = Omit<
  Partial<
    Modify<
      PlatePlugin<C>,
      {
        node: Partial<PlatePlugin<C>['node']>;
      }
    >
  >,
  keyof PlatePluginMethods | 'optionsStore' | 'useOptionsStore'
>;

export const createPlatePlugin = <
  K extends string = any,
  O = {},
  A = {},
  T = {},
  S = {},
>(
  config:
    | ((editor: PlateEditor) => PlatePluginConfig<K, O, A, T, S>)
    | PlatePluginConfig<K, O, A, T, S> = {}
): PlatePlugin<PluginConfig<K, O, A, T, S>> => {
  const plugin = createSlatePlugin(config as any);

  return toPlatePlugin(plugin as any) as any;
};

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
    | ((editor: PlateEditor) => TPlatePluginConfig<C>)
    | TPlatePluginConfig<C> = {}
): PlatePlugin<C> {
  return createPlatePlugin(config as any) as any;
}
