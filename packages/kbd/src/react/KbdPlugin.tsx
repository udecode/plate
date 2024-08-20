import type { HotkeyPluginOptions, PluginConfig } from '@udecode/plate-common';

import {
  onKeyDownToggleMark,
  toPlatePlugin,
} from '@udecode/plate-common/react';

import { KbdPlugin as BaseKbdPlugin } from '../lib/KbdPlugin';

export type KbdConfig = PluginConfig<'kbd', HotkeyPluginOptions>;

/** Enables support for code formatting with React-specific features */
export const KbdPlugin = toPlatePlugin<KbdConfig>(BaseKbdPlugin, {
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
});
