import { BaseParagraphPlugin } from '../../../lib';
import { Key } from '../../hotkeys';
import { toPlatePlugin } from '../../plugin/toPlatePlugin';

export const ParagraphPlugin = toPlatePlugin(BaseParagraphPlugin).extend({
  shortcuts: {
    toggle: {
      handler: ({ editor }) => {
        editor.update.blocks.toggle({
          type: editor.plugin(BaseParagraphPlugin).schema.type,
        });
      },
      keys: [
        [Key.Mod, Key.Alt, '0'],
        [Key.Mod, Key.Shift, '0'],
      ],
      preventDefault: true,
    },
  },
});
