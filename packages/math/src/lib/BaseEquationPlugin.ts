import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { InsertEquationOptions } from './transforms';

import { insertEquation } from './transforms';

import 'katex/dist/katex.min.css';

export const BaseEquationPlugin = createBasePlugin({
  key: KEYS.equation,
  node: { isElement: true, isVoid: true },
}).extendTx(({ type }) => (tx) => ({
  insert: (options?: InsertEquationOptions) =>
    insertEquation(tx, type, options),
}));
