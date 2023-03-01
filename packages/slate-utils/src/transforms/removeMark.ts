import { castArray } from 'lodash';
import { Range } from 'slate';
import { getMarks } from '../slate/editor/getMarks';
import { TEditor, Value } from '../slate/editor/TEditor';
import { isText } from '../slate/text/isText';
import { SetNodesOptions } from '../slate/transforms/setNodes';
import { unsetNodes } from '../slate/transforms/unsetNodes';

export interface RemoveMarkOptions<V extends Value = Value>
  extends Omit<SetNodesOptions<V>, 'match' | 'split'> {
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
export const removeMark = <V extends Value>(
  editor: TEditor<V>,
  { key, at, shouldChange = true, ...rest }: RemoveMarkOptions<V>
) => {
  const selection = at ?? editor.selection;
  key = castArray(key);

  if (selection) {
    if (Range.isRange(selection) && Range.isExpanded(selection)) {
      unsetNodes(editor, (key as any) as string, {
        at: selection,
        match: isText,
        split: true,
        ...rest,
      });
    } else if (editor.selection) {
      const marks = getMarks(editor) ?? {};
      key.forEach((k) => {
        delete marks[k];
      });
      editor.marks = marks;
      shouldChange && editor.onChange();
    }
  }
};
