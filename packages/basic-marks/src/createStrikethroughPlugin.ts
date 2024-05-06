import {
  type ToggleMarkPlugin,
  createPluginFactory,
  onKeyDownToggleMark,
  someHtmlElement,
} from '@udecode/plate-common/server';

export const MARK_STRIKETHROUGH = 'strikethrough';

/** Enables support for strikethrough formatting. */
export const createStrikethroughPlugin = createPluginFactory<ToggleMarkPlugin>({
  deserializeHtml: {
    query: (el) =>
      !someHtmlElement(el, (node) => node.style.textDecoration === 'none'),
    rules: [
      { validNodeName: ['S', 'DEL', 'STRIKE'] },
      {
        validStyle: {
          textDecoration: 'line-through',
        },
      },
    ],
  },
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  isLeaf: true,
  key: MARK_STRIKETHROUGH,
  options: {
    hotkey: 'mod+shift+x',
  },
});
