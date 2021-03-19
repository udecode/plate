import {
  getSlatePluginWithOverrides,
  WithOverride,
} from '@udecode/slate-plugins-core';
import { Editor, Range, Text, Transforms } from 'slate';

export interface MarkEditor extends Editor {
  removeMark: (key: string, shouldChange?: boolean) => void;
}

export const withMarks = (): WithOverride<Editor, MarkEditor> => (editor) => {
  const e = editor as typeof editor & MarkEditor;

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

/**
 * @see {@link withMarks}
 */
export const useMarksPlugin = getSlatePluginWithOverrides(withMarks);
