import { RenderAfterEditable } from '@udecode/plate-common';
import { EmojiPlugin } from '@udecode/plate-emoji';

import { MyPlatePlugin, MyValue } from '@/types/plate-types';
import { EmojiCombobox } from '@/registry/default/plate-ui/emoji-combobox';

export const emojiPlugin: Partial<MyPlatePlugin<EmojiPlugin>> = {
  renderAfterEditable: EmojiCombobox as RenderAfterEditable<MyValue>,
};
