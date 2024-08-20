import {
  type ToggleMarkPluginOptions,
  createSlatePlugin,
  someHtmlElement,
} from '@udecode/plate-common';

/** Enables support for strikethrough formatting. */
export const StrikethroughPlugin = createSlatePlugin<
  'strikethrough',
  ToggleMarkPluginOptions
>({
  deserializeHtml: {
    query: ({ element }) =>
      !someHtmlElement(element, (node) => node.style.textDecoration === 'none'),
    rules: [
      { validNodeName: ['S', 'DEL', 'STRIKE'] },
      { validStyle: { textDecoration: 'line-through' } },
    ],
  },
  isLeaf: true,
  key: 'strikethrough',
});
