import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import type { InsertInlineEquationOptions } from './transforms';

import { insertInlineEquation } from './transforms';

export const BaseInlineEquationPlugin = createBasePlugin({
  key: KEYS.inlineEquation,
  schema: {
    element: {
      properties: { texExpression: property.string() },
      void: 'inline',
    },
  },
  type: NODES.inlineEquation,
  update: ({ tx, type }) => ({
    insert: (options?: InsertInlineEquationOptions) =>
      insertInlineEquation(tx, type, options),
  }),
});
