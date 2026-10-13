import { BaseParagraphPlugin } from '../../../lib';
import { toReactPlugin } from '../../core';

export const ParagraphPlugin = toReactPlugin(BaseParagraphPlugin).extend({
  shortcuts: {
    toggle: {
      handler: ({ editor }) => {
        editor.update.blocks.reset({ unset: 'level' });
      },
      keys: ['mod+alt+0', 'mod+shift+0'],
      preventDefault: true,
    },
  },
});
