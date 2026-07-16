import type { InferConfig, InferTx } from '@platejs/core';
import type { BaseIndentPlugin } from '@platejs/indent';
import type { EditorUpdateTransaction } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { ListStyleType, type IndentListOptions } from '../types';

export type ListEditorTransaction = EditorUpdateTransaction &
  InferTx<InferConfig<typeof BaseIndentPlugin>>;

export const indentListWithTx = (
  tx: ListEditorTransaction,
  { listStyleType = ListStyleType.Disc, ...options }: IndentListOptions = {}
) => {
  tx.indent.set({
    nodes: { at: options.at },
    offset: 1,
    setNodeProps: () => ({
      [KEYS.listType]: listStyleType,
    }),
  });
};

export const indentTodoWithTx = (
  tx: ListEditorTransaction,
  { listStyleType = ListStyleType.Disc, ...options }: IndentListOptions = {}
) => {
  tx.indent.set({
    nodes: { at: options.at },
    offset: 1,
    setNodeProps: () => ({
      [KEYS.listChecked]: false,
      [KEYS.listType]: listStyleType,
    }),
  });
};
