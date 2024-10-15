import { bindFirst, createSlatePlugin } from '@udecode/plate-common';

import { insertInlineEquation } from './transforms';

export const BaseInlineEquationPlugin = createSlatePlugin({
  key: 'inline_equation',
  node: { isElement: true, isInline: true, isVoid: true },
}).extendEditorTransforms(({ editor }) => ({
  insert: {
    inlineEquation: bindFirst(insertInlineEquation, editor),
  },
}));
