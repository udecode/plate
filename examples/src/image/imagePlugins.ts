import {
  createBasicElementsPlugin,
  createImagePlugin,
  createPlateUI,
  createSelectOnBackspacePlugin,
} from '@udecode/plate';
import { basicMarkPlugins } from '../basic-marks/basicMarkPlugins';
import { selectOnBackspacePlugin } from '../select-on-backspace/selectOnBackspacePlugin';
import { createMyPlugins } from '../typescript/plate.types';

export const imagePlugins = createMyPlugins(
  [
    createBasicElementsPlugin(),
    ...basicMarkPlugins,
    createImagePlugin(),
    createSelectOnBackspacePlugin(selectOnBackspacePlugin),
  ],
  {
    components: createPlateUI(),
  }
);
