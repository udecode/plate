import {
  createBasicElementsPlugin,
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugin,
  createCodePlugin,
  createHeadingPlugin,
  createImagePlugin,
  createItalicPlugin,
  createParagraphPlugin,
  createSelectOnBackspacePlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
} from '@udecode/plate';
import { CONFIG } from './config';

const basicElements = [
  createParagraphPlugin(), // paragraph element
  createBlockquotePlugin(), // blockquote element
  createCodeBlockPlugin(), // code block element
  createHeadingPlugin(), // heading elements
];

const basicMarks = [
  createBoldPlugin(), // bold mark
  createItalicPlugin(), // italic mark
  createUnderlinePlugin(), // underline mark
  createStrikethroughPlugin(), // strikethrough mark
  createCodePlugin(), // code mark
];

export const PLUGINS = {
  basicElements,
  basicMarks,
  basicNodes: [...basicElements, ...basicMarks],
  image: [
    createBasicElementsPlugin(),
    ...basicMarks,
    createImagePlugin(),
    createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
  ],
};
