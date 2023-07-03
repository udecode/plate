import { PlatePlugin, RenderAfterEditable } from '@udecode/plate-core';
import { EmojiPlugin } from '@udecode/plate-emoji';

import { EmojiCombobox } from '@/lib/plate/emoji-combobox';

export const emojiPlugin: Partial<PlatePlugin<EmojiPlugin>> = {
  renderAfterEditable: EmojiCombobox as RenderAfterEditable,
};
