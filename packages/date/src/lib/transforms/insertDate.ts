import type {
  EditorUpdateTransaction,
  NodeInsertNodesOptions,
  Text,
} from '@platejs/plite';
import type { TDateElement } from '@platejs/utils';

import { normalizeDateValue } from '../utils/dateValue';

export type InsertDateOptions = NodeInsertNodesOptions<TDateElement | Text> & {
  date?: string;
};

export const insertDate = (
  tx: EditorUpdateTransaction,
  type: string,
  { date, ...options }: InsertDateOptions = {}
) => {
  const normalized = normalizeDateValue(date ?? new Date());

  tx.nodes.insert(
    [
      {
        children: [{ text: '' }],
        ...normalized,
        type,
      },
      // Keep the caret after the inline void.
      {
        text: ' ',
      },
    ],
    options
  );
};
