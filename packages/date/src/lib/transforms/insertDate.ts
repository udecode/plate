import type { Element, NodeInsertNodesOptions } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

import { KEYS } from 'platejs';

import { normalizeDateValue } from '../utils/dateValue';

export interface DateElement extends Element {
  date?: string;
  rawDate?: string;
}

export type DateInsertNode = DateElement | { text: string };

export type InsertDateNodeOptions = NodeInsertNodesOptions<DateInsertNode>;

export type InsertDateOptions = InsertDateNodeOptions & {
  date?: string;
};

export const createDateNodes = (
  type: string,
  date: Date | string = new Date()
): DateInsertNode[] => {
  const normalized = normalizeDateValue(date);

  return [
    {
      children: [{ text: '' }],
      ...normalized,
      type,
    },
    // Keep focus after inserting an inline void.
    {
      text: ' ',
    },
  ];
};

export const insertDate = (
  editor: BasePlateEditor,
  { date, ...options }: InsertDateOptions = {}
) => {
  editor.update((tx) => {
    tx.nodes.insert(createDateNodes(editor.getType(KEYS.date), date), options);
  });
};
