/**
 * Enables support for basic elements:
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { BlockquotePlugin } from '../blockquote/BlockquotePlugin';
import { CodeBlockPlugin } from '../code-block/CodeBlockPlugin';
import { HeadingPlugin } from '../heading/HeadingPlugin';
import { ParagraphPlugin } from '../paragraph/ParagraphPlugin';
import { BasicElementPluginsOptions } from './types';

export const BasicElementPlugins = (
  options?: BasicElementPluginsOptions
): SlatePlugin[] => [
  BlockquotePlugin(options),
  CodeBlockPlugin(options),
  HeadingPlugin(options),
  ParagraphPlugin(options),
];
