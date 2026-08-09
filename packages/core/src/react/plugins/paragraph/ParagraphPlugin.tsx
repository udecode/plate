import { Key } from '@udecode/react-hotkeys';

import { BaseParagraphPlugin } from '../../../lib';
import { toPlatePlugin } from '../../plugin/toPlatePlugin';

export const ParagraphPlugin = toPlatePlugin(BaseParagraphPlugin).extend(
  ({ editor, schema }) => ({
    shortcuts: {
      toggleParagraph: {
        keys: [
          [Key.Mod, Key.Alt, '0'],
          [Key.Mod, Key.Shift, '0'],
        ],
        preventDefault: true,
        handler: () => {
          editor.update.blocks.toggle(schema.type);
        },
      },
    },
  })
);
