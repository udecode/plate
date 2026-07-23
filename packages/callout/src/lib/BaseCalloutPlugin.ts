import { createBasePlugin } from '@platejs/core';
import { property, schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { InsertCalloutOptions } from './transforms';

import { insertCallout } from './transforms';

export const BaseCalloutPlugin = createBasePlugin({
  key: KEYS.callout,
  schema: {
    element: {
      content: schema.content.any(
        [schema.content.text(), schema.content.group('inline')],
        { default: 'text', min: 1 }
      ),
      properties: {
        backgroundColor: property.string(),
        icon: property.string(),
        variant: property.string(),
      },
    },
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
