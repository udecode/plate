import { bindFirst, createSlatePlugin, KEYS } from 'platejs';

import { insertInlineEquation } from './transforms';

export const BaseInlineEquationPlugin = createSlatePlugin({
  key: KEYS.inlineEquation,
  node: { isElement: true, isInline: true, isVoid: true },
}).extendEditorTransforms(({ editor }) => ({
  insert: {
    inlineEquation: bindFirst(insertInlineEquation, editor),
  },
}));
