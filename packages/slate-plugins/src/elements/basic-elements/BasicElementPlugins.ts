/**
 * Enables support for basic elements:
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { BlockquotePlugin } from '../blockquote';
import { CodeBlockContainerPlugin } from '../code-block';
import { HeadingPlugin } from '../heading';
import { ParagraphPlugin } from '../paragraph';
import { BasicElementPluginsOptions } from './types';

export const BasicElementPlugins = (
  options?: BasicElementPluginsOptions
): SlatePlugin[] => [
  BlockquotePlugin(options),
  CodeBlockContainerPlugin(options),
  HeadingPlugin(options),
  ParagraphPlugin(options),
];
