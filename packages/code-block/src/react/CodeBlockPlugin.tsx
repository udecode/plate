import { Key, toPlatePlugin } from '@udecode/plate-common/react';

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '../lib/BaseCodeBlockPlugin';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';

export const CodeLinePlugin = toPlatePlugin(BaseCodeLinePlugin);

export const CodeSyntaxPlugin = toPlatePlugin(BaseCodeSyntaxPlugin);

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
  plugins: [CodeLinePlugin, CodeSyntaxPlugin],
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
  },
}).extend(({ editor, type }) => ({
  shortcuts: {
    toggleCodeBlock: {
      keys: [[Key.Mod, Key.Alt, '8']],
      preventDefault: true,
      handler: () => {
        editor.tf.toggle.block({ type });
      },
    },
  },
}));
