import {
  type ToggleMarkPluginOptions,
  createSlatePlugin,
  someHtmlElement,
} from '@udecode/plate-common';
import { onKeyDownToggleMark } from '@udecode/plate-common/react';

/** Enables support for underline formatting. */
export const UnderlinePlugin = createSlatePlugin<
  'underline',
  ToggleMarkPluginOptions
>({
  deserializeHtml: {
    query: ({ element }) =>
      !someHtmlElement(element, (node) => node.style.textDecoration === 'none'),
    rules: [
      {
        validNodeName: ['U'],
      },
      {
        validStyle: {
          textDecoration: ['underline'],
        },
      },
    ],
  },
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  isLeaf: true,
  key: 'underline',
  options: {
    hotkey: 'mod+u',
  },
});
