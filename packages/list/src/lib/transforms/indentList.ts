import type { Location } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { setIndent } from '@platejs/indent';
import { KEYS } from 'platejs';

import { ListStyleType } from '../types';

export type ListOptions = {
  at?: Location;
  listRestart?: number;
  listRestartPolite?: number;
  listStyleType?: ListStyleType | string;
};

/** Increase the indentation of the selected blocks. */
export const indentList = (
  editor: BasePlateEditor,
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
  editor: BasePlateEditor,
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
