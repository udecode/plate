export const emojiPluginCode = `import {
  EmojiCombobox,
  EmojiPlugin,
  RenderAfterEditable,
} from '@udecode/plate';
import { MyPlatePlugin, MyValue } from '../typescript/plateTypes';

export const emojiPlugin: Partial<MyPlatePlugin<EmojiPlugin>> = {
  renderAfterEditable: EmojiCombobox as RenderAfterEditable<MyValue>,
};
`;

export const emojiPluginFile = {
  '/emoji/emojiPlugin.ts': emojiPluginCode,
};
