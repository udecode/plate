/**
 * Enables support for basic elements:
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
import { createBlockquotePlugin } from '@udecode/slate-plugins-block-quote';
import { createCodeBlockPlugin } from '@udecode/slate-plugins-code-block';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { createHeadingPlugin } from '@udecode/slate-plugins-heading';
import { createParagraphPlugin } from '@udecode/slate-plugins-paragraph';
import { BasicElementPluginsOptions } from './types';

export const createBasicElementPlugins = ({
  heading,
}: BasicElementPluginsOptions = {}): SlatePlugin[] => [
  createBlockquotePlugin(),
  createCodeBlockPlugin(),
  createHeadingPlugin(heading),
  createParagraphPlugin(),
];
