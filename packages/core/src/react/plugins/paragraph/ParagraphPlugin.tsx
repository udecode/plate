import { Key } from '@udecode/react-hotkeys';

import { BaseParagraphPlugin } from '../../../lib';
import { toPlatePlugin } from '../../plugin/toPlatePlugin';

export const ParagraphPlugin = toPlatePlugin(
  BaseParagraphPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleParagraph: {
        handler: () => {
          editor.tf.toggle.block({ type });
        },
        keys: [
          [Key.Mod, Key.Alt, '0'],
          [Key.Mod, Key.Shift, '0'],
        ],
        preventDefault: true,
      },
    },
  })
);
