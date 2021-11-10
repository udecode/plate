import {
  createBasicElementPlugins,
  createBlockquotePlugin,
  createBoldPlugin,
  createCodeBlockPlugins,
  createCodePlugin,
  createHeadingPlugins,
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
  ...createHeadingPlugins(), // heading elements
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
    ...createBasicElementPlugins(),
    ...basicMarks,
    createImagePlugin(),
    createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
  ],
};
