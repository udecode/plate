import { RenderAfterEditable } from '@udecode/plate-common';
import { EmojiPlugin } from '@udecode/plate-emoji';

import { MyPlatePlugin, MyValue } from '@/plate/plate-types';
import { EmojiCombobox } from '@/registry/default/plate-ui/emoji-combobox/emoji-combobox';

export const emojiPlugin: Partial<MyPlatePlugin<EmojiPlugin>> = {
  renderAfterEditable: EmojiCombobox as RenderAfterEditable<MyValue>,
};
