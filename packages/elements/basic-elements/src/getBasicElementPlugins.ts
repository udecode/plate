/**
 * Enables support for basic elements:
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
import { getBlockquotePlugin } from '@udecode/slate-plugins-block-quote';
import { getCodeBlockPlugin } from '@udecode/slate-plugins-code-block';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { getHeadingPlugin } from '@udecode/slate-plugins-heading';
import { getParagraphPlugin } from '@udecode/slate-plugins-paragraph';
import { BasicElementPluginsOptions } from './types';

export const getBasicElementPlugins = ({
  heading,
}: BasicElementPluginsOptions = {}): SlatePlugin[] => [
  getBlockquotePlugin(),
  getCodeBlockPlugin(),
  getHeadingPlugin(heading),
  getParagraphPlugin(),
];
