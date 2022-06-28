export const imagePluginsCode = `import {
  createBasicElementsPlugin,
  createImagePlugin,
  createPlateUI,
  createSelectOnBackspacePlugin,
} from '@udecode/plate';
import { basicMarksPlugins } from '../basic-marks/basicMarksPlugins';
import { selectOnBackspacePlugin } from '../select-on-backspace/selectOnBackspacePlugin';
import { createMyPlugins } from '../typescript/plateTypes';

export const imagePlugins = createMyPlugins(
  [
    createBasicElementsPlugin(),
    ...basicMarksPlugins,
    createImagePlugin(),
    createSelectOnBackspacePlugin(selectOnBackspacePlugin),
  ],
  {
    components: createPlateUI(),
  }
);
`;

export const imagePluginsFile = {
  '/image/imagePlugins.ts': imagePluginsCode,
};
