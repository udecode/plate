import {
  type ToggleMarkPlugin,
  createPluginFactory,
  onKeyDownToggleMark,
  someHtmlElement,
} from '@udecode/plate-common/server';

export const MARK_UNDERLINE = 'underline';

/** Enables support for underline formatting. */
export const createUnderlinePlugin = createPluginFactory<ToggleMarkPlugin>({
  deserializeHtml: {
    query: (el) =>
      !someHtmlElement(el, (node) => node.style.textDecoration === 'none'),
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
