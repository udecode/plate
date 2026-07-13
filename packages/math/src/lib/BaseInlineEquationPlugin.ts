import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { InsertInlineEquationOptions } from './transforms';

import { insertInlineEquation } from './transforms';

export const BaseInlineEquationPlugin = createBasePlugin({
  key: KEYS.inlineEquation,
  node: { isElement: true, isInline: true, isVoid: true },
}).extendTx(({ type }) => (tx) => ({
  insert: (options?: InsertInlineEquationOptions) =>
    insertInlineEquation(tx, type, options),
}));
