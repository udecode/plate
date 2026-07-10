import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { InsertCalloutOptions } from './transforms';

import { insertCallout } from './transforms';

export const BaseCalloutPlugin = createBasePlugin({
  key: KEYS.callout,
  node: {
    isElement: true,
  },
  rules: {
    break: {
      default: 'lineBreak',
      empty: 'reset',
      emptyLineEnd: 'deleteExit',
    },
    delete: {
      start: 'reset',
    },
  },
}).extendTx(({ type }) => (tx) => ({
  insert: (options?: InsertCalloutOptions) => insertCallout(tx, type, options),
}));
