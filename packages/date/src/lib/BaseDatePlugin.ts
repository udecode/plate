import { createBasePlugin } from '@platejs/core';
import type { NodeInsertNodesOptions, Text } from '@platejs/plite';
import { property } from '@platejs/plite';
import { KEYS, type TDateElement } from '@platejs/utils';

import { normalizeDateValue } from './dateValue';

export type InsertDateOptions = NodeInsertNodesOptions<TDateElement | Text> & {
  date?: string;
};

export const BaseDatePlugin = createBasePlugin({
  key: KEYS.date,
  schema: {
    element: {
      properties: {
        date: property.string(),
        rawDate: property.string(),
      },
      void: 'inline',
    },
  },
  update: ({ tx, type }) => ({
    insert: ({ date, ...options }: InsertDateOptions = {}) => {
      tx.nodes.insert(
        [
          {
            children: [{ text: '' }],
            ...normalizeDateValue(date ?? new Date()),
            type,
          },
          { text: ' ' },
        ],
        options
      );
    },
  }),
});
