import {
  type ToggleMarkPluginOptions,
  createPlugin,
  onKeyDownToggleMark,
  someHtmlElement,
} from '@udecode/plate-common/server';

export const MARK_ITALIC = 'italic';

/** Enables support for italic formatting. */
export const ItalicPlugin = createPlugin<ToggleMarkPluginOptions>({
  deserializeHtml: {
    query: (el) =>
      !someHtmlElement(el, (node) => node.style.fontStyle === 'normal'),
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
  key: MARK_ITALIC,
  options: {
    hotkey: 'mod+i',
  },
});
