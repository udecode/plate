import {
  type ToggleMarkPluginOptions,
  createSlatePlugin,
} from '@udecode/plate-common';
import { onKeyDownToggleMark } from '@udecode/plate-common/react';

/** Enables support for subscript formatting. */
export const SubscriptPlugin = createSlatePlugin<
  'subscript',
  ToggleMarkPluginOptions
>({
  deserializeHtml: {
    rules: [
      { validNodeName: ['SUB'] },
      {
        validStyle: {
          verticalAlign: 'sub',
        },
      },
    ],
  },
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  isLeaf: true,
  key: 'subscript',
  options: {
    clear: 'superscript',
    hotkey: 'mod+,',
  },
});
