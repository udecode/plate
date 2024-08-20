import {
  type ToggleMarkPluginOptions,
  createSlatePlugin,
} from '@udecode/plate-common';

/** Enables support for subscript formatting. */
export const SubscriptPlugin = createSlatePlugin<
  'subscript',
  ToggleMarkPluginOptions
>({
  deserializeHtml: {
    rules: [
      { validNodeName: ['SUB'] },
      { validStyle: { verticalAlign: 'sub' } },
    ],
  },
  isLeaf: true,
  key: 'subscript',
  options: {
    clear: 'superscript',
  },
});
