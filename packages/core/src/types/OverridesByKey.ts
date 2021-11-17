import { PlatePlugin } from './plugins/PlatePlugin';
import { PluginKey } from './plugins/PlatePluginKey';

export type OverridesByKey<T = {}, P = {}> = Record<
  PluginKey,
  Partial<PlatePlugin<T>>
>;
