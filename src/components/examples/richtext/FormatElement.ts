import { Editor, Element } from 'slate';
import {
  BlockFormat,
  TextFormat,
} from '../../../plugins/common/constants/formats';

export const FormatElement = {
  ...Element,
  isFormatActive: (editor: Editor, format: string) => {
    if (Object.values(TextFormat).includes(format)) {
      const [match] = Editor.nodes(editor, {
        match: { [format]: true },
        mode: 'all',
      });

      return !!match;
    }

    if (Object.values(BlockFormat).includes(format)) {
      const [match] = Editor.nodes(editor, {
        match: { type: format },
        mode: 'all',
      });

      return !!match;
    }

    return false;
  },
};
