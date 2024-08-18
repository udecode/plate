import { createSlatePlugin } from '@udecode/plate-common';

export const InlineEquationPlugin = createSlatePlugin({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: 'inline_equation',
});
