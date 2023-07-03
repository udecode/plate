import {
  ToggleMarkPlugin,
  createPluginFactory,
  onKeyDownToggleMark,
  someHtmlElement,
} from '@udecode/plate-common';

export const MARK_STRIKETHROUGH = 'strikethrough';

/**
 * Enables support for strikethrough formatting.
 */
export const createStrikethroughPlugin = createPluginFactory<ToggleMarkPlugin>({
  key: MARK_STRIKETHROUGH,
  isLeaf: true,
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  options: {
    hotkey: 'mod+shift+x',
  },
  deserializeHtml: {
    rules: [
      { validNodeName: ['S', 'DEL', 'STRIKE'] },
      {
        validStyle: {
          textDecoration: 'line-through',
        },
      },
    ],
    query: (el) =>
      !someHtmlElement(el, (node) => node.style.textDecoration === 'none'),
  },
});
