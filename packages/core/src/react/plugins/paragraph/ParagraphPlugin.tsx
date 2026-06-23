import { Key } from '@udecode/react-hotkeys';

import { getCurrentRuntimeTransforms } from '../../../internal/currentRuntimeBridge';
import { BaseParagraphPlugin } from '../../../lib';
import { toPlatePlugin } from '../../plugin/toPlatePlugin';

export const ParagraphPlugin = toPlatePlugin(
  BaseParagraphPlugin,
  ({ editor, type }) => ({
    shortcuts: {
      toggleParagraph: {
        keys: [
          [Key.Mod, Key.Alt, '0'],
          [Key.Mod, Key.Shift, '0'],
        ],
        preventDefault: true,
        handler: () => {
          getCurrentRuntimeTransforms(editor).toggleBlock(type);
        },
      },
    },
  })
);
