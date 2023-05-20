import {
  createBasicElementsPlugin,
  createComboboxPlugin,
  createImagePlugin,
  createSelectOnBackspacePlugin,
} from '@udecode/plate';
import { createMyPlugins } from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicMarksPlugins } from '../basic-marks/basicMarksPlugins';
import { plateUI } from '../common/plateUI';
import { selectOnBackspacePlugin } from '../select-on-backspace/selectOnBackspacePlugin';

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
