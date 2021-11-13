import { createPluginFactory } from '@udecode/plate-core';
import { createBoldPlugin } from './bold/createBoldPlugin';
import { createCodePlugin } from './code/createCodePlugin';
import { createItalicPlugin } from './italic/createItalicPlugin';
import { createStrikethroughPlugin } from './strikethrough/createStrikethroughPlugin';
import { createSubscriptPlugin } from './subscript/createSubscriptPlugin';
import { createSuperscriptPlugin } from './superscript/createSuperscriptPlugin';
import { createUnderlinePlugin } from './underline/createUnderlinePlugin';

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
export const createBasicMarksPlugin = createPluginFactory({
  key: 'basicMarks',
  plugins: [
    createBoldPlugin(),
    createCodePlugin(),
    createItalicPlugin(),
    createStrikethroughPlugin(),
    createSubscriptPlugin(),
    createSuperscriptPlugin(),
    createUnderlinePlugin(),
  ],
});
