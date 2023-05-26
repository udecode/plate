import {
  createBasicElementsPlugin,
  createComboboxPlugin,
  createImagePlugin,
  createSelectOnBackspacePlugin,
} from '@udecode/plate';
import { basicMarksPlugins } from './basicMarksPlugins';
import { selectOnBackspacePlugin } from './selectOnBackspacePlugin';

import { createMyPlugins } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';

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
