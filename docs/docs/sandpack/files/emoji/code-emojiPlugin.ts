export const emojiPluginCode = `import { EmojiCombobox, EmojiPlugin } from '@udecode/plate';
import { MyPlatePlugin } from '../typescript/plateTypes';

export const emojiPlugin: Partial<MyPlatePlugin<EmojiPlugin>> = {
  renderAfterEditable: EmojiCombobox,
};
`;

export const emojiPluginFile = {
  '/emoji/emojiPlugin.ts': emojiPluginCode,
};
