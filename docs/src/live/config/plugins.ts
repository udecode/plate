import {
  createBasicElementsPlugin,
  createBasicMarksPlugin,
  createImagePlugin,
  createPlateUI,
  createPlugins,
  createSelectOnBackspacePlugin,
} from '@udecode/plate';
import { CONFIG } from './config';

const basicElements = createPlugins([createBasicElementsPlugin()], {
  components: createPlateUI(),
});

const basicMarks = createPlugins([createBasicMarksPlugin()], {
  components: createPlateUI(),
});

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
