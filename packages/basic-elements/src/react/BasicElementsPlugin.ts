import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import {
  ParagraphPlugin,
  createPlatePlugin,
} from '@udecode/plate/react';
import { HeadingPlugin } from '@udecode/plate-heading/react';

/**
 * Enables support for basic elements:
 *
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
export const BasicElementsPlugin = createPlatePlugin({
  key: 'basicElements',
  plugins: [BlockquotePlugin, CodeBlockPlugin, HeadingPlugin, ParagraphPlugin],
});
