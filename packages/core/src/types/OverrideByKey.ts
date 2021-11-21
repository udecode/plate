import { PlatePlugin } from './plugins/PlatePlugin';
import { PluginKey } from './plugins/PlatePluginKey';

export type OverrideByKey<T = {}> = Record<PluginKey, Partial<PlatePlugin<T>>>;
