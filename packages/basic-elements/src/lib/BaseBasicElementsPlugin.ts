import { BaseBlockquotePlugin } from '@udecode/plate-block-quote';
import { BaseCodeBlockPlugin } from '@udecode/plate-code-block';
import { BaseParagraphPlugin, createSlatePlugin } from '@udecode/plate-common';
import { BaseHeadingPlugin } from '@udecode/plate-heading';

export const BaseBasicElementsPlugin = createSlatePlugin({
  key: 'basicElements',
  plugins: [
    BaseBlockquotePlugin,
    BaseCodeBlockPlugin,
    BaseHeadingPlugin,
    BaseParagraphPlugin,
  ],
});
