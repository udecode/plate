import {
  createBasicElementsPlugin,
  createComboboxPlugin,
  createEmojiPlugin,
  createImagePlugin,
  createSelectOnBackspacePlugin,
} from '@udecode/plate';
import { basicMarksPlugins } from '../basic-marks/basicMarksPlugins';
import { plateUI } from '../common/plateUI';
import { emojiPlugin } from '../emoji/emojiPlugin';
import { selectOnBackspacePlugin } from '../select-on-backspace/selectOnBackspacePlugin';
import { createMyPlugins } from '../typescript/plateTypes';

export const imagePlugins = createMyPlugins(
  [
    createBasicElementsPlugin(),
    ...basicMarksPlugins,
    createImagePlugin(),
    createSelectOnBackspacePlugin(selectOnBackspacePlugin),
    createComboboxPlugin(),
    createEmojiPlugin(emojiPlugin),
  ],
  {
    components: plateUI,
  }
);
