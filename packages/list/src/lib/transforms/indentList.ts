import type { BaseEditor } from '@platejs/core';
import { BaseIndentPlugin } from '@platejs/indent';
import type { Location } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { ListStyleType } from '../types';

export type ListOptions = {
  at?: Location;
  listRestart?: number;
  listRestartPolite?: number;
  listStyleType?: ListStyleType | string;
};

/** Increase the indentation of the selected blocks. */
export const indentList = (
  editor: BaseEditor,
  { listStyleType = ListStyleType.Disc, ...options }: ListOptions = {}
) => {
  editor.plugin(BaseIndentPlugin).update.set({
    nodes: { at: options.at },
    offset: 1,
    setNodeProps: () => ({
      [KEYS.listType]: listStyleType,
    }),
  });
};

export const indentTodo = (
  editor: BaseEditor,
  { listStyleType = ListStyleType.Disc, ...options }: ListOptions = {}
) => {
  editor.plugin(BaseIndentPlugin).update.set({
    nodes: { at: options.at },
    offset: 1,
    setNodeProps: () => ({
      [KEYS.listChecked]: false,
      [KEYS.listType]: listStyleType,
    }),
  });
};
