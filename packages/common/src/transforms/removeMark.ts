import { TEditor } from '@udecode/plate-core';
import { castArray } from 'lodash';
import { Editor, Range, Text, Transforms } from 'slate';
import { SetNodesOptions } from '../types';

export interface RemoveMarkOptions
  extends Omit<SetNodesOptions, 'match' | 'split'> {
  /**
   * Mark or the array of marks that will be removed
   */
  key: string | string[];

  /**
   * When location is not a Range,
   * setting this to false can prevent the onChange event of the editor to fire
   * @default true
   */
  shouldChange?: boolean;

  /**
   * Range where the mark(s) will be removed
   */
  at?: Range;
}

/**
 * Remove mark and trigger `onChange` if collapsed selection.
 */
export const removeMark = (
  editor: TEditor,
  { key, at, shouldChange = true, ...rest }: RemoveMarkOptions
) => {
  const selection = at ?? editor.selection;
  key = castArray(key);

  if (selection) {
    if (Range.isRange(selection) && Range.isExpanded(selection)) {
      Transforms.unsetNodes(editor, key, {
        at: selection,
        match: Text.isText,
        split: true,
        ...rest,
      });
    } else if (editor.selection) {
      const marks = { ...(Editor.marks(editor) || {}) };
      key.forEach((k) => {
        delete marks[k];
      });
      editor.marks = marks;
      shouldChange && editor.onChange();
    }
  }
};
