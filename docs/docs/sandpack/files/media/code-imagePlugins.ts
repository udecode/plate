export const imagePluginsCode = `import {
  createBasicElementsPlugin,
  createImagePlugin,
  createSelectOnBackspacePlugin,
} from '@udecode/plate';
import { basicMarksPlugins } from '../basic-marks/basicMarksPlugins';
import { plateUI } from '../common/plateUI';
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
    components: plateUI,
  }
);
`;

export const imagePluginsFile = {
  '/media/imagePlugins.ts': imagePluginsCode,
};
