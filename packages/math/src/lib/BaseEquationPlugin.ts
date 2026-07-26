import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { InsertEquationOptions } from './transforms';

import { insertEquation } from './transforms';

import 'katex/dist/katex.min.css';

export const BaseEquationPlugin = createBasePlugin({
  key: KEYS.equation,
  schema: {
    element: {
      properties: { texExpression: property.string() },
      void: 'block',
    },
  },
  update: ({ tx, type }) => ({
    insert: (options?: InsertEquationOptions) =>
      insertEquation(tx, type, options),
  }),
});
