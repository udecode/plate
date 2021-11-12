/**
 * Enables support for basic elements:
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
import {createBlockquotePlugin} from '@udecode/plate-block-quote';
import {createCodeBlockPlugins} from '@udecode/plate-code-block';
import {createPlugin} from '@udecode/plate-core';
import {createHeadingPlugin, HeadingsPlugin} from '@udecode/plate-heading';
import {createParagraphPlugin} from '@udecode/plate-paragraph';
import {BasicElementPluginsOptions} from './types';

export const createBasicElementsPlugin = createPlugin<HeadingsPlugin>({
  key: 'basicElements',
  
}) ({
  heading,
}: BasicElementPluginsOptions = {}): PlatePlugin => [
  createBlockquotePlugin(),
  ...createCodeBlockPlugins(),
  ...createHeadingPlugin(heading),
  createParagraphPlugin(),
];
