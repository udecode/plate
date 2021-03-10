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

export const BasicElementPlugins = ({
  heading,
}: BasicElementPluginsOptions = {}): SlatePlugin[] => [
  BlockquotePlugin(),
  CodeBlockPlugin(),
  HeadingPlugin(heading),
  ParagraphPlugin(),
];
