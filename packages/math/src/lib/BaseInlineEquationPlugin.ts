import { createSlatePlugin } from '@udecode/plate-common';

export const BaseInlineEquationPlugin = createSlatePlugin({
  key: 'inline_equation',
  node: { isElement: true, isInline: true, isVoid: true },
});
