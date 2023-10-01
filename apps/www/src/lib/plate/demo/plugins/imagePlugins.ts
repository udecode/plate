import { plateUI } from '@/plate/demo/plateUI';
import { createBasicElementsPlugin } from '@udecode/plate-basic-elements';
import { createComboboxPlugin } from '@udecode/plate-combobox';
import { createPlugins } from '@udecode/plate-core';
import { createImagePlugin } from '@udecode/plate-media';
import { createSelectOnBackspacePlugin } from '@udecode/plate-select';

import { basicMarksPlugins } from './basicMarksPlugins';
import { selectOnBackspacePlugin } from './selectOnBackspacePlugin';

export const imagePlugins = createPlugins(
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
