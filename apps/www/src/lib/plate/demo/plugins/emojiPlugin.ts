import { EmojiPlugin, RenderAfterEditable } from '@udecode/plate';

import { MyPlatePlugin, MyValue } from '@/plate/demo/plate.types';
import { EmojiCombobox } from '@/plate/emoji/EmojiCombobox';

export const emojiPlugin: Partial<MyPlatePlugin<EmojiPlugin>> = {
  renderAfterEditable: EmojiCombobox as RenderAfterEditable<MyValue>,
};
