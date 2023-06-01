import {
  createBasicElementsPlugin,
  createComboboxPlugin,
  createImagePlugin,
  createSelectOnBackspacePlugin,
} from '@udecode/plate';
import { basicMarksPlugins } from './basicMarksPlugins';
import { selectOnBackspacePlugin } from './selectOnBackspacePlugin';

import { plateUI } from '@/plate/demo/plateUI';
import { createMyPlugins } from '@/types/plate.types';

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
