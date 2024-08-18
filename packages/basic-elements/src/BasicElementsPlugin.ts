import { BlockquotePlugin } from '@udecode/plate-block-quote';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { ParagraphPlugin, createSlatePlugin } from '@udecode/plate-common';
import { HeadingPlugin } from '@udecode/plate-heading';

/**
 * Enables support for basic elements:
 *
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
export const BasicElementsPlugin = createSlatePlugin({
  key: 'basicElements',
  plugins: [BlockquotePlugin, CodeBlockPlugin, HeadingPlugin, ParagraphPlugin],
});
