import { CodeBlockPlugin as BaseCodeBlockPlugin } from '../lib/CodeBlockPlugin';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = BaseCodeBlockPlugin.extend({
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
  },
  options: {
    hotkey: ['mod+opt+8', 'mod+shift+8'],
  },
});
