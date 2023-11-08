import { PlatePlugin } from '@udecode/plate-common';
import { EmojiPlugin } from '@udecode/plate-emoji';

import { EmojiCombobox } from '@/registry/default/plate-ui/emoji-combobox';

export const emojiPlugin: Partial<PlatePlugin<EmojiPlugin>> = {
  renderAfterEditable: EmojiCombobox,
};
