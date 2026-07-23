import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { InsertDateOptions } from './transforms';

import { insertDate } from './transforms';

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
}).extendTx(({ type }) => (tx) => ({
  insert: (options?: InsertDateOptions) => insertDate(tx, type, options),
}));
