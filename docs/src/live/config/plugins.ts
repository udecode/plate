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
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createUnderlinePlugin,
} from '@udecode/plate';
import { CONFIG } from './config';

const basicElements = createPlugins(
  [
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHeadingPlugin(),
    createParagraphPlugin(),
  ],
  {
    components: createPlateUI(),
  }
);

const basicMarks = createPlugins(
  [
    createBoldPlugin(),
    createCodePlugin(),
    createItalicPlugin(),
    createStrikethroughPlugin(),
    createSubscriptPlugin(),
    createSuperscriptPlugin(),
    createUnderlinePlugin(),
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
