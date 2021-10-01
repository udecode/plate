/**
 * Enables support for basic elements:
 * - Block quote
 * - Code block
 * - Heading
 * - Paragraph
 */
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import {
  CodeBlockPluginOptions,
  createCodeBlockPlugin,
} from '@udecode/plate-code-block';
import { PlatePlugin } from '@udecode/plate-core';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { BasicElementPluginsOptions } from './types';

export const createBasicElementPlugins = ({
  heading,
}: BasicElementPluginsOptions = {}): PlatePlugin[] => [
  createBlockquotePlugin(),
  createCodeBlockPlugin({ syntax: true, syntaxPopularFirst: true }),
  createHeadingPlugin(heading),
  createParagraphPlugin(),
];
