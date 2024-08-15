import type { PluginContext } from '../plugin';
import type { HotkeyPluginOptions } from './HotkeyPluginOptions';

export type ToggleMarkContext = PluginContext<
  {
    /** Node properties to delete. */
    clear?: string | string[];
  } & HotkeyPluginOptions
>;
