import type { Modify } from '@udecode/utils';

import type { PlateEditor } from '../editor/PlateEditor';
import type { PlatePlugin, PlatePluginMethods } from './PlatePlugin';

import {
  type AnyPluginConfig,
  type AnyPluginTx,
  type PluginConfig,
  createBasePlugin,
} from '../../lib';
import { toPlatePlugin } from './toPlatePlugin';

type PlatePluginConfig<
  K extends string = any,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  D extends readonly unknown[] = readonly [],
> = Omit<
  Partial<
    Modify<
      PlatePlugin<PluginConfig<K, O, A, Tx, S, {}, D>>,
      {
        node: Partial<PlatePlugin<PluginConfig<K, O, A, Tx, S, {}, D>>['node']>;
      }
    >
  >,
  keyof PlatePluginMethods | 'optionsStore' | 'useOptionsStore'
>;

type CreatePlatePluginConfig<C extends AnyPluginConfig = PluginConfig> = Omit<
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

type NoInferConfig<T> = [T][T extends any ? 0 : never];

type ExplicitTypedPlatePluginConfig<C extends AnyPluginConfig> = [C] extends [
  never,
]
  ? never
  : CreatePlatePluginConfig<NoInferConfig<C>>;

export function createPlatePlugin<C extends AnyPluginConfig = never>(
  config:
    | ((editor: PlateEditor) => ExplicitTypedPlatePluginConfig<C>)
    | ExplicitTypedPlatePluginConfig<C>
): PlatePlugin<C>;

export function createPlatePlugin<
  K extends string = any,
  O = {},
  A = {},
  Tx extends AnyPluginTx = {},
  S = {},
  const D extends readonly unknown[] = readonly [],
>(
  config?:
    | ((editor: PlateEditor) => PlatePluginConfig<K, O, A, Tx, S, D>)
    | PlatePluginConfig<K, O, A, Tx, S, D>
): PlatePlugin<PluginConfig<K, O, A, Tx, S, {}, D>>;

export function createPlatePlugin<C extends AnyPluginConfig = PluginConfig>(
  config?:
    | ((editor: PlateEditor) => CreatePlatePluginConfig<C>)
    | CreatePlatePluginConfig<C>
): PlatePlugin<C>;

export function createPlatePlugin(config: any = {}): PlatePlugin<any> {
  const plugin = createBasePlugin(config as any);

  return toPlatePlugin(plugin as any) as any;
}
