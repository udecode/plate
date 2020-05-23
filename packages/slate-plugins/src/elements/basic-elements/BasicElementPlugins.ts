import { SlatePlugin } from 'common/types';
import { BasicElementPluginsOptions } from 'elements/basic-elements/types';
import { BlockquotePlugin } from 'elements/blockquote';
import { CodeBlockPlugin } from 'elements/code-block';
import { HeadingPlugin } from 'elements/heading';
import { ParagraphPlugin } from 'elements/paragraph';

/**
 * Enables support for basic elements:
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
export const BasicElementPlugins = (
  options?: BasicElementPluginsOptions
): SlatePlugin[] => [
  BlockquotePlugin(options),
  CodeBlockPlugin(options),
  HeadingPlugin(options),
  ParagraphPlugin(options),
];
