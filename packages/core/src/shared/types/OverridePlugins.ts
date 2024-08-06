import type { AnyPlatePlugin } from './plugin/PlatePlugin';
import type { PluginKey } from './plugin/PlatePluginKey';

export type OverridePlugins = Record<PluginKey, Partial<AnyPlatePlugin>>;
