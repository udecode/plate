import {
  type ToggleMarkPluginOptions,
  createPlugin,
  someHtmlElement,
} from '@udecode/plate-common';
import { onKeyDownToggleMark } from '@udecode/plate-common/react';

export const MARK_UNDERLINE = 'underline';

/** Enables support for underline formatting. */
export const UnderlinePlugin = createPlugin<
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
  key: MARK_UNDERLINE,
  options: {
    hotkey: 'mod+u',
  },
});
