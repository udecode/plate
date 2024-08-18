import {
  type ToggleMarkPluginOptions,
  createSlatePlugin,
  someHtmlElement,
} from '@udecode/plate-common';
import { onKeyDownToggleMark } from '@udecode/plate-common/react';

/** Enables support for italic formatting. */
export const ItalicPlugin = createSlatePlugin<
  'italic',
  ToggleMarkPluginOptions
>({
  deserializeHtml: {
    query: ({ element }) =>
      !someHtmlElement(element, (node) => node.style.fontStyle === 'normal'),
    rules: [
      { validNodeName: ['EM', 'I'] },
      {
        validStyle: {
          fontStyle: 'italic',
        },
      },
    ],
  },
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  isLeaf: true,
  key: 'italic',
  options: {
    hotkey: 'mod+i',
  },
});
