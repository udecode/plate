/**
 * Enables support for basic elements:
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { useBlockquotePlugin } from '../blockquote/useBlockquotePlugin';
import { useCodeBlockPlugin } from '../code-block/useCodeBlockPlugin';
import { useHeadingPlugin } from '../heading/useHeadingPlugin';
import { useParagraphPlugin } from '../paragraph/useParagraphPlugin';
import { BasicElementPluginsOptions } from './types';

export const useBasicElementPlugins = ({
  heading,
}: BasicElementPluginsOptions = {}): SlatePlugin[] => [
  useBlockquotePlugin(),
  useCodeBlockPlugin(),
  useHeadingPlugin(heading),
  useParagraphPlugin(),
];
