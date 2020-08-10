import { Editor, Range, Text, Transforms } from 'slate';

export interface MarkEditor extends Editor {
  removeMark: (key: string, shouldChange?: boolean) => void;
}

export const withMarks = () => <T extends Editor>(editor: T) => {
  const e = editor as T & MarkEditor;

  e.removeMark = (key: string, shouldChange = true) => {
    const { selection } = editor;
    if (selection) {
      if (Range.isExpanded(selection)) {
        Transforms.unsetNodes(editor, key, {
          match: Text.isText,
          split: true,
        });
      } else {
        const marks = { ...(Editor.marks(editor) || {}) };
        delete marks[key];
        editor.marks = marks;
        shouldChange && editor.onChange();
      }
    }
  };
  return e;
};
