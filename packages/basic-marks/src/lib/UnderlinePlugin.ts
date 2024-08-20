import {
  type ToggleMarkPluginOptions,
  createSlatePlugin,
  someHtmlElement,
} from '@udecode/plate-common';

/** Enables support for underline formatting. */
export const UnderlinePlugin = createSlatePlugin<
  'underline',
  ToggleMarkPluginOptions
>({
  deserializeHtml: {
    query: ({ element }) =>
      !someHtmlElement(element, (node) => node.style.textDecoration === 'none'),
    rules: [
      { validNodeName: ['U'] },
      { validStyle: { textDecoration: ['underline'] } },
    ],
  },
  isLeaf: true,
  key: 'underline',
});
