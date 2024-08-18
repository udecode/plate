import type { HotkeyPluginOptions } from '@udecode/plate-common';

import { extendPlugin } from '@udecode/plate-common/react';

import {
  type CodeBlockConfig as BaseCodeBlockConfig,
  CodeBlockPlugin as BaseCodeBlockPlugin,
} from '../lib/CodeBlockPlugin';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';

export type CodeBlockConfig = {
  options: HotkeyPluginOptions;
} & BaseCodeBlockConfig;

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = extendPlugin(BaseCodeBlockPlugin, {
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
  },
  options: {
    hotkey: ['mod+opt+8', 'mod+shift+8'],
  },
});
