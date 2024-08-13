import {
  type ToggleMarkPluginOptions,
  createPlugin,
} from '@udecode/plate-common';
import { onKeyDownToggleMark } from '@udecode/plate-common/react';


/** Enables support for superscript formatting. */
export const SuperscriptPlugin = createPlugin<
  'superscript',
  ToggleMarkPluginOptions
>({
  deserializeHtml: {
    rules: [
      { validNodeName: ['SUP'] },
      {
        validStyle: {
          verticalAlign: 'super',
        },
      },
    ],
  },
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  isLeaf: true,
  key: 'superscript',
  options: {
    clear: 'subscript',
    hotkey: 'mod+.',
  },
});
