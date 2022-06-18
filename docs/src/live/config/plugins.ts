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
  findEventRange,
} from '@udecode/plate';
import { createStore } from '@udecode/zustood';
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

export const cursorStore = createStore('cursor')({
  cursors: {},
});

export const createDragOverCursorPlugin = () => ({
  key: 'drag-over-cursor',
  handlers: {
    onDragOver: (editor) => (event) => {
      const range = findEventRange(editor, event);
      if (!range) return;

      cursorStore.set.cursors({
        drag: {
          key: 'drag',
          data: {
            style: {
              backgroundColor: '#fc00ff',
              backgroundImage: 'linear-gradient(0deg, #fc00ff, #00dbde)',
              width: 3,
            },
          },
          selection: range,
        },
      });
    },
    onDragLeave: () => () => {
      cursorStore.set.cursors({});
    },
    onDragEnd: () => () => {
      cursorStore.set.cursors({});
    },
    onDrop: () => () => {
      cursorStore.set.cursors({});
    },
  },
});
