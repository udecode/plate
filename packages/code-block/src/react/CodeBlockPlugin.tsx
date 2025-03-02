import { Key, toPlatePlugin } from '@udecode/plate/react';

import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '../lib/BaseCodeBlockPlugin';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';

export const CodeSyntaxPlugin = toPlatePlugin(BaseCodeSyntaxPlugin);

export const CodeLinePlugin = toPlatePlugin(BaseCodeLinePlugin);

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = toPlatePlugin(BaseCodeBlockPlugin, {
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
  },
  plugins: [CodeLinePlugin, CodeSyntaxPlugin],
}).extend(({ editor, plugin }) => ({
  shortcuts: {
    toggleCodeBlock: {
      keys: [[Key.Mod, Key.Alt, '8']],
      preventDefault: true,
      handler: () => {
        editor.tf.toggleBlock(editor.getType(plugin));
      },
    },
  },
}));
