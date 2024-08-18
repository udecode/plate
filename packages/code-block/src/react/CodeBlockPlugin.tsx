import type { ExtendConfig, HotkeyPluginOptions } from '@udecode/plate-common';

import { extendPlatePlugin } from '@udecode/plate-common/react';

import {
  type CodeBlockConfig as BaseCodeBlockConfig,
  CodeBlockPlugin as BaseCodeBlockPlugin,
} from '../lib/CodeBlockPlugin';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';

export type CodeBlockConfig = ExtendConfig<
  BaseCodeBlockConfig,
  HotkeyPluginOptions
>;

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = extendPlatePlugin(BaseCodeBlockPlugin, {
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
  },
  options: {
    hotkey: ['mod+opt+8', 'mod+shift+8'],
  },
});
