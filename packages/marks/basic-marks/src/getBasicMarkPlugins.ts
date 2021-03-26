import { SlatePlugin } from '@udecode/slate-plugins-core';
import { getBoldPlugin } from './bold/getBoldPlugin';
import { getCodePlugin } from './code/getCodePlugin';
import { getItalicPlugin } from './italic/getItalicPlugin';
import { getStrikethroughPlugin } from './strikethrough/getStrikethroughPlugin';
import { getSubscriptPlugin } from './subscript/getSubscriptPlugin';
import { getSuperscriptPlugin } from './superscript/getSuperscriptPlugin';
import { getUnderlinePlugin } from './underline/getUnderlinePlugin';

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
export const getBasicMarkPlugins = (): SlatePlugin[] => [
  getBoldPlugin(),
  getCodePlugin(),
  getItalicPlugin(),
  getStrikethroughPlugin(),
  getSubscriptPlugin(),
  getSuperscriptPlugin(),
  getUnderlinePlugin(),
];
