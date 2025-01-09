import type { SlateEditor, TLocation } from '@udecode/plate';

import { setIndent } from '@udecode/plate-indent';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';
import { ListStyleType } from '../types';

export interface IndentListOptions {
  at?: TLocation;
  listStyleType?: ListStyleType | string;
}

/** Increase the indentation of the selected blocks. */
export const indentList = (
  editor: SlateEditor,
  { listStyleType = ListStyleType.Disc, ...options }: IndentListOptions = {}
) => {
  setIndent(editor, {
    offset: 1,
    setNodesProps: () => ({
      [BaseIndentListPlugin.key]: listStyleType,
    }),
    ...options,
  });
};

export const indentTodo = (
  editor: SlateEditor,
  { listStyleType = ListStyleType.Disc, ...options }: IndentListOptions = {}
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
