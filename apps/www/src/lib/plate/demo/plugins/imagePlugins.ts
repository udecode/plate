import { createBasicElementsPlugin } from '@udecode/plate-basic-elements';
import { createComboboxPlugin } from '@udecode/plate-combobox';
import { createImagePlugin } from '@udecode/plate-media';
import { createSelectOnBackspacePlugin } from '@udecode/plate-select';
import { basicMarksPlugins } from './basicMarksPlugins';
import { selectOnBackspacePlugin } from './selectOnBackspacePlugin';

import { plateUI } from '@/plate/demo/plateUI';
import { createMyPlugins } from '@/types/plate-types';

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
