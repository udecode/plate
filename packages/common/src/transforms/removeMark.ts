import { TEditor } from '@udecode/plate-core';
import { Editor, Range, Text, Transforms } from 'slate';

/**
 * Remove mark and trigger `onChange` if collapsed selection.
 */
export const removeMark = (
  editor: TEditor,
  {
    key,
    shouldChange = true,
  }: {
    key: string;
    shouldChange?: boolean;
  }
) => {
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
