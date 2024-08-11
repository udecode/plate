import type { ValueOf } from '@udecode/plate-common';
import type { PlateEditor, Value } from '@udecode/plate-common/server';
import type { Location } from 'slate';

import { type SetIndentOptions, setIndent } from '@udecode/plate-indent';

import { KEY_LIST_CHECKED, KEY_LIST_STYLE_TYPE } from '../IndentListPlugin';
import { ListStyleType } from '../types';

export interface IndentListOptions<V extends Value = Value>
  extends SetIndentOptions<V> {
  at?: Location;
  listStyleType?: ListStyleType | string;
}

/** Increase the indentation of the selected blocks. */
export const indentList = <E extends PlateEditor>(
  editor: E,
  {
    listStyleType = ListStyleType.Disc,
    ...options
  }: IndentListOptions<ValueOf<E>> = {}
) => {
  setIndent(editor, {
    offset: 1,
    setNodesProps: () => ({
      [KEY_LIST_STYLE_TYPE]: listStyleType,
    }),
    ...options,
  });
};

export const indentTodo = <E extends PlateEditor>(
  editor: E,
  {
    listStyleType = ListStyleType.Disc,
    ...options
  }: IndentListOptions<ValueOf<E>> = {}
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
