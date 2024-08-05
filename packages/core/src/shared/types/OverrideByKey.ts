import type { AnyPlatePlugin } from './plugin/PlatePlugin';
import type { PluginKey } from './plugin/PlatePluginKey';

export type OverrideByKey = Record<PluginKey, Partial<AnyPlatePlugin>>;
