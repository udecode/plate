import castArray from 'lodash/castArray.js';

import {
  type Editor,
  type SetNodesOptions,
  type TRange,
  RangeApi,
  TextApi,
} from '../interfaces';

export interface RemoveMarkOptions
  extends Omit<SetNodesOptions, 'match' | 'split'> {
  /** Mark or the array of marks that will be removed */
  key: string[] | string;

  /** Range where the mark(s) will be removed */
  at?: TRange;

  /**
   * When location is not a Range, setting this to false can prevent the
   * onChange event of the editor to fire
   *
   * @default true
   */
  shouldChange?: boolean;
}

/** Remove mark and trigger `onChange` if collapsed selection. */
export const removeMark = (
  editor: Editor,
  { key, at, shouldChange = true, ...rest }: RemoveMarkOptions
) => {
  const selection = at ?? editor.selection;
  key = castArray(key);

  if (selection) {
    if (RangeApi.isRange(selection) && editor.api.isExpanded()) {
      editor.tf.unsetNodes(key as any, {
        at: selection,
        match: TextApi.isText,
        split: true,
        ...rest,
      });
    } else if (editor.selection) {
      const marks: any = editor.api.marks() ?? {};
      key.forEach((k) => {
        delete marks[k];
      });
      editor.marks = marks;
      shouldChange && editor.onChange();
    }
  }
};
