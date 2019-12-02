import { Editor, Mark } from 'slate';

export const CommonMark = {
  ...Mark,
  isMarkActive: (editor: Editor, type: string) => {
    const marks = Editor.activeMarks(editor);
    const isActive = marks.some(m => m.type === type);
    return isActive;
  },
};
