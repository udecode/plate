import {
  createBasicElementsPlugin,
  createComboboxPlugin,
  createImagePlugin,
  createSelectOnBackspacePlugin,
} from '@udecode/plate';

import { basicMarksPlugins } from '@/plate/basic-marks/basicMarksPlugins';
import { plateUI } from '@/plate/demo/plateUI';
import { selectOnBackspacePlugin } from '@/plate/select-on-backspace/selectOnBackspacePlugin';
import { createMyPlugins } from '@/plate/typescript/plateTypes';

export const imagePlugins = createMyPlugins(
  [
    createBasicElementsPlugin(),
    ...basicMarksPlugins,
    createImagePlugin(),
    createSelectOnBackspacePlugin(selectOnBackspacePlugin),
    createComboboxPlugin(),
  ],
  {
    components: plateUI,
  }
);
