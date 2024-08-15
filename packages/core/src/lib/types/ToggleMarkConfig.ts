import type { PluginConfig } from '../plugin/types/PlatePlugin';
import type { HotkeyPluginOptions } from './HotkeyPluginOptions';

export type ToggleMarkConfig = PluginConfig<
  any,
  {
    /** Node properties to delete. */
    clear?: string | string[];
  } & HotkeyPluginOptions
>;
