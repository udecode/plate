import {
  ToggleMarkPlugin,
  createPluginFactory,
  onKeyDownToggleMark,
  someHtmlElement,
} from '@udecode/plate-common';

export const MARK_UNDERLINE = 'underline';

/**
 * Enables support for underline formatting.
 */
export const createUnderlinePlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_UNDERLINE,
  isLeaf: true,
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+u',
  },
  deserializeHtml: {
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
    query: (el) =>
      !someHtmlElement(el, (node) => node.style.textDecoration === 'none'),
  },
});
