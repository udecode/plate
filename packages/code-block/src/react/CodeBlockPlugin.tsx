import type { ExtendConfig, HotkeyPluginOptions } from '@udecode/plate-common';

import { toPlatePlugin } from '@udecode/plate-common/react';

import {
  type CodeBlockConfig as BaseCodeBlockConfig,
  CodeBlockPlugin as BaseCodeBlockPlugin,
  CodeLinePlugin as BaseCodeLinePlugin,
  CodeSyntaxPlugin as BaseCodeSyntaxPlugin,
} from '../lib/CodeBlockPlugin';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';

export type CodeBlockConfig = ExtendConfig<
  BaseCodeBlockConfig,
  HotkeyPluginOptions
>;

export const CodeLinePlugin = toPlatePlugin(BaseCodeLinePlugin);

export const CodeSyntaxPlugin = toPlatePlugin(BaseCodeSyntaxPlugin);

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
  },
  options: {
    hotkey: ['mod+opt+8', 'mod+shift+8'],
  },
  plugins: [CodeLinePlugin, CodeSyntaxPlugin],
});
