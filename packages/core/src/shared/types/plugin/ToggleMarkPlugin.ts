import type { HotkeyPlugin } from './HotkeyPlugin';

export interface ToggleMarkPlugin extends HotkeyPlugin {
  /** Node properties to delete. */
  clear?: string | string[];
}
