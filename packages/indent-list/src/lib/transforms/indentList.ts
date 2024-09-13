import type { SlateEditor, TEditor } from '@udecode/plate-common';
import type { Location } from 'slate';

import { type SetIndentOptions, setIndent } from '@udecode/plate-indent';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
import { ListStyleType } from '../types';

export interface IndentListOptions<E extends TEditor>
  extends SetIndentOptions<E> {
  at?: Location;
  listStyleType?: ListStyleType | string;
}

/** Increase the indentation of the selected blocks. */
export const indentList = <E extends SlateEditor>(
  editor: E,
  { listStyleType = ListStyleType.Disc, ...options }: IndentListOptions<E> = {}
) => {
  setIndent(editor, {
    offset: 1,
    setNodesProps: () => ({
      [BaseIndentListPlugin.key]: listStyleType,
    }),
    ...options,
  });
};

export const indentTodo = <E extends SlateEditor>(
  editor: E,
  { listStyleType = ListStyleType.Disc, ...options }: IndentListOptions<E> = {}
) => {
  setIndent(editor, {
    offset: 1,
    setNodesProps: () => ({
      [BaseIndentListPlugin.key]: listStyleType,
      [INDENT_LIST_KEYS.checked]: false,
    }),
    ...options,
  });
};
