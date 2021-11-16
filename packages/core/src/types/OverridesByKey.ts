import { PlatePlugin } from './plugins/PlatePlugin/PlatePlugin';
import { PluginKey } from './plugins/PlatePlugin/PlatePluginKey';

export type OverridesByKey<T = {}, P = {}> = Record<
  PluginKey,
  Partial<PlatePlugin<T>>
>;
