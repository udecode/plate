import { PlateEditor, Value } from '@udecode/plate-common';
import { setIndent, SetIndentOptions } from '@udecode/plate-indent';

import {
  KEY_LIST_CHECKED,
  KEY_LIST_STYLE_TYPE,
} from '../createIndentListPlugin';
import { ListStyleType } from '../types';

export interface IndentListOptions<V extends Value = Value>
  extends SetIndentOptions<V> {
  listStyleType?: ListStyleType | string;
}

/**
 * Increase the indentation of the selected blocks.
 */
export const indentList = <V extends Value>(
  editor: PlateEditor<V>,
  { listStyleType = ListStyleType.Disc, ...options }: IndentListOptions<V> = {}
) => {
  setIndent(editor, {
    offset: 1,
    setNodesProps: () => ({
      [KEY_LIST_STYLE_TYPE]: listStyleType,
    }),
    ...options,
  });
};

export const indentTodo = <V extends Value>(
  editor: PlateEditor<V>,
  { listStyleType = ListStyleType.Disc, ...options }: IndentListOptions<V> = {}
) => {
  setIndent(editor, {
    offset: 1,
    setNodesProps: () => ({
      [KEY_LIST_CHECKED]: false,
      [KEY_LIST_STYLE_TYPE]: listStyleType,
    }),
    ...options,
  });
};
