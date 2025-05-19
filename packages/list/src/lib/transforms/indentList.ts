import type { SlateEditor, TLocation } from '@udecode/plate';

import { setIndent } from '@udecode/plate-indent';

import { INDENT_LIST_KEYS } from '../BaseListPlugin';
import { ListStyleType } from '../types';

export interface ListOptions {
  at?: TLocation;
  listRestart?: number;
  listRestartPolite?: number;
  listStyleType?: ListStyleType | string;
}

/** Increase the indentation of the selected blocks. */
export const indentList = (
  editor: SlateEditor,
  { listStyleType = ListStyleType.Disc, ...options }: ListOptions = {}
) => {
  setIndent(editor, {
    offset: 1,
    setNodesProps: () => ({
      [INDENT_LIST_KEYS.listStyleType]: listStyleType,
    }),
    ...options,
  });
};

export const indentTodo = (
  editor: SlateEditor,
  { listStyleType = ListStyleType.Disc, ...options }: ListOptions = {}
) => {
  setIndent(editor, {
    offset: 1,
    setNodesProps: () => ({
      [INDENT_LIST_KEYS.checked]: false,
      [INDENT_LIST_KEYS.listStyleType]: listStyleType,
    }),
    ...options,
  });
};
