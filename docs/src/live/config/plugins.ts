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
  createPlateUI,
  createPlugins,
  createSelectOnBackspacePlugin,
  createStrikethroughPlugin,
  createUnderlinePlugin,
} from '@udecode/plate';
import { CONFIG } from './config';

const basicElements = createPlugins(
  [
    createParagraphPlugin(), // paragraph element
    createBlockquotePlugin(), // blockquote element
    createCodeBlockPlugin(), // code block element
    createHeadingPlugin(), // heading elements
  ],
  {
    components: createPlateUI(),
  }
);

const basicMarks = createPlugins(
  [
    createBoldPlugin(), // bold mark
    createItalicPlugin(), // italic mark
    createUnderlinePlugin(), // underline mark
    createStrikethroughPlugin(), // strikethrough mark
    createCodePlugin(), // code mark], {
  ],
  {
    components: createPlateUI(),
  }
);

export const PLUGINS = {
  basicElements,
  basicMarks,
  basicNodes: createPlugins([...basicElements, ...basicMarks], {
    components: createPlateUI(),
  }),
  image: createPlugins(
    [
      createBasicElementsPlugin(),
      ...basicMarks,
      createImagePlugin(),
      createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
    ],
    {
      components: createPlateUI(),
    }
  ),
};
