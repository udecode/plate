import {
  EmojiCombobox,
  EmojiPlugin,
  RenderAfterEditable,
} from '@udecode/plate';
import {
  MyPlatePlugin,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';

export const emojiPlugin: Partial<MyPlatePlugin<EmojiPlugin>> = {
  renderAfterEditable: EmojiCombobox as RenderAfterEditable<MyValue>,
};
