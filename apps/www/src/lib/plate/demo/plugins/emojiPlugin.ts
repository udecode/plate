import { RenderAfterEditable } from '@udecode/plate-common';
import { EmojiPlugin } from '@udecode/plate-emoji';

import { EmojiCombobox } from '@/components/plate-ui/emoji-combobox';
import { MyPlatePlugin, MyValue } from '@/plate/plate.types';

export const emojiPlugin: Partial<MyPlatePlugin<EmojiPlugin>> = {
  renderAfterEditable: EmojiCombobox as RenderAfterEditable<MyValue>,
};
