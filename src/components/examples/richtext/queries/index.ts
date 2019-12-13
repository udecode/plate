import { Editor } from 'slate';
import { ElementType, TextFormat } from 'plugins/common/constants/formats';

export const isFormatActive = (editor: Editor, format: string) => {
  if (Object.values(TextFormat).includes(format)) {
    const [match] = Editor.nodes(editor, {
      match: { [format]: true },
      mode: 'all',
    });

    return !!match;
  }

  if (Object.values(ElementType).includes(format)) {
    const [match] = Editor.nodes(editor, {
      match: { type: format },
      mode: 'all',
    });

    return !!match;
  }

  return false;
};
