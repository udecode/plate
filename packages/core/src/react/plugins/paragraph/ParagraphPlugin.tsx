import { Key } from '@udecode/react-hotkeys';

import { BaseParagraphPlugin } from '../../../lib';
import { toPlatePlugin } from '../../plugin/toPlatePlugin';

export const ParagraphPlugin = toPlatePlugin(BaseParagraphPlugin).extend({
  shortcuts: {
    toggle: {
      handler: ({ editor }) => {
        editor.update.blocks.toggle(
          editor.plugin(BaseParagraphPlugin).schema.type
        );
      },
      keys: [
        [Key.Mod, Key.Alt, '0'],
        [Key.Mod, Key.Shift, '0'],
      ],
      preventDefault: true,
    },
  },
});
