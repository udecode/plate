import { BaseParagraphPlugin } from '../../../lib';
import { toPlatePlugin } from '../../core';

export const ParagraphPlugin = toPlatePlugin(BaseParagraphPlugin).extend({
  shortcuts: {
    toggle: {
      handler: ({ editor }) => {
        editor.update.blocks.toggle({
          type: editor.plugin(BaseParagraphPlugin).schema.type,
        });
      },
      keys: ['mod+alt+0', 'mod+shift+0'],
      preventDefault: true,
    },
  },
});
