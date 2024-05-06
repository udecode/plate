import {
  type SetNodesOptions,
  type TEditor,
  type Value,
  getMarks,
  isText,
  unsetNodes,
} from '@udecode/slate';
import castArray from 'lodash/castArray.js';
import { Range } from 'slate';

export interface RemoveMarkOptions<V extends Value = Value>
  extends Omit<SetNodesOptions<V>, 'match' | 'split'> {
  /** Mark or the array of marks that will be removed */
  key: string | string[];

  /** Range where the mark(s) will be removed */
  at?: Range;

  /**
   * When location is not a Range, setting this to false can prevent the
   * onChange event of the editor to fire
   *
   * @default true
   */
  shouldChange?: boolean;
}

/** Remove mark and trigger `onChange` if collapsed selection. */
export const removeMark = <V extends Value>(
  editor: TEditor<V>,
  { at, key, shouldChange = true, ...rest }: RemoveMarkOptions<V>
) => {
  const selection = at ?? editor.selection;
  key = castArray(key);

  if (selection) {
    if (Range.isRange(selection) && Range.isExpanded(selection)) {
      unsetNodes(editor, key as any as string, {
        at: selection,
        match: isText,
        split: true,
        ...rest,
      });
    } else if (editor.selection) {
      const marks: any = getMarks(editor) ?? {};
      key.forEach((k) => {
        delete marks[k];
      });
      editor.marks = marks;
      shouldChange && editor.onChange();
    }
  }
};
