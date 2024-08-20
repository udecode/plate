import {
  type ToggleMarkPluginOptions,
  createSlatePlugin,
} from '@udecode/plate-common';

/** Enables support for superscript formatting. */
export const SuperscriptPlugin = createSlatePlugin<
  'superscript',
  ToggleMarkPluginOptions
>({
  deserializeHtml: {
    rules: [
      { validNodeName: ['SUP'] },
      { validStyle: { verticalAlign: 'super' } },
    ],
  },
  isLeaf: true,
  key: 'superscript',
  options: {
    clear: 'subscript',
  },
});
