import { Editor, Transforms, Range, Text } from 'slate';

export interface MarkEditor {
  shouldChange: boolean;
}

export const withMarks = ({ shouldChange = true }) => <T extends Editor>(
  editor: T
) => {
  const e = editor as T & MarkEditor;

  e.removeMark = (key: string) => {
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
