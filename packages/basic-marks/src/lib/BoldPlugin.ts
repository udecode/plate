import {
  type ToggleMarkPluginOptions,
  createSlatePlugin,
  someHtmlElement,
} from '@udecode/plate-common';

/** Enables support for bold formatting */
export const BoldPlugin = createSlatePlugin<'bold', ToggleMarkPluginOptions>({
  deserializeHtml: {
    query: ({ element }) =>
      !someHtmlElement(element, (node) => node.style.fontWeight === 'normal'),
    rules: [
      { validNodeName: ['STRONG', 'B'] },
      {
        validStyle: {
          fontWeight: ['600', '700', 'bold'],
        },
      },
    ],
  },
  isLeaf: true,
  key: 'bold',
});
