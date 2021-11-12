import {
  createBasicElementsPlugin,
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugins,
  createCodePlugin,
  createHeadingPlugin,
  createHistoryPlugin,
  createImagePlugin,
  createItalicPlugin,
  createParagraphPlugin,
  createReactPlugin,
  createSelectOnBackspacePlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
} from '@udecode/plate';
import { CONFIG } from './config';

const core = [createReactPlugin(), createHistoryPlugin()];

const basicElements = [
  createParagraphPlugin(), // paragraph element
  createBlockquotePlugin(), // blockquote element
  ...createCodeBlockPlugins(), // code block element
  ...createHeadingPlugin(), // heading elements
];

const basicMarks = [
  createBoldPlugin(), // bold mark
  createItalicPlugin(), // italic mark
  createUnderlinePlugin(), // underline mark
  createStrikethroughPlugin(), // strikethrough mark
  createCodePlugin(), // code mark
];

export const PLUGINS = {
  core,
  basicElements,
  basicMarks,
  basicNodes: [...core, ...basicElements, ...basicMarks],
  image: [
    ...core,
    ...createBasicElementsPlugin(),
    ...basicMarks,
    createImagePlugin(),
    createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
  ],
};
