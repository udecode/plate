/**
 * Enables support for basic elements:
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
import { SlatePlugin } from '../../common';
import { BlockquotePlugin } from '../blockquote';
import { CodeBlockPlugin } from '../code-block';
import { HeadingPlugin } from '../heading';
import { ParagraphPlugin } from '../paragraph';
import { BasicElementPluginsOptions } from './types';

export const BasicElementPlugins = (
  options?: BasicElementPluginsOptions
): SlatePlugin[] => [
  BlockquotePlugin(options),
  CodeBlockPlugin(options),
  HeadingPlugin(options),
  ParagraphPlugin(options),
];
