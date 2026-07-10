import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { InsertDateOptions } from './transforms';

import { insertDate } from './transforms';

export const BaseDatePlugin = createBasePlugin({
  key: KEYS.date,
  node: {
    isElement: true,
    isInline: true,
    isVoid: true,
  },
}).extendTx(({ type }) => (tx) => ({
  insert: (options?: InsertDateOptions) => insertDate(tx, type, options),
}));
