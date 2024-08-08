import { BlockquotePlugin } from '@udecode/plate-block-quote';
import { CodeBlockPlugin } from '@udecode/plate-code-block';
import { createPlugin } from '@udecode/plate-common';
import { HeadingPlugin } from '@udecode/plate-heading';
import { ParagraphPlugin } from '@udecode/plate-paragraph';

export const KEY_BASIC_ELEMENTS = 'basicElements';

/**
 * Enables support for basic elements:
 *
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
export const BasicElementsPlugin = createPlugin({
  key: KEY_BASIC_ELEMENTS,
  plugins: [BlockquotePlugin, CodeBlockPlugin, HeadingPlugin, ParagraphPlugin],
});
