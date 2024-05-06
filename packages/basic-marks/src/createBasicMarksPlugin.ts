import { createPluginFactory } from '@udecode/plate-common/server';

import { createBoldPlugin } from './createBoldPlugin';
import { createCodePlugin } from './createCodePlugin';
import { createItalicPlugin } from './createItalicPlugin';
import { createStrikethroughPlugin } from './createStrikethroughPlugin';
import { createSubscriptPlugin } from './createSubscriptPlugin';
import { createSuperscriptPlugin } from './createSuperscriptPlugin';
import { createUnderlinePlugin } from './createUnderlinePlugin';

/**
 * Enables support for basic marks:
 *
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
