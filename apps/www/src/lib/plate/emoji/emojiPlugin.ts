import { EmojiPlugin, RenderAfterEditable } from '@udecode/plate';
import { EmojiCombobox } from './EmojiCombobox';

import { MyPlatePlugin, MyValue } from '@/plate/typescript/plateTypes';

export const emojiPlugin: Partial<MyPlatePlugin<EmojiPlugin>> = {
  renderAfterEditable: EmojiCombobox as RenderAfterEditable<MyValue>,
};
