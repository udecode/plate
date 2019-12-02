import { Editor, Element } from 'slate';

export const CommonElement = {
  ...Element,
  isBlockActive: (editor: Editor, type: string) => {
    const { selection } = editor;
    if (!selection) return false;
    const match = Editor.match(editor, selection, { type });
    return !!match;
  },
};
