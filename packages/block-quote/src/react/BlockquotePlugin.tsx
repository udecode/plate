import type { HotkeyPluginOptions, InferConfig } from '@udecode/plate-common';

import {
  onKeyDownToggleElement,
  toPlatePlugin,
} from '@udecode/plate-common/react';

import { BlockquotePlugin as BaseBlockquotePlugin } from '../lib/BlockquotePlugin';

export const BlockquotePlugin = toPlatePlugin<
  InferConfig<typeof BaseBlockquotePlugin>,
  HotkeyPluginOptions
>(BaseBlockquotePlugin, {
  handlers: {
    onKeyDown: onKeyDownToggleElement,
  },
  options: {
    hotkey: 'mod+shift+.',
  },
});
