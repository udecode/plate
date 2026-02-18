import type { SlateEditor, TLocation } from 'platejs';

import { setIndent } from '@platejs/indent';
import { KEYS } from 'platejs';

import { ListStyleType } from '../types';

export type ListOptions = {
  at?: TLocation;
  listRestart?: number;
  listRestartPolite?: number;
  listStyleType?: ListStyleType | string;
};

/** Increase the indentation of the selected blocks. */
export const indentList = (
  editor: SlateEditor,
  { listStyleType = ListStyleType.Disc, ...options }: ListOptions = {}
) => {
  setIndent(editor, {
    offset: 1,
    setNodesProps: () => ({
      [KEYS.listType]: listStyleType,
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
      [KEYS.listChecked]: false,
      [KEYS.listType]: listStyleType,
    }),
    ...options,
  });
};
