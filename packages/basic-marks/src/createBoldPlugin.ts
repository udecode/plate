import {
  type ToggleMarkPlugin,
  createPluginFactory,
  onKeyDownToggleMark,
  someHtmlElement,
} from '@udecode/plate-common/server';

export const MARK_BOLD = 'bold';

/** Enables support for bold formatting */
export const createBoldPlugin = createPluginFactory<ToggleMarkPlugin>({
  deserializeHtml: {
    query: (el) =>
      !someHtmlElement(el, (node) => node.style.fontWeight === 'normal'),
    rules: [
      { validNodeName: ['STRONG', 'B'] },
      {
        validStyle: {
          fontWeight: ['600', '700', 'bold'],
        },
      },
    ],
  },
  handlers: {
    onKeyDown: onKeyDownToggleMark,
  },
  isLeaf: true,

  key: MARK_BOLD,
  options: {
    hotkey: 'mod+b',
  },
});
