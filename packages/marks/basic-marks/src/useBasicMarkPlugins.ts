import { SlatePlugin } from '@udecode/slate-plugins-core';
import { useBoldPlugin } from './bold/useBoldPlugin';
import { useCodePlugin } from './code/useCodePlugin';
import { useItalicPlugin } from './italic/useItalicPlugin';
import { useStrikethroughPlugin } from './strikethrough/useStrikethroughPlugin';
import { useSubscriptPlugin } from './subscript/useSubscriptPlugin';
import { useSuperscriptPlugin } from './superscript/useSuperscriptPlugin';
import { useUnderlinePlugin } from './underline/useUnderlinePlugin';

/**
 * Enables support for basic marks:
 * - Bold
 * - Code
 * - Italic
 * - Strikethrough
 * - Subscript
 * - Superscript
 * - Underline
 */
export const useBasicMarkPlugins = (): SlatePlugin[] => [
  useBoldPlugin(),
  useCodePlugin(),
  useItalicPlugin(),
  useStrikethroughPlugin(),
  useSubscriptPlugin(),
  useSuperscriptPlugin(),
  useUnderlinePlugin(),
];
