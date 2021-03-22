/**
 * Enables support for basic elements:
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
import { useBlockquotePlugin } from '@udecode/slate-plugins-block-quote';
import { useCodeBlockPlugin } from '@udecode/slate-plugins-code-block';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { useHeadingPlugin } from '@udecode/slate-plugins-heading';
import { useParagraphPlugin } from '@udecode/slate-plugins-paragraph';
import { BasicElementPluginsOptions } from './types';

export const useBasicElementPlugins = ({
  heading,
}: BasicElementPluginsOptions = {}): SlatePlugin[] => [
  useBlockquotePlugin(),
  useCodeBlockPlugin(),
  useHeadingPlugin(heading),
  useParagraphPlugin(),
];
