import { Value } from '../slate/types/TEditor';
import { PlatePlugin } from './plugins/PlatePlugin';
import { PluginKey } from './plugins/PlatePluginKey';

export type OverrideByKey<V extends Value, T = {}> = Record<
  PluginKey,
  Partial<PlatePlugin<V, T>>
>;
