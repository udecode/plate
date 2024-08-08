import type { HotkeyPluginOptions } from './HotkeyPluginOptions';

export interface ToggleMarkPluginOptions extends HotkeyPluginOptions {
  /** Node properties to delete. */
  clear?: string | string[];
}
